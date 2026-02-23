import { GoogleGenerativeAI } from '@google/generative-ai';
import { villages, getDistrictStats, DISTRICTS } from '../data/vidarbhaData';
import { calculateWSI, predictTankerDemand, calcPriorityScore } from '../utils/waterStressEngine';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
        },
    });
}

function buildVillageDataTable() {
    return villages.map(v => {
        const wsiCalc = calculateWSI({
            actualRainfall: v.currentRainfall,
            normalRainfall: v.avgRainfall,
            groundwaterDepth: v.groundwaterLevel,
            groundwaterTrend: v.groundwaterTrend,
            population: v.population,
            waterAvailableLPCD: Math.round(40 - (v.wsi / 5)),
        });
        return `${v.name} | ${v.district} | ${v.taluka} | Pop: ${v.population.toLocaleString()} | WSI: ${v.wsi} (${wsiCalc.riskLevel}) | RF: ${v.currentRainfall}/${v.avgRainfall}mm (${Math.round((v.currentRainfall / v.avgRainfall - 1) * 100)}%) | GW: ${v.groundwaterLevel}m (${v.groundwaterTrend}m/yr) | Tankers: ${v.tankerCount}`;
    }).join('\n');
}

function buildContext() {
    const stats = getDistrictStats();
    const criticalVillages = villages.filter(v => v.wsi > 80).sort((a, b) => b.wsi - a.wsi);
    const totalPop = villages.reduce((s, v) => s + v.population, 0);
    const avgWSI = Math.round(villages.reduce((s, v) => s + v.wsi, 0) / villages.length);
    const totalTankers = villages.reduce((s, v) => s + v.tankerCount, 0);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return `You are **JalDrushti AI** — the integrated drought intelligence assistant for the Vidarbha region of Maharashtra, India.

CURRENT DATE: ${dateStr}
CURRENT STATUS: Scarcity Cycle 2 (Jan-Mar 2026) is ACTIVE. This is the pre-summer depletion phase.

═══════════════════════════════════════
REGIONAL OVERVIEW
═══════════════════════════════════════
• Total villages monitored: ${villages.length} across ${DISTRICTS.length} districts
• Total population covered: ${totalPop.toLocaleString()}
• Regional average WSI: ${avgWSI} (${avgWSI > 60 ? 'HIGH — Regional Alert' : 'Moderate'})
• Critical villages (WSI > 80): ${criticalVillages.length}
• Active tanker deployments: ${totalTankers}
• GPS tracking: Mandatory since January 2026

═══════════════════════════════════════
WSI FORMULA (Your Calculation Engine)
═══════════════════════════════════════
WSI = (0.40 × RainfallDeviation) + (0.35 × GroundwaterDepletion) + (0.25 × PopulationDemand)
Risk: 0-30 Low | 31-60 Moderate | 61-80 High | 81-100 Critical

Priority Score = (0.55 × WSI) + (0.25 × PopFactor) + (0.20 × DistanceFactor)

═══════════════════════════════════════
DISTRICT-WISE SUMMARY
═══════════════════════════════════════
${Object.entries(stats).map(([d, s]) =>
        `📍 ${d}: ${s.total} villages | ${s.critical} critical, ${s.high} high | Avg WSI: ${s.avgWSI} | Tankers: ${s.activeTankers} | Pop: ${s.totalPop.toLocaleString()}`
    ).join('\n')}

═══════════════════════════════════════
CRITICAL VILLAGES (WSI > 80) — IMMEDIATE ATTENTION
═══════════════════════════════════════
${criticalVillages.map((v, i) =>
        `${i + 1}. ${v.name} (${v.district}, ${v.taluka}) — WSI: ${v.wsi}
   Population: ${v.population.toLocaleString()} | Groundwater: ${v.groundwaterLevel}m (trend: ${v.groundwaterTrend}m/yr)
   Rainfall: ${v.currentRainfall}/${v.avgRainfall}mm (deficit: ${Math.round((1 - v.currentRainfall / v.avgRainfall) * 100)}%)
   Tankers deployed: ${v.tankerCount} | Status: ${v.wsi > 90 ? 'EMERGENCY' : 'CRITICAL'}`
    ).join('\n')}

═══════════════════════════════════════
COMPLETE VILLAGE DATABASE
═══════════════════════════════════════
${buildVillageDataTable()}

═══════════════════════════════════════
VIDARBHA DROUGHT CONTEXT
═══════════════════════════════════════
• 90% of water conservation structures in Nagpur & Amravati are non-functional
• 398.87 million m³/year diverted from agriculture to thermal power plants (Koradi, Khaparkheda)
• 47% of KT Weirs and Kolhapur-type structures are non-functional
• Government allocated ₹41.5 crore for drinking water scarcity in 2026, ₹21 crore for Vidarbha
• Maharashtra follows 3-cycle scarcity plan: Cycle 1 (Oct-Dec), Cycle 2 (Jan-Mar), Cycle 3 (Apr-Jun)
• Paisewari system used for agricultural assessment — villages with Paisewari < 50 are drought-affected
• NRDWP standard: 55 LPCD for rural areas, 135 LPCD for urban
• 9-step contingency protocol: Tanker deployment is Step 9 (LAST RESORT)
• Preceding steps: well deepening → repairs → temporary pipelines → private well acquisition → Doha structures → borewells → bulk transport → irrigation diversion

═══════════════════════════════════════
YOUR RESPONSE GUIDELINES
═══════════════════════════════════════
1. ALWAYS use specific village names, WSI scores, and numbers from the data above
2. Format responses with markdown headers (##), bullet points, and bold for key numbers
3. When discussing villages, mention district, WSI, population, and tanker status
4. For predictions, explain your reasoning based on rainfall trends and groundwater decline
5. Compare to NRDWP standards (55 LPCD) when discussing water availability
6. Reference the 9-step contingency protocol — tankers are last resort
7. When asked about budgets, reference the ₹41.5 crore allocation
8. Keep responses focused, data-driven, and actionable
9. For district queries, provide all villages in that district with key metrics
10. Always end recommendations with one specific, actionable next step`;
}

export async function chatWithAI(userMessage, chatHistory = []) {
    if (!model) {
        return getFallbackResponse(userMessage);
    }
    try {
        const chat = model.startChat({
            history: chatHistory.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
            systemInstruction: buildContext(),
        });
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
    } catch (err) {
        console.error('Gemini API error:', err);
        return getFallbackResponse(userMessage);
    }
}

export async function generateBriefing() {
    if (!model) {
        const criticalVillages = villages.filter(v => v.wsi > 80).sort((a, b) => b.wsi - a.wsi);
        const totalTankers = villages.reduce((s, v) => s + v.tankerCount, 0);
        return `## Daily Drought Briefing — Vidarbha\n\n**Top 3 Critical Villages:**\n${criticalVillages.slice(0, 3).map((v, i) => `${i + 1}. **${v.name}** (${v.district}) — WSI: ${v.wsi}, ${v.tankerCount} tankers`).join('\n')}\n\n**Regional Status:** ${villages.filter(v => v.wsi > 80).length} villages in critical state. ${totalTankers} tankers deployed across Vidarbha.\n\n**Recommended Action:** Fast-track private well acquisition under Step 4 for villages with WSI > 90 to reduce tanker dependency.`;
    }
    const prompt = `Generate a concise daily drought situation briefing for the Vidarbha region as of today. Structure it with:

## 📋 Daily Drought Briefing

1. **Top 3 Critical Villages** — name, district, WSI score, and key concern
2. **Regional Status** — how many villages are critical, tanker deployment summary
3. **Weather Outlook** — current impact of dry conditions
4. **Recommended Action** — one specific, actionable step for district authorities

Keep it under 250 words. Use actual village data.`;
    return chatWithAI(prompt);
}

function getFallbackResponse(query) {
    const q = query.toLowerCase();
    const stats = getDistrictStats();
    const criticalVillages = villages.filter(v => v.wsi > 80).sort((a, b) => b.wsi - a.wsi);
    const totalTankers = villages.reduce((s, v) => s + v.tankerCount, 0);
    const avgWSI = Math.round(villages.reduce((s, v) => s + v.wsi, 0) / villages.length);

    // Check for specific district queries
    for (const district of DISTRICTS) {
        if (q.includes(district.toLowerCase())) {
            const s = stats[district];
            if (!s) continue;
            const dVillages = villages.filter(v => v.district === district);
            return `## ${district} District — Drought Analysis\n\n**Overview:**\n- Villages monitored: **${s.total}**\n- Critical: **${s.critical}** | High Risk: **${s.high}** | Moderate: **${s.moderate}** | Low: **${s.low}**\n- Average WSI: **${s.avgWSI}**\n- Active tankers: **${s.activeTankers}**\n- Population covered: **${s.totalPop.toLocaleString()}**\n\n**Village Details:**\n${dVillages.sort((a, b) => b.wsi - a.wsi).map(v =>
                `- **${v.name}** (${v.taluka}): WSI ${v.wsi} • Pop ${v.population.toLocaleString()} • GW ${v.groundwaterLevel}m • RF ${v.currentRainfall}/${v.avgRainfall}mm • ${v.tankerCount > 0 ? v.tankerCount + ' tankers' : 'No tankers'}`
            ).join('\n')}\n\n**Recommended Action:** ${s.critical > 0 ? `Prioritize tanker deployment to ${dVillages.filter(v => v.wsi > 80)[0]?.name || 'critical villages'} and fast-track Step 4 (private well acquisition).` : 'Continue monitoring; no immediate emergency action required.'}`;
        }
    }

    // Check for specific village queries
    for (const village of villages) {
        if (q.includes(village.name.toLowerCase())) {
            const wsiCalc = calculateWSI({
                actualRainfall: village.currentRainfall,
                normalRainfall: village.avgRainfall,
                groundwaterDepth: village.groundwaterLevel,
                groundwaterTrend: village.groundwaterTrend,
                population: village.population,
                waterAvailableLPCD: 30,
            });
            return `## ${village.name} — Detailed Assessment\n\n**Location:** ${village.taluka} Taluka, ${village.district} District\n**Population:** ${village.population.toLocaleString()}\n\n### WSI Breakdown (Score: ${village.wsi})\n| Component | Raw Score | Weight | Weighted |\n|-----------|-----------|--------|----------|\n| Rainfall Deviation | ${wsiCalc.breakdown.rainfall.score}/100 | 0.40 | ${wsiCalc.breakdown.rainfall.weighted} |\n| Groundwater Depletion | ${wsiCalc.breakdown.groundwater.score}/100 | 0.35 | ${wsiCalc.breakdown.groundwater.weighted} |\n| Population Demand | ${wsiCalc.breakdown.population.score}/100 | 0.25 | ${wsiCalc.breakdown.population.weighted} |\n\n**Risk Level:** ${wsiCalc.riskLevel}\n\n**Key Metrics:**\n- Rainfall: ${village.currentRainfall}mm vs normal ${village.avgRainfall}mm (deficit: ${Math.round((1 - village.currentRainfall / village.avgRainfall) * 100)}%)\n- Groundwater: ${village.groundwaterLevel}m depth, declining at ${village.groundwaterTrend}m/year\n- Tankers: ${village.tankerCount} active\n\n**Recommendation:** ${village.wsi > 80 ? 'EMERGENCY — Increase tanker deployment and initiate Step 6 (borewell drilling) alongside continued tanker supply.' : village.wsi > 60 ? 'HIGH ALERT — Pre-position tankers and activate Step 4 (private well acquisition).' : 'Monitor closely. No immediate intervention required.'}`;
        }
    }

    if (q.includes('critical') || q.includes('worst') || q.includes('emergency') || q.includes('risk')) {
        return `## Critical Villages — Emergency Dashboard\n\n${criticalVillages.slice(0, 8).map((v, i) =>
            `${i + 1}. **${v.name}** (${v.district}) — WSI: **${v.wsi}** | Pop: ${v.population.toLocaleString()} | GW: ${v.groundwaterLevel}m | Tankers: ${v.tankerCount}`
        ).join('\n')}\n\n**Total critical villages:** ${criticalVillages.length}\n**Total tankers deployed:** ${totalTankers}\n\n**Immediate Action:** Fast-track Step 4 (private well acquisition) for all villages with WSI > 90 to reduce tanker dependency before Cycle 3 (April).`;
    }

    if (q.includes('tanker') || q.includes('demand') || q.includes('supply')) {
        return `## Tanker Deployment Status\n\n- **Active Tankers:** ${totalTankers} across Vidarbha\n- **Villages with tankers:** ${villages.filter(v => v.tankerCount > 0).length} / ${villages.length}\n- **Villages needing tankers:** ${villages.filter(v => v.wsi > 70 && v.tankerCount < 2).length}\n\n**Deployment by District:**\n${Object.entries(stats).filter(([_, s]) => s.activeTankers > 0).sort((a, b) => b[1].activeTankers - a[1].activeTankers).map(([d, s]) =>
            `- **${d}:** ${s.activeTankers} tankers serving ${s.total} villages (Avg WSI: ${s.avgWSI})`
        ).join('\n')}\n\n**Demand Forecast:** Expected 15-20% increase over next 4 weeks as temperatures rise. Cycle 3 (Apr-Jun) will require approximately 2x current deployment.\n\n**Recommended Action:** Pre-position 10 additional tankers in Amravati and Yavatmal districts for March deployment.`;
    }

    if (q.includes('wsi') || q.includes('formula') || q.includes('stress') || q.includes('index')) {
        return `## Water Stress Index (WSI) Explained\n\n**Formula:**\n\`\`\`\nWSI = (0.40 × RainfallDeviation) + (0.35 × GroundwaterDepletion) + (0.25 × PopulationDemand)\n\`\`\`\n\n| Risk Level | WSI Range | Action Required |\n|------------|-----------|----------------|\n| 🟢 Low | 0–30 | Routine monitoring |\n| 🟡 Moderate | 31–60 | Increased surveillance |\n| 🟠 High | 61–80 | Pre-position tankers, activate Step 4 |\n| 🔴 Critical | 81–100 | Emergency — full tanker deployment |\n\n**Current Regional Distribution:**\n- Low: ${villages.filter(v => v.wsi <= 30).length} villages\n- Moderate: ${villages.filter(v => v.wsi > 30 && v.wsi <= 60).length} villages\n- High: ${villages.filter(v => v.wsi > 60 && v.wsi <= 80).length} villages\n- Critical: ${criticalVillages.length} villages\n\n**Regional Average WSI:** ${avgWSI}`;
    }

    return `## Vidarbha Drought Intelligence Report\n\n**Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n**Scarcity Cycle:** Cycle 2 (Jan-Mar 2026) — Active\n\n**Regional Summary:**\n- ${villages.length} villages monitored across ${DISTRICTS.length} districts\n- ${criticalVillages.length} villages in critical state (WSI > 80)\n- Regional average WSI: **${avgWSI}**\n- ${totalTankers} tankers deployed\n- Population at risk: ${villages.filter(v => v.wsi > 60).reduce((s, v) => s + v.population, 0).toLocaleString()}\n\n**Most Affected:**\n${criticalVillages.slice(0, 3).map(v => `- **${v.name}** (${v.district}): WSI ${v.wsi}`).join('\n')}\n\n**Ask me about:**\n- Specific village analysis (e.g., "Tell me about Pusad")\n- District overviews (e.g., "Amravati district status")\n- Tanker demand forecast\n- WSI formula explanation\n- Intervention recommendations`;
}

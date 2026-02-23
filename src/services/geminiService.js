import { GoogleGenerativeAI } from '@google/generative-ai';
import { villages, getDistrictStats } from '../data/vidarbhaData';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY && API_KEY !== 'your_gemini_api_key') {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

function buildContext() {
    const stats = getDistrictStats();
    const criticalVillages = villages.filter(v => v.wsi > 80);
    return `You are JalDrushti AI — an expert drought analyst for the Vidarbha region of Maharashtra, India.
Current Date: February 2026. The region is in a severe water scarcity cycle.

DISTRICT SUMMARY:
${Object.entries(stats).map(([d, s]) => `${d}: ${s.total} villages monitored, ${s.critical} critical, Avg WSI: ${s.avgWSI}, Active Tankers: ${s.activeTankers}, Population: ${s.totalPop.toLocaleString()}`).join('\n')}

CRITICAL VILLAGES (WSI > 80):
${criticalVillages.map(v => `${v.name} (${v.district}) — WSI: ${v.wsi}, Pop: ${v.population.toLocaleString()}, GW Level: ${v.groundwaterLevel}m, GW Trend: ${v.groundwaterTrend}m/yr, Rainfall: ${v.currentRainfall}/${v.avgRainfall}mm, Tankers: ${v.tankerCount}`).join('\n')}

KEY FACTS:
- 90% of water conservation structures in Nagpur & Amravati are non-functional
- 398.87 million m³/year diverted from agriculture to thermal power plants
- WSI Formula: 0.4×rainfall_deviation + 0.35×groundwater_depletion + 0.25×population_demand
- Risk: 0-30 Low, 31-60 Moderate, 61-80 High, 81-100 Critical
- Government allocated ₹41.5 crore for drinking water scarcity, ₹21 crore for Vidarbha
- GPS tracking mandatory for all tanker operations since Jan 2026

Respond with data-driven insights. Use specific village names, WSI scores, and numbers. Format with bullet points and headers when appropriate. Keep responses concise but actionable.`;
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
    const prompt = 'Generate a brief daily drought situation report for Vidarbha as of today. Include top 3 most critical villages, tanker deployment status, and one recommended action for district authorities. Keep it under 200 words.';
    return chatWithAI(prompt);
}

function getFallbackResponse(query) {
    const q = query.toLowerCase();
    const stats = getDistrictStats();
    const criticalVillages = villages.filter(v => v.wsi > 80);

    if (q.includes('critical') || q.includes('risk') || q.includes('worst')) {
        return `## Critical Villages in Vidarbha\n\n${criticalVillages.slice(0, 5).map(v =>
            `- **${v.name}** (${v.district}): WSI ${v.wsi}, Population ${v.population.toLocaleString()}, ${v.tankerCount} tankers active`
        ).join('\n')}\n\nTotal critical villages: **${criticalVillages.length}** across Vidarbha region. Immediate intervention recommended for villages with WSI > 90.`;
    }
    if (q.includes('tanker') || q.includes('demand')) {
        const totalTankers = villages.reduce((s, v) => s + v.tankerCount, 0);
        return `## Tanker Deployment Status\n\n- **Active Tankers**: ${totalTankers}\n- **Villages Served**: ${villages.filter(v => v.tankerActive).length}\n- **Predicted demand increase**: 15-20% over next 4 weeks\n\nPriority districts: Amravati (${stats.Amravati?.activeTankers || 0} tankers), Yavatmal (${stats.Yavatmal?.activeTankers || 0} tankers), Washim (${stats.Washim?.activeTankers || 0} tankers)`;
    }
    if (q.includes('nagpur')) {
        const s = stats.Nagpur;
        return `## Nagpur District Overview\n\n- Villages monitored: **${s?.total || 0}**\n- Critical: **${s?.critical || 0}**, High Risk: **${s?.high || 0}**\n- Average WSI: **${s?.avgWSI || 0}**\n- Active tankers: **${s?.activeTankers || 0}**\n- Population covered: **${s?.totalPop?.toLocaleString() || 0}**`;
    }
    return `## Vidarbha Drought Analysis\n\n- **Total villages monitored**: ${villages.length}\n- **Critical villages (WSI>80)**: ${criticalVillages.length}\n- **Active tanker deployments**: ${villages.reduce((s, v) => s + v.tankerCount, 0)}\n- **Most affected districts**: Amravati, Yavatmal, Washim\n- **Average regional WSI**: ${Math.round(villages.reduce((s, v) => s + v.wsi, 0) / villages.length)}\n\n*For detailed AI analysis, please configure your Gemini API key in the .env file.*`;
}

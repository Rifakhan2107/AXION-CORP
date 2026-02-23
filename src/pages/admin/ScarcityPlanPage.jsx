import { villages, DISTRICTS, getDistrictStats, getRiskLabel } from '../../data/vidarbhaData';
import { calculateWSI, calcPriorityScore } from '../../utils/waterStressEngine';
import { Calendar, CheckCircle, Clock, AlertTriangle, FileText, Target } from 'lucide-react';

const scarcityCycles = [
    { cycle: 'Cycle 1', period: 'Oct — Dec 2025', deadline: 'Nov 15, 2025', objective: 'Post-monsoon stressed area identification & source strengthening', status: 'completed', color: 'var(--accent-green)' },
    { cycle: 'Cycle 2', period: 'Jan — Mar 2026', deadline: 'Dec 20, 2025', objective: 'Pre-emptive measures for early summer depletion. Private well acquisition within 1km radius.', status: 'active', color: 'var(--accent-blue)' },
    { cycle: 'Cycle 3', period: 'Apr — Jun 2026', deadline: 'Jan 20, 2026', objective: 'Full-scale tanker deployment & temporary high-cost pipeline installations', status: 'upcoming', color: 'var(--accent-orange)' },
];

const contingencyMeasures = [
    { id: 1, measure: 'Deepening of existing wells', priority: 1, status: 'Active' },
    { id: 2, measure: 'Repair of existing water supply schemes', priority: 2, status: 'Active' },
    { id: 3, measure: 'Installation of temporary pipelines', priority: 3, status: 'Planned' },
    { id: 4, measure: 'Acquisition of private wells (within 1km)', priority: 4, status: 'Active' },
    { id: 5, measure: 'Construction of temporary Doha structures', priority: 5, status: 'Planned' },
    { id: 6, measure: 'New borewell drilling', priority: 6, status: 'Active' },
    { id: 7, measure: 'Bulk water transport from surplus areas', priority: 7, status: 'Planned' },
    { id: 8, measure: 'Diversion of water from irrigation sources', priority: 8, status: 'Planned' },
    { id: 9, measure: 'Water tanker deployment (LAST RESORT)', priority: 9, status: 'Active' },
];

export default function ScarcityPlanPage() {
    const stats = getDistrictStats();

    // Demonstrate live WSI calc for a sample village
    const sampleVillage = villages[6]; // Chandur Bazar
    const liveWSI = calculateWSI({
        actualRainfall: sampleVillage.currentRainfall,
        normalRainfall: sampleVillage.avgRainfall,
        groundwaterDepth: sampleVillage.groundwaterLevel,
        groundwaterTrend: sampleVillage.groundwaterTrend,
        population: sampleVillage.population,
        waterAvailableLPCD: 25,
    });

    const districtBudget = [
        { district: 'Nagpur', allocated: 450, spent: 320, villages: stats.Nagpur?.total || 0 },
        { district: 'Amravati', allocated: 620, spent: 580, villages: stats.Amravati?.total || 0 },
        { district: 'Yavatmal', allocated: 520, spent: 490, villages: stats.Yavatmal?.total || 0 },
        { district: 'Washim', allocated: 380, spent: 360, villages: stats.Washim?.total || 0 },
        { district: 'Akola', allocated: 340, spent: 310, villages: stats.Akola?.total || 0 },
        { district: 'Chandrapur', allocated: 280, spent: 210, villages: stats.Chandrapur?.total || 0 },
        { district: 'Gadchiroli', allocated: 220, spent: 170, villages: stats.Gadchiroli?.total || 0 },
        { district: 'Wardha', allocated: 310, spent: 270, villages: stats.Wardha?.total || 0 },
        { district: 'Buldhana', allocated: 350, spent: 300, villages: stats.Buldhana?.total || 0 },
        { district: 'Bhandara', allocated: 180, spent: 120, villages: stats.Bhandara?.total || 0 },
        { district: 'Gondia', allocated: 150, spent: 90, villages: stats.Gondia?.total || 0 },
    ];

    return (
        <div>
            <div className="page-header">
                <div><h1>Scarcity Action Plan 2025-26</h1><p className="subtitle">Maharashtra Drought Management Framework — 3-Cycle Approach</p></div>
            </div>

            {/* Cycle Timeline */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
                {scarcityCycles.map((c, i) => (
                    <div key={i} className="glass-card" style={{ padding: 24, borderTop: `3px solid ${c.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h3 style={{ fontSize: '1rem' }}>{c.cycle}</h3>
                            <span className="badge" style={{
                                background: c.status === 'completed' ? 'rgba(52,211,153,0.15)' : c.status === 'active' ? 'rgba(0,212,255,0.15)' : 'rgba(251,146,60,0.15)',
                                color: c.color
                            }}>
                                {c.status === 'completed' ? <><CheckCircle size={10} /> Done</> : c.status === 'active' ? <><Clock size={10} /> Active</> : <><Calendar size={10} /> Upcoming</>}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', marginBottom: 8 }}>{c.period}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Deadline: {c.deadline}</div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.objective}</p>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* WSI Calculation Breakdown */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>📊 Live WSI Calculation — {sampleVillage.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                        WSI = (0.40 × Rainfall) + (0.35 × Groundwater) + (0.25 × Population)
                    </p>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.82rem' }}>🌧️ Rainfall Deviation</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{liveWSI.breakdown.rainfall.score}/100 × 0.40 = <span style={{ color: 'var(--accent-orange)' }}>{liveWSI.breakdown.rainfall.weighted}</span></span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 4 }}>
                            <div style={{ height: '100%', width: `${liveWSI.breakdown.rainfall.score}%`, background: 'var(--gradient-warm)', borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Actual: {sampleVillage.currentRainfall}mm / Normal: {sampleVillage.avgRainfall}mm ({Math.round((sampleVillage.currentRainfall / sampleVillage.avgRainfall - 1) * 100)}%)
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.82rem' }}>💧 Groundwater Depletion</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{liveWSI.breakdown.groundwater.score}/100 × 0.35 = <span style={{ color: 'var(--accent-red)' }}>{liveWSI.breakdown.groundwater.weighted}</span></span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 4 }}>
                            <div style={{ height: '100%', width: `${liveWSI.breakdown.groundwater.score}%`, background: 'linear-gradient(90deg, #f87171, #dc2626)', borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Depth: {sampleVillage.groundwaterLevel}m · Trend: {sampleVillage.groundwaterTrend}m/yr · Critical: 15m
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.82rem' }}>👥 Population Demand</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{liveWSI.breakdown.population.score}/100 × 0.25 = <span style={{ color: 'var(--accent-purple)' }}>{liveWSI.breakdown.population.weighted}</span></span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 4 }}>
                            <div style={{ height: '100%', width: `${liveWSI.breakdown.population.score}%`, background: 'var(--gradient-accent)', borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Population: {sampleVillage.population.toLocaleString()} · Water: ~25 LPCD (target: 55 LPCD)
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-primary)', color: liveWSI.riskColor }}>{liveWSI.wsi}</div>
                        <div style={{ fontSize: '0.85rem', color: liveWSI.riskColor, fontWeight: 600 }}>{liveWSI.riskLevel} Risk</div>
                    </div>
                </div>

                {/* Contingency measures */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>📋 9-Step Contingency Protocol</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                        As per Maharashtra Drought Manual — tanker is the LAST resort (Step 9)
                    </p>
                    {contingencyMeasures.map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                background: m.id === 9 ? 'rgba(248,113,113,0.2)' : 'var(--bg-secondary)',
                                color: m.id === 9 ? 'var(--accent-red)' : 'var(--text-secondary)'
                            }}>{m.id}</div>
                            <div style={{ flex: 1, fontSize: '0.85rem', color: m.id === 9 ? 'var(--accent-red)' : 'var(--text-primary)', fontWeight: m.id === 9 ? 600 : 400 }}>{m.measure}</div>
                            <span className="badge" style={{
                                background: m.status === 'Active' ? 'rgba(0,212,255,0.15)' : 'rgba(100,116,139,0.15)',
                                color: m.status === 'Active' ? 'var(--accent-blue)' : 'var(--text-muted)'
                            }}>{m.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* District budget table */}
            <div className="glass-card" style={{ overflow: 'auto' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
                    <h3 style={{ fontSize: '0.95rem' }}>💰 District-wise Budget Allocation — Scarcity Relief (₹ Lakhs)</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>District</th><th>Villages</th><th>Allocated (₹L)</th><th>Spent (₹L)</th><th>Utilization</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {districtBudget.map(d => {
                            const util = Math.round(d.spent / d.allocated * 100);
                            return (
                                <tr key={d.district}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.district}</td>
                                    <td>{d.villages}</td>
                                    <td>₹{d.allocated}L</td>
                                    <td>₹{d.spent}L</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                                                <div style={{ height: '100%', width: `${util}%`, borderRadius: 3, background: util > 90 ? '#f87171' : util > 70 ? '#fb923c' : '#34d399' }} />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: util > 90 ? '#f87171' : 'var(--text-secondary)' }}>{util}%</span>
                                        </div>
                                    </td>
                                    <td><span className="badge" style={{ background: util > 90 ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)', color: util > 90 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{util > 90 ? 'Over-budget' : 'On-track'}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Cloud, Droplets, Wallet } from 'lucide-react';
import { rainfallHistory, groundwaterTrend, demandForecast, villages, getDistrictStats } from '../../data/vidarbhaData';

export default function AnalyticsPage() {
    const stats = getDistrictStats();
    const districtWSI = Object.entries(stats).map(([name, s]) => ({ name, avgWSI: s.avgWSI, critical: s.critical, total: s.total })).sort((a, b) => b.avgWSI - a.avgWSI);

    const budgetData = [
        { district: 'Nagpur', allocated: 450, spent: 320 },
        { district: 'Amravati', allocated: 620, spent: 580 },
        { district: 'Yavatmal', allocated: 520, spent: 490 },
        { district: 'Washim', allocated: 380, spent: 360 },
        { district: 'Akola', allocated: 340, spent: 310 },
        { district: 'Chandrapur', allocated: 280, spent: 210 },
    ];

    return (
        <div>
            <div className="page-header">
                <div><h1>Predictive Analytics</h1><p className="subtitle">AI-powered drought forecasting & demand estimation</p></div>
            </div>

            <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="kpi-card blue">
                    <div className="kpi-icon"><TrendingUp size={24} /></div>
                    <div className="kpi-value">78</div>
                    <div className="kpi-label">Predicted Tanker Demand (Week 6)</div>
                </div>
                <div className="kpi-card orange">
                    <div className="kpi-icon"><Cloud size={24} /></div>
                    <div className="kpi-value">-34%</div>
                    <div className="kpi-label">Rainfall Deviation (Cumulative)</div>
                </div>
                <div className="kpi-card purple">
                    <div className="kpi-icon"><Droplets size={24} /></div>
                    <div className="kpi-value">13.2m</div>
                    <div className="kpi-label">Avg Groundwater Depth</div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon"><Wallet size={24} /></div>
                    <div className="kpi-value">₹21 Cr</div>
                    <div className="kpi-label">Vidarbha Relief Budget</div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="chart-container">
                    <h3>📈 Predicted Tanker Demand (Next 6 Weeks)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={demandForecast}>
                            <defs>
                                <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Legend />
                            <Area type="monotone" dataKey="predicted" stroke="#a855f7" fill="url(#gPred)" strokeWidth={2} name="Predicted" />
                            <Line type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} name="Actual" connectNulls={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>🏘️ District WSI Comparison</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={districtWSI} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={80} />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Bar dataKey="avgWSI" name="Avg WSI" radius={[0, 4, 4, 0]}
                                fill="#fb923c" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2">
                <div className="chart-container">
                    <h3>🌧️ Year-over-Year Rainfall Comparison</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={rainfallHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Legend />
                            <Line type="monotone" dataKey="normal" stroke="#64748b" strokeDasharray="5 5" name="Normal" />
                            <Line type="monotone" dataKey="year2023" stroke="#22d3ee" strokeWidth={1.5} name="2023-24" />
                            <Line type="monotone" dataKey="year2024" stroke="#a855f7" strokeWidth={1.5} name="2024-25" />
                            <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={2.5} name="2025-26" dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>💰 Budget Allocation vs Spending (₹ Lakhs)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={budgetData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="district" stroke="#64748b" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Legend />
                            <Bar dataKey="allocated" fill="#334155" name="Allocated" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="spent" fill="#00d4ff" name="Spent" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

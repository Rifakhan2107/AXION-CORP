import { useState, useEffect } from 'react';
import { MapPin, Truck, AlertTriangle, Droplets, TrendingDown, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { villages, rainfallHistory, groundwaterTrend, getRiskLevel, getRiskLabel, getDistrictStats } from '../../data/vidarbhaData';
import { generateBriefing } from '../../services/geminiService';

const COLORS = { low: '#34d399', moderate: '#fbbf24', high: '#fb923c', critical: '#f87171' };

export default function OverviewPage() {
    const [briefing, setBriefing] = useState('Loading AI briefing...');
    const stats = getDistrictStats();
    const totalPop = villages.reduce((s, v) => s + v.population, 0);
    const criticalCount = villages.filter(v => v.wsi > 80).length;
    const activeTankers = villages.reduce((s, v) => s + v.tankerCount, 0);
    const avgWSI = Math.round(villages.reduce((s, v) => s + v.wsi, 0) / villages.length);

    const riskDistribution = [
        { name: 'Low', value: villages.filter(v => v.wsi <= 30).length, color: COLORS.low },
        { name: 'Moderate', value: villages.filter(v => v.wsi > 30 && v.wsi <= 60).length, color: COLORS.moderate },
        { name: 'High', value: villages.filter(v => v.wsi > 60 && v.wsi <= 80).length, color: COLORS.high },
        { name: 'Critical', value: villages.filter(v => v.wsi > 80).length, color: COLORS.critical },
    ];

    useEffect(() => {
        generateBriefing().then(setBriefing).catch(() => setBriefing('AI briefing unavailable.'));
    }, []);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p className="subtitle">Vidarbha Region — February 2026</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                    Live Data
                </div>
            </div>

            <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="kpi-card blue">
                    <div className="kpi-icon"><MapPin size={24} /></div>
                    <div className="kpi-value">{villages.length}</div>
                    <div className="kpi-label">Villages Monitored</div>
                    <div className="kpi-change up">↑ Across 11 districts</div>
                </div>
                <div className="kpi-card orange">
                    <div className="kpi-icon"><AlertTriangle size={24} /></div>
                    <div className="kpi-value">{criticalCount}</div>
                    <div className="kpi-label">Critical Villages</div>
                    <div className="kpi-change down">↑ WSI {'>'} 80</div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon"><Truck size={24} /></div>
                    <div className="kpi-value">{activeTankers}</div>
                    <div className="kpi-label">Active Tankers</div>
                    <div className="kpi-change up">GPS tracked</div>
                </div>
                <div className="kpi-card purple">
                    <div className="kpi-icon"><Droplets size={24} /></div>
                    <div className="kpi-value">{avgWSI}</div>
                    <div className="kpi-label">Avg Water Stress Index</div>
                    <div className="kpi-change down">↑ Regional average</div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="chart-container" style={{ height: 440 }}>
                    <h3>🗺️ Village Risk Map — Vidarbha</h3>
                    <div className="map-container" style={{ height: 380 }}>
                        <MapContainer center={[20.8, 78.5]} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
                            {villages.map(v => (
                                <CircleMarker key={v.id} center={[v.lat, v.lng]} radius={8 + v.wsi / 15}
                                    pathOptions={{ fillColor: COLORS[getRiskLevel(v.wsi)], color: COLORS[getRiskLevel(v.wsi)], fillOpacity: 0.7, weight: 1 }}>
                                    <Popup>
                                        <div style={{ color: '#333', minWidth: 180 }}>
                                            <strong style={{ fontSize: 14 }}>{v.name}</strong><br />
                                            <span style={{ fontSize: 12 }}>
                                                {v.district} · {v.taluka}<br />
                                                WSI: <strong>{v.wsi}</strong> ({getRiskLabel(v.wsi)})<br />
                                                Population: {v.population.toLocaleString()}<br />
                                                Groundwater: {v.groundwaterLevel}m (trend: {v.groundwaterTrend}m/yr)<br />
                                                Rainfall: {v.currentRainfall}/{v.avgRainfall}mm<br />
                                                Tankers: {v.tankerCount > 0 ? `${v.tankerCount} active` : 'None'}
                                            </span>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="chart-container" style={{ flex: 1 }}>
                        <h3>📊 Risk Distribution</h3>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                                    {riskDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="glass-card" style={{ padding: 20, flex: 1 }}>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            🤖 AI Daily Briefing
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                            {briefing}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="chart-container">
                    <h3>🌧️ Rainfall: Normal vs Actual (2025-26)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={rainfallHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Legend />
                            <Bar dataKey="normal" fill="#334155" name="Normal" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" fill="#00d4ff" name="Actual 2025-26" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-container">
                    <h3>💧 Groundwater Depth Trend (metres)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={groundwaterTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} reversed />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Line type="monotone" dataKey="level" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 4 }} name="Depth (m)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

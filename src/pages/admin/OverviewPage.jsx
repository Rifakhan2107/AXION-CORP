import { useState, useEffect } from 'react';
import { MapPin, Truck, AlertTriangle, Droplets, Cloud, Users, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { villages, rainfallHistory, groundwaterTrend, getRiskLevel, getRiskLabel, getDistrictStats } from '../../data/vidarbhaData';
import { generateBriefing } from '../../services/geminiService';
import { getAllDistrictWeather } from '../../services/weatherService';

const COLORS = { low: '#34d399', moderate: '#fbbf24', high: '#fb923c', critical: '#f87171' };

function renderBriefingMd(text) {
    if (!text) return '';
    return text
        .replace(/### (.*)/g, '<div style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin:10px 0 4px">$1</div>')
        .replace(/## (.*)/g, '<div style="font-size:0.88rem;font-weight:700;color:var(--accent-blue);margin:10px 0 6px">$1</div>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
        .replace(/^\d+\.\s+(.*)/gm, '<div style="display:flex;gap:6px;margin:2px 0;padding-left:4px"><span style="color:var(--accent-purple);font-weight:600;flex-shrink:0">•</span><span>$1</span></div>')
        .replace(/^- (.*)/gm, '<div style="display:flex;gap:6px;margin:2px 0;padding-left:4px"><span style="color:var(--accent-blue)">•</span><span>$1</span></div>')
        .replace(/\n\n/g, '<div style="height:8px"></div>')
        .replace(/\n/g, '<br/>');
}

export default function OverviewPage() {
    const [briefing, setBriefing] = useState('Loading AI briefing...');
    const [weather, setWeather] = useState(null);
    const stats = getDistrictStats();
    const totalPop = villages.reduce((s, v) => s + v.population, 0);
    const criticalCount = villages.filter(v => v.wsi > 80).length;
    const highCount = villages.filter(v => v.wsi > 60 && v.wsi <= 80).length;
    const activeTankers = villages.reduce((s, v) => s + v.tankerCount, 0);
    const avgWSI = Math.round(villages.reduce((s, v) => s + v.wsi, 0) / villages.length);

    const riskDistribution = [
        { name: 'Low (0-30)', value: villages.filter(v => v.wsi <= 30).length, color: COLORS.low },
        { name: 'Moderate (31-60)', value: villages.filter(v => v.wsi > 30 && v.wsi <= 60).length, color: COLORS.moderate },
        { name: 'High (61-80)', value: villages.filter(v => v.wsi > 60 && v.wsi <= 80).length, color: COLORS.high },
        { name: 'Critical (81+)', value: villages.filter(v => v.wsi > 80).length, color: COLORS.critical },
    ];

    const topCritical = villages.filter(v => v.wsi > 80).sort((a, b) => b.wsi - a.wsi).slice(0, 5);

    useEffect(() => {
        generateBriefing().then(setBriefing).catch(() => setBriefing('AI briefing unavailable.'));
        getAllDistrictWeather().then(setWeather).catch(() => { });
    }, []);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p className="subtitle">Vidarbha Region — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                    Live Data
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
                <div className="kpi-card blue">
                    <div className="kpi-icon"><MapPin size={24} /></div>
                    <div className="kpi-value">{villages.length}</div>
                    <div className="kpi-label">Villages Monitored</div>
                    <div className="kpi-change up">Across 11 districts</div>
                </div>
                <div className="kpi-card orange">
                    <div className="kpi-icon"><AlertTriangle size={24} /></div>
                    <div className="kpi-value">{criticalCount}</div>
                    <div className="kpi-label">Critical Villages</div>
                    <div className="kpi-change down">WSI {'>'} 80</div>
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
                    <div className="kpi-label">Avg WSI</div>
                    <div className="kpi-change down">Regional average</div>
                </div>
            </div>

            {/* Live Weather Strip */}
            {weather && (
                <div className="glass-card" style={{ padding: '10px 20px', marginBottom: 20, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 12, minWidth: 'fit-content', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <Cloud size={13} /> Live Weather
                        </div>
                        {Object.entries(weather).map(([district, w]) => (
                            <div key={district} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '3px 8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                <img src={`https://openweathermap.org/img/wn/${w.icon}.png`} width={22} height={22} alt="" />
                                <span style={{ fontWeight: 600 }}>{district}</span>
                                <span style={{ color: w.temp > 36 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{w.temp}°C</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{w.humidity}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Map — Full Width */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>🗺️ Village Risk Map — Vidarbha</h3>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {[['Low', COLORS.low], ['Moderate', COLORS.moderate], ['High', COLORS.high], ['Critical', COLORS.critical]].map(([label, color]) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, opacity: 0.85 }} />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ height: 420, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <MapContainer center={[20.75, 78.5]} zoom={8} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
                        {villages.map(v => (
                            <CircleMarker key={v.id} center={[v.lat, v.lng]} radius={7 + v.wsi / 12}
                                pathOptions={{ fillColor: COLORS[getRiskLevel(v.wsi)], color: COLORS[getRiskLevel(v.wsi)], fillOpacity: 0.75, weight: 1.5 }}>
                                <Popup>
                                    <div style={{ color: '#333', minWidth: 195 }}>
                                        <strong style={{ fontSize: 14 }}>{v.name}</strong>
                                        <div style={{ fontSize: 11.5, marginTop: 4, lineHeight: 1.6, color: '#555' }}>
                                            📍 {v.district} · {v.taluka}<br />
                                            📊 WSI: <strong style={{ color: COLORS[getRiskLevel(v.wsi)] }}>{v.wsi}</strong> ({getRiskLabel(v.wsi)})<br />
                                            👥 Population: {v.population.toLocaleString()}<br />
                                            💧 Groundwater: {v.groundwaterLevel}m ({v.groundwaterTrend}m/yr)<br />
                                            🌧️ Rainfall: {v.currentRainfall}/{v.avgRainfall}mm ({Math.round((v.currentRainfall / v.avgRainfall - 1) * 100)}%)<br />
                                            🚚 Tankers: {v.tankerCount > 0 ? `${v.tankerCount} active` : 'None deployed'}
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Row 2: Risk Distribution + Top Critical + AI Briefing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Risk Pie Chart */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>📊 Risk Distribution</h3>
                    <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                            <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={3}>
                                {riskDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }} />
                            <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top 5 Critical Villages */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>🚨 Top 5 Critical Villages</h3>
                    {topCritical.map((v, i) => (
                        <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(248,113,113,0.15)', color: '#f87171', flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.district} · {v.population.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-primary)' }}>{v.wsi}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>WSI</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Briefing */}
                <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>🤖 AI Daily Briefing</h3>
                    <div
                        style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, overflow: 'auto', maxHeight: 220 }}
                        dangerouslySetInnerHTML={{ __html: renderBriefingMd(briefing) }}
                    />
                    <div style={{ marginTop: 10, fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <Activity size={10} /> Powered by Gemini 2.0 Flash
                    </div>
                </div>
            </div>

            {/* Row 3: Rainfall + Groundwater Charts */}
            <div className="grid-2">
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem' }}>🌧️ Rainfall: Normal vs Actual (2025-26)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={rainfallHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="mm" />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }} />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                            <Bar dataKey="normal" fill="#334155" name="Normal" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" fill="#00d4ff" name="Actual 2025-26" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem' }}>💧 Groundwater Depth Trend (metres)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={groundwaterTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="m" reversed />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }} />
                            <Line type="monotone" dataKey="level" stroke="#f87171" strokeWidth={2.5} dot={{ fill: '#f87171', r: 4, strokeWidth: 0 }} name="Depth (m)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

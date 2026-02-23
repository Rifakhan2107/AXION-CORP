import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, Navigation, Clock, CheckCircle, Route, Zap, Database } from 'lucide-react';
import { tankers, villages, getRiskLevel } from '../../data/vidarbhaData';
import { getRoute, getOptimizedMultiStopRoute } from '../../services/routeService';
import { calcPriorityScore } from '../../utils/waterStressEngine';
import { seedFirestore } from '../../utils/seedFirestore';

const STATUS_COLORS = { 'delivering': '#34d399', 'in-transit': '#00d4ff', 'idle': '#64748b' };
const STATUS_LABELS = { 'delivering': 'Delivering', 'in-transit': 'In Transit', 'idle': 'Idle' };
const RISK_COLORS = { low: '#34d399', moderate: '#fbbf24', high: '#fb923c', critical: '#f87171' };

// Nagpur main depot (NMC Water Supply HQ)
const DEPOT = { lat: 21.1458, lng: 79.0882, name: 'Nagpur Depot' };

export default function TankersPage() {
    const [selectedTanker, setSelectedTanker] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [multiRoute, setMultiRoute] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState(null);

    const criticalVillages = villages
        .filter(v => v.wsi > 70 && v.tankerCount < 3)
        .map(v => ({ ...v, priorityScore: calcPriorityScore(v.population, v.wsi, 30) }))
        .sort((a, b) => b.priorityScore - a.priorityScore);

    // Calculate optimized route to a single village
    const showRoute = async (village) => {
        setLoadingRoute(true);
        setMultiRoute(null);
        const route = await getRoute(DEPOT.lat, DEPOT.lng, village.lat, village.lng);
        setRouteData({ ...route, village });
        setLoadingRoute(false);
    };

    // Calculate multi-stop optimized route
    const showOptimizedRoute = async () => {
        setLoadingRoute(true);
        setRouteData(null);
        const top5 = criticalVillages.slice(0, 5);
        const result = await getOptimizedMultiStopRoute(DEPOT.lat, DEPOT.lng, top5);
        setMultiRoute({ ...result, villages: top5 });
        setLoadingRoute(false);
    };

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const result = await seedFirestore();
            setSeedResult(`✅ Seeded ${result.villages} villages + ${result.tankers} tankers to Firestore`);
        } catch (err) {
            setSeedResult(`❌ Error: ${err.message}`);
        }
        setSeeding(false);
    };

    return (
        <div>
            <div className="page-header">
                <div><h1>Tanker Management</h1><p className="subtitle">{tankers.length} tankers · GPS tracked · OSRM routing</p></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleSeed} disabled={seeding}>
                        <Database size={14} /> {seeding ? 'Seeding...' : 'Seed Firestore'}
                    </button>
                    <div className="badge active"><Truck size={14} /> {tankers.filter(t => t.status === 'delivering').length} Delivering</div>
                    <div className="badge" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--accent-blue)' }}><Navigation size={14} /> {tankers.filter(t => t.status === 'in-transit').length} In Transit</div>
                </div>
            </div>

            {seedResult && (
                <div className="glass-card" style={{ padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>{seedResult}</div>
            )}

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="chart-container" style={{ height: 460 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3>🗺️ Live Tanker Positions & Routes</h3>
                        <button className="btn btn-primary btn-sm" onClick={showOptimizedRoute} disabled={loadingRoute}>
                            <Route size={14} /> {loadingRoute ? 'Computing...' : 'Optimize Multi-Stop'}
                        </button>
                    </div>
                    <div className="map-container" style={{ height: 390 }}>
                        <MapContainer center={[20.8, 78.5]} zoom={7} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />

                            {/* Depot marker */}
                            <CircleMarker center={[DEPOT.lat, DEPOT.lng]} radius={10}
                                pathOptions={{ fillColor: '#a855f7', color: '#a855f7', fillOpacity: 0.9, weight: 2 }}>
                                <Popup><strong>📍 Nagpur Water Depot</strong><br />Central dispatch hub</Popup>
                            </CircleMarker>

                            {/* Village markers */}
                            {villages.map(v => (
                                <CircleMarker key={`v-${v.id}`} center={[v.lat, v.lng]} radius={5}
                                    pathOptions={{ fillColor: RISK_COLORS[getRiskLevel(v.wsi)], color: RISK_COLORS[getRiskLevel(v.wsi)], fillOpacity: 0.5, weight: 1 }}>
                                    <Popup><div style={{ color: '#333' }}><strong>{v.name}</strong> · WSI: {v.wsi}</div></Popup>
                                </CircleMarker>
                            ))}

                            {/* Tanker markers */}
                            {tankers.map(t => (
                                <CircleMarker key={t.id} center={[t.lat, t.lng]} radius={8}
                                    pathOptions={{ fillColor: STATUS_COLORS[t.status], color: STATUS_COLORS[t.status], fillOpacity: 0.9, weight: 2 }}
                                    eventHandlers={{ click: () => setSelectedTanker(t) }}>
                                    <Popup>
                                        <div style={{ color: '#333', minWidth: 150 }}>
                                            <strong>🚚 {t.vehicleNo}</strong><br />
                                            {t.driver} · {STATUS_LABELS[t.status]}<br />
                                            → {t.currentVillage} · {(t.capacity / 1000)}KL
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}

                            {/* Single route polyline */}
                            {routeData?.geometry && (
                                <Polyline positions={routeData.geometry} pathOptions={{ color: '#00d4ff', weight: 3, dashArray: '8 4' }} />
                            )}

                            {/* Multi-stop route polyline */}
                            {multiRoute?.geometry && (
                                <Polyline positions={multiRoute.geometry} pathOptions={{ color: '#a855f7', weight: 3 }} />
                            )}
                        </MapContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Route details panel */}
                    {(routeData || multiRoute) && (
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Route size={18} style={{ color: 'var(--accent-blue)' }} />
                                {multiRoute ? 'Optimized Multi-Stop Route' : `Route to ${routeData?.village?.name}`}
                            </h3>
                            {routeData && (
                                <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem' }}>
                                    <div><strong style={{ color: 'var(--accent-blue)' }}>{routeData.distance} km</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Distance</span></div>
                                    <div><strong style={{ color: 'var(--accent-green)' }}>{routeData.duration} min</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Est. Time</span></div>
                                    <div><strong style={{ color: 'var(--accent-orange)' }}>WSI {routeData.village?.wsi}</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Severity</span></div>
                                </div>
                            )}
                            {multiRoute && (
                                <div>
                                    <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem', marginBottom: 12 }}>
                                        <div><strong style={{ color: 'var(--accent-purple)' }}>{multiRoute.totalDistance} km</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Distance</span></div>
                                        <div><strong style={{ color: 'var(--accent-green)' }}>{multiRoute.totalDuration} min</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Time</span></div>
                                        <div><strong style={{ color: 'var(--accent-blue)' }}>{multiRoute.villages?.length} stops</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Villages</span></div>
                                    </div>
                                    {multiRoute.legs?.map((leg, i) => (
                                        <div key={i} style={{ fontSize: '0.78rem', padding: '4px 0', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                            {leg.from} → {leg.to}: <strong>{leg.distance}km</strong> ({leg.duration}min)
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Priority allocation queue */}
                    <div className="glass-card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>🚨 Priority Allocation Queue</h3>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                            Score = (0.55 × WSI) + (0.25 × PopFactor) + (0.20 × DistFactor)
                        </div>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {criticalVillages.slice(0, 8).map(v => (
                                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.wsi > 80 ? '#f87171' : '#fb923c', flexShrink: 0, boxShadow: v.wsi > 80 ? '0 0 8px #f87171' : 'none' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{v.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.district} · {v.population.toLocaleString()} · WSI {v.wsi}</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700, marginRight: 6 }}>{v.priorityScore}</div>
                                    <button className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '6px 10px' }} onClick={() => showRoute(v)}>
                                        <Zap size={12} /> Route
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fleet table */}
            <div className="glass-card" style={{ overflow: 'auto' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
                    <h3 style={{ fontSize: '0.95rem' }}>📋 Tanker Fleet Status</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Vehicle No</th><th>Driver</th><th>Status</th><th>Current Village</th>
                            <th>District</th><th>Capacity</th><th>Trips Today</th><th>GPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tankers.map(t => (
                            <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTanker(t)}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.vehicleNo}</td>
                                <td>{t.driver}</td>
                                <td>
                                    <span className="badge" style={{ background: `${STATUS_COLORS[t.status]}22`, color: STATUS_COLORS[t.status] }}>
                                        {STATUS_LABELS[t.status]}
                                    </span>
                                </td>
                                <td>{t.currentVillage}</td>
                                <td>{t.district}</td>
                                <td>{(t.capacity / 1000).toFixed(0)} KL</td>
                                <td>{t.trips}</td>
                                <td><CheckCircle size={16} style={{ color: '#34d399' }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

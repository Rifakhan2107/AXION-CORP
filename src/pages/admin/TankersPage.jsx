import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, Navigation, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { tankers, villages, getRiskLevel } from '../../data/vidarbhaData';

const STATUS_COLORS = { 'delivering': '#34d399', 'in-transit': '#00d4ff', 'idle': '#64748b' };
const STATUS_LABELS = { 'delivering': 'Delivering', 'in-transit': 'In Transit', 'idle': 'Idle' };

export default function TankersPage() {
    const [selectedTanker, setSelectedTanker] = useState(null);
    const [allocating, setAllocating] = useState(false);
    const criticalVillages = villages.filter(v => v.wsi > 70 && v.tankerCount < 3).sort((a, b) => b.wsi - a.wsi);

    const allocateTanker = (villageId) => {
        setAllocating(true);
        setTimeout(() => { setAllocating(false); alert('Tanker allocated successfully! GPS tracking enabled.'); }, 1000);
    };

    return (
        <div>
            <div className="page-header">
                <div><h1>Tanker Management</h1><p className="subtitle">{tankers.length} tankers · GPS tracked</p></div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="badge active"><Truck size={14} /> {tankers.filter(t => t.status === 'delivering').length} Delivering</div>
                    <div className="badge" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--accent-blue)' }}><Navigation size={14} /> {tankers.filter(t => t.status === 'in-transit').length} In Transit</div>
                    <div className="badge" style={{ background: 'rgba(100,116,139,0.15)', color: 'var(--text-muted)' }}><Clock size={14} /> {tankers.filter(t => t.status === 'idle').length} Idle</div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="chart-container" style={{ height: 420 }}>
                    <h3>🗺️ Live Tanker Positions</h3>
                    <div className="map-container" style={{ height: 360 }}>
                        <MapContainer center={[20.8, 78.5]} zoom={7} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
                            {tankers.map(t => (
                                <CircleMarker key={t.id} center={[t.lat, t.lng]} radius={8}
                                    pathOptions={{ fillColor: STATUS_COLORS[t.status], color: STATUS_COLORS[t.status], fillOpacity: 0.9, weight: 2 }}
                                    eventHandlers={{ click: () => setSelectedTanker(t) }}>
                                    <Popup>
                                        <div style={{ color: '#333', minWidth: 160 }}>
                                            <strong>🚚 {t.vehicleNo}</strong><br />
                                            Driver: {t.driver}<br />
                                            Status: {STATUS_LABELS[t.status]}<br />
                                            Village: {t.currentVillage}<br />
                                            Capacity: {(t.capacity / 1000).toFixed(0)}KL · Trips: {t.trips}
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 20, height: 420, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>🚨 Priority Allocation Queue</h3>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {criticalVillages.slice(0, 6).map(v => (
                            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.wsi > 80 ? '#f87171' : '#fb923c', boxShadow: v.wsi > 80 ? '0 0 8px #f87171' : 'none' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{v.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.district} · Pop {v.population.toLocaleString()} · WSI {v.wsi}</div>
                                </div>
                                <div style={{ textAlign: 'right', marginRight: 8 }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.tankerCount} tankers</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)' }}>Score: {Math.round(v.wsi * 0.6 + v.population / 1000 * 0.4)}</div>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => allocateTanker(v.id)} disabled={allocating}>
                                    {allocating ? '...' : '+ Assign'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

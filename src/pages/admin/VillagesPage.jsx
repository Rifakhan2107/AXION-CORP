import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Filter, MapPin, ArrowUpDown } from 'lucide-react';
import { villages, DISTRICTS, getRiskLevel, getRiskLabel } from '../../data/vidarbhaData';

export default function VillagesPage() {
    const [search, setSearch] = useState('');
    const [districtFilter, setDistrictFilter] = useState('All');
    const [riskFilter, setRiskFilter] = useState('All');
    const [sortBy, setSortBy] = useState('wsi');
    const [sortDir, setSortDir] = useState('desc');
    const [view, setView] = useState('table');

    const COLORS = { low: '#34d399', moderate: '#fbbf24', high: '#fb923c', critical: '#f87171' };

    let filtered = villages.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.district.toLowerCase().includes(search.toLowerCase());
        const matchDistrict = districtFilter === 'All' || v.district === districtFilter;
        const matchRisk = riskFilter === 'All' || getRiskLevel(v.wsi) === riskFilter;
        return matchSearch && matchDistrict && matchRisk;
    });

    filtered.sort((a, b) => {
        const val = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'wsi') return (b.wsi - a.wsi) * val;
        if (sortBy === 'population') return (b.population - a.population) * val;
        if (sortBy === 'name') return a.name.localeCompare(b.name) * val;
        return 0;
    });

    const toggleSort = (field) => {
        if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('desc'); }
    };

    return (
        <div>
            <div className="page-header">
                <div><h1>Village Monitoring</h1><p className="subtitle">{filtered.length} villages across Vidarbha</p></div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>Table</button>
                    <button className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('map')}>Map</button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input className="form-input" placeholder="Search villages..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <select className="form-input" style={{ width: 160 }} value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
                    <option value="All">All Districts</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="form-input" style={{ width: 140 }} value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                    <option value="All">All Risks</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                </select>
            </div>

            {view === 'table' ? (
                <div className="glass-card" style={{ overflow: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>Village <ArrowUpDown size={12} /></th>
                                <th>District</th>
                                <th>Taluka</th>
                                <th onClick={() => toggleSort('population')} style={{ cursor: 'pointer' }}>Population <ArrowUpDown size={12} /></th>
                                <th onClick={() => toggleSort('wsi')} style={{ cursor: 'pointer' }}>WSI <ArrowUpDown size={12} /></th>
                                <th>Risk</th>
                                <th>Rainfall (mm)</th>
                                <th>Groundwater</th>
                                <th>Tankers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => (
                                <tr key={v.id}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.name}</td>
                                    <td>{v.district}</td>
                                    <td>{v.taluka}</td>
                                    <td>{v.population.toLocaleString()}</td>
                                    <td style={{ fontWeight: 700, color: COLORS[getRiskLevel(v.wsi)] }}>{v.wsi}</td>
                                    <td><span className={`badge ${getRiskLevel(v.wsi)}`}>{getRiskLabel(v.wsi)}</span></td>
                                    <td>{v.currentRainfall}/{v.avgRainfall} <span style={{ color: v.currentRainfall < v.avgRainfall * 0.7 ? 'var(--accent-red)' : 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round((v.currentRainfall / v.avgRainfall - 1) * 100)}%)</span></td>
                                    <td>{v.groundwaterLevel}m <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>({v.groundwaterTrend}m/yr)</span></td>
                                    <td>{v.tankerCount > 0 ? <span className="badge active">{v.tankerCount} active</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="chart-container" style={{ height: 500 }}>
                    <div className="map-container" style={{ height: 460 }}>
                        <MapContainer center={[20.8, 78.5]} zoom={7} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
                            {filtered.map(v => (
                                <CircleMarker key={v.id} center={[v.lat, v.lng]} radius={8 + v.wsi / 15}
                                    pathOptions={{ fillColor: COLORS[getRiskLevel(v.wsi)], color: COLORS[getRiskLevel(v.wsi)], fillOpacity: 0.7, weight: 1 }}>
                                    <Popup>
                                        <div style={{ color: '#333', minWidth: 160 }}>
                                            <strong>{v.name}</strong> ({v.district})<br />
                                            WSI: <strong>{v.wsi}</strong> · Pop: {v.population.toLocaleString()}<br />
                                            GW: {v.groundwaterLevel}m · Tankers: {v.tankerCount}
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

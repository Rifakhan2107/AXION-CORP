import { useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, Clock, Droplets, Navigation, CheckCircle } from 'lucide-react';

const assignedTrips = [
    { id: 1, village: 'Parseoni', district: 'Nagpur', lat: 21.383, lng: 79.147, population: 12800, wsi: 81, capacity: 10000, status: 'pending', distance: 18, eta: '35 min', priority: 'Critical' },
    { id: 2, village: 'Morshi', district: 'Amravati', lat: 21.320, lng: 78.010, population: 18900, wsi: 89, capacity: 10000, status: 'pending', distance: 42, eta: '1h 10min', priority: 'Critical' },
    { id: 3, village: 'Katol', district: 'Nagpur', lat: 21.277, lng: 78.587, population: 29600, wsi: 65, capacity: 12000, status: 'completed', distance: 28, eta: '—', priority: 'High' },
];

export default function OperatorDashboard() {
    const [trips, setTrips] = useState(assignedTrips);
    const [activeTrip, setActiveTrip] = useState(null);

    const startTrip = (id) => {
        setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'in-transit' } : t));
        setActiveTrip(id);
    };

    const completeTrip = (id) => {
        setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
        setActiveTrip(null);
    };

    const pending = trips.filter(t => t.status === 'pending');
    const inTransit = trips.find(t => t.status === 'in-transit');
    const completed = trips.filter(t => t.status === 'completed');

    return (
        <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Today's Assignments</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                {trips.length} trips · {completed.length} completed · {pending.length} pending
            </p>

            {inTransit && (
                <div className="glass-card" style={{ padding: 20, marginBottom: 20, border: '1px solid rgba(0,212,255,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Navigation size={18} style={{ color: 'var(--accent-blue)' }} />
                        <h3 style={{ fontSize: '1rem' }}>Active Trip — {inTransit.village}</h3>
                    </div>
                    <div className="map-container" style={{ height: 200, marginBottom: 16, borderRadius: 'var(--radius-md)' }}>
                        <MapContainer center={[inTransit.lat, inTransit.lng]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            <CircleMarker center={[inTransit.lat, inTransit.lng]} radius={10}
                                pathOptions={{ fillColor: '#00d4ff', color: '#00d4ff', fillOpacity: 0.7 }}>
                                <Popup><strong>{inTransit.village}</strong></Popup>
                            </CircleMarker>
                        </MapContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {inTransit.district} · {inTransit.distance}km · WSI: {inTransit.wsi}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Capacity: {(inTransit.capacity / 1000).toFixed(0)} KL · ETA: {inTransit.eta}
                            </div>
                        </div>
                        <button className="btn btn-success btn-sm" onClick={() => completeTrip(inTransit.id)}>
                            <CheckCircle size={16} /> Mark Delivered
                        </button>
                    </div>
                </div>
            )}

            {pending.length > 0 && (
                <>
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Pending Trips</h3>
                    {pending.map(trip => (
                        <div key={trip.id} className="trip-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{trip.village}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trip.district} · {trip.distance}km away</div>
                                </div>
                                <span className={`badge ${trip.wsi > 80 ? 'critical' : 'high'}`}>{trip.priority}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 20, marginBottom: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Droplets size={14} /> WSI: {trip.wsi}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> ETA: {trip.eta}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={14} /> {(trip.capacity / 1000).toFixed(0)} KL</span>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => startTrip(trip.id)} disabled={!!inTransit}>
                                <Navigation size={14} /> Start Trip
                            </button>
                        </div>
                    ))}
                </>
            )}

            {completed.length > 0 && (
                <>
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 12, marginTop: 24 }}>Completed</h3>
                    {completed.map(trip => (
                        <div key={trip.id} className="trip-card" style={{ opacity: 0.6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.95rem' }}>{trip.village}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trip.district} · {trip.distance}km</div>
                                </div>
                                <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-green)' }}>
                                    <CheckCircle size={12} /> Delivered
                                </span>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

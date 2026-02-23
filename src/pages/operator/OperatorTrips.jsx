import { CheckCircle, Clock, MapPin, Truck, Calendar, Wallet } from 'lucide-react';

const tripHistory = [
    { id: 1, village: 'Kamptee', district: 'Nagpur', date: '2026-02-23', capacity: 10000, distance: 15, status: 'verified', payment: 'Approved' },
    { id: 2, village: 'Parseoni', district: 'Nagpur', date: '2026-02-22', capacity: 10000, distance: 18, status: 'verified', payment: 'Approved' },
    { id: 3, village: 'Katol', district: 'Nagpur', date: '2026-02-22', capacity: 12000, distance: 28, status: 'verified', payment: 'Pending' },
    { id: 4, village: 'Morshi', district: 'Amravati', date: '2026-02-21', capacity: 10000, distance: 42, status: 'verified', payment: 'Approved' },
    { id: 5, village: 'Saoner', district: 'Nagpur', date: '2026-02-21', capacity: 10000, distance: 22, status: 'verified', payment: 'Approved' },
    { id: 6, village: 'Chandur Bazar', district: 'Amravati', date: '2026-02-20', capacity: 15000, distance: 55, status: 'verified', payment: 'Approved' },
    { id: 7, village: 'Arvi', district: 'Wardha', date: '2026-02-20', capacity: 10000, distance: 35, status: 'verified', payment: 'Approved' },
    { id: 8, village: 'Narkhed', district: 'Nagpur', date: '2026-02-19', capacity: 10000, distance: 31, status: 'verified', payment: 'Pending' },
];

export default function OperatorTrips() {
    const totalTrips = tripHistory.length;
    const totalCapacity = tripHistory.reduce((s, t) => s + t.capacity, 0);
    const approvedPayments = tripHistory.filter(t => t.payment === 'Approved').length;

    return (
        <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 20 }}>Trip History</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                <div className="kpi-card blue" style={{ padding: 16 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>{totalTrips}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Trips</div>
                </div>
                <div className="kpi-card green" style={{ padding: 16 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>{(totalCapacity / 1000).toFixed(0)} KL</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Water Delivered</div>
                </div>
                <div className="kpi-card purple" style={{ padding: 16 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>{approvedPayments}/{totalTrips}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Payments Approved</div>
                </div>
            </div>

            {tripHistory.map(trip => (
                <div key={trip.id} className="trip-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{trip.village}</h4>
                            <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {trip.district}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {trip.date}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={12} /> {(trip.capacity / 1000).toFixed(0)} KL</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {trip.distance}km</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                            <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-green)' }}>
                                <CheckCircle size={10} /> GPS Verified
                            </span>
                            <span className="badge" style={{
                                background: trip.payment === 'Approved' ? 'rgba(0,212,255,0.15)' : 'rgba(251,191,36,0.15)',
                                color: trip.payment === 'Approved' ? 'var(--accent-blue)' : 'var(--accent-yellow)'
                            }}>
                                <Wallet size={10} /> {trip.payment}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

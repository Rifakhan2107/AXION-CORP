import { useState } from 'react';
import { AlertTriangle, Droplets, Truck, MapPin, Bell, Clock, Plus, Send } from 'lucide-react';

const initialAlerts = [
    { id: 1, type: 'critical', icon: <AlertTriangle size={16} />, title: 'Malegaon WSI exceeds 93', desc: 'Village Malegaon (Washim) has entered critical drought level. Immediate tanker deployment recommended.', time: '10 min ago', district: 'Washim' },
    { id: 2, type: 'critical', icon: <Droplets size={16} />, title: 'Pusad groundwater at 16.4m', desc: 'Groundwater in Pusad (Yavatmal) has dropped to 16.4 metres. WSI: 94. 5 tankers active.', time: '25 min ago', district: 'Yavatmal' },
    { id: 3, type: 'warning', icon: <Truck size={16} />, title: 'Tanker T005 offline for 2 hours', desc: 'GPS signal lost for MH-27-IJ-7890 near Dharni. Requires verification.', time: '1 hour ago', district: 'Amravati' },
    { id: 4, type: 'critical', icon: <AlertTriangle size={16} />, title: 'Chandur Bazar WSI spike', desc: 'WSI increased from 85 to 92 in 48 hours. Population: 15,200. Only 5 tankers deployed.', time: '2 hours ago', district: 'Amravati' },
    { id: 5, type: 'warning', icon: <MapPin size={16} />, title: 'Risod approaching critical threshold', desc: 'WSI at 87 and rising. Recommend pre-emptive tanker staging from Washim depot.', time: '3 hours ago', district: 'Washim' },
    { id: 6, type: 'info', icon: <Truck size={16} />, title: 'Tanker T002 completed 3 trips', desc: 'MH-31-CD-5678 completed delivery to Kamptee. GPS verified. Payment eligible.', time: '4 hours ago', district: 'Nagpur' },
    { id: 7, type: 'info', icon: <Bell size={16} />, title: 'Scarcity Action Plan Cycle 3 reminder', desc: 'Deadline: Jan 20, 2026 for full deployment plans. Ensure tanker staging is complete.', time: '6 hours ago', district: 'All' },
    { id: 8, type: 'warning', icon: <Droplets size={16} />, title: 'Telhara rainfall deficit -42%', desc: 'Cumulative rainfall in Telhara: 460mm vs normal 790mm. WSI: 90. Escalation recommended.', time: '8 hours ago', district: 'Akola' },
];

export default function AlertsPage() {
    const [alerts, setAlerts] = useState(initialAlerts);
    const [filter, setFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [newAlert, setNewAlert] = useState({ title: '', desc: '', type: 'warning' });

    const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

    const createAlert = () => {
        if (!newAlert.title) return;
        setAlerts([{ id: Date.now(), type: newAlert.type, icon: <Bell size={16} />, title: newAlert.title, desc: newAlert.desc, time: 'Just now', district: 'Manual' }, ...alerts]);
        setNewAlert({ title: '', desc: '', type: 'warning' });
        setShowCreate(false);
    };

    return (
        <div>
            <div className="page-header">
                <div><h1>Alerts & Notifications</h1><p className="subtitle">{alerts.filter(a => a.type === 'critical').length} critical alerts active</p></div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>
                    <Plus size={16} /> Create Alert
                </button>
            </div>

            {showCreate && (
                <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>New Alert</h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <select className="form-input" style={{ width: 120 }} value={newAlert.type} onChange={e => setNewAlert({ ...newAlert, type: e.target.value })}>
                            <option value="critical">Critical</option><option value="warning">Warning</option><option value="info">Info</option>
                        </select>
                        <input className="form-input" style={{ flex: 1, minWidth: 200 }} placeholder="Alert title" value={newAlert.title} onChange={e => setNewAlert({ ...newAlert, title: e.target.value })} />
                        <input className="form-input" style={{ flex: 2, minWidth: 200 }} placeholder="Description" value={newAlert.desc} onChange={e => setNewAlert({ ...newAlert, desc: e.target.value })} />
                        <button className="btn btn-primary btn-sm" onClick={createAlert}><Send size={14} /> Send</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['all', 'critical', 'warning', 'info'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                        {f === 'all' ? `All (${alerts.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${alerts.filter(a => a.type === f).length})`}
                    </button>
                ))}
            </div>

            <div className="glass-card">
                {filtered.map(alert => (
                    <div key={alert.id} className="alert-item">
                        <div className={`alert-dot ${alert.type}`} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {alert.icon} {alert.title}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.desc}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> {alert.time}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{alert.district}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

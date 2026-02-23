import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Route, LogOut, Droplets } from 'lucide-react';

export default function OperatorLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="operator-layout">
            <header className="operator-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Droplets size={22} style={{ color: 'var(--accent-blue)' }} />
                    <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '1.1rem' }}>JalDrushti</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.displayName || 'Operator'}</span>
                    <button onClick={handleLogout} style={{ color: 'var(--text-muted)', padding: 4 }}><LogOut size={18} /></button>
                </div>
            </header>
            <div className="operator-content"><Outlet /></div>
            <nav className="operator-nav">
                <NavLink to="/operator" end className={({ isActive }) => `operator-nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/operator/trips" className={({ isActive }) => `operator-nav-item ${isActive ? 'active' : ''}`}>
                    <Route size={20} /> My Trips
                </NavLink>
            </nav>
        </div>
    );
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MapPin, Truck, BarChart3, Bell, Bot, LogOut, Droplets, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview', end: true },
    { to: '/admin/villages', icon: <MapPin size={20} />, label: 'Villages' },
    { to: '/admin/tankers', icon: <Truck size={20} />, label: 'Tankers' },
    { to: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { to: '/admin/alerts', icon: <Bell size={20} />, label: 'Alerts' },
    { to: '/admin/ai-chat', icon: <Bot size={20} />, label: 'AI Analyst' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="dashboard-layout">
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <Droplets size={24} className="logo-icon" />
                    <h2>JalDrushti</h2>
                    <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}>
                            {item.icon} {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-user">
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        {user?.displayName?.[0] || 'A'}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="name">{user?.displayName || 'Admin'}</div>
                        <div className="role">District Authority</div>
                    </div>
                    <button onClick={handleLogout} style={{ color: 'var(--text-muted)', padding: 4 }} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <Outlet />
            </main>
        </div>
    );
}

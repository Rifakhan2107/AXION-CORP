import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Shield, Truck, ArrowRight } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
    const { user, needsRole, loginWithGoogle, loginDemo, selectRole } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
        } catch (err) {
            setError('Google sign-in failed. Try demo mode below.');
        }
        setLoading(false);
    };

    const handleDemoLogin = (role) => {
        loginDemo(role);
        navigate(role === 'admin' ? '/admin' : '/operator');
    };

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        await selectRole(role);
        navigate(role === 'admin' ? '/admin' : '/operator');
    };

    if (user && needsRole) {
        return (
            <div className="login-page">
                <div className="login-bg-effects" />
                <div className="login-card role-select-card">
                    <div className="login-logo">
                        <Droplets size={32} className="logo-icon" />
                        <h2>JalDrushti</h2>
                    </div>
                    <p className="login-subtitle">Welcome, {user.displayName}! Select your role:</p>
                    <div className="role-options">
                        <button className="role-btn" onClick={() => handleRoleSelect('admin')}>
                            <Shield size={36} />
                            <h3>District Authority</h3>
                            <p>Admin dashboard with full analytics, village monitoring, and tanker management</p>
                        </button>
                        <button className="role-btn" onClick={() => handleRoleSelect('operator')}>
                            <Truck size={36} />
                            <h3>Tanker Operator</h3>
                            <p>View assigned trips, navigate routes, and update delivery status</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-bg-effects" />
            <div className="login-card">
                <div className="login-logo">
                    <Droplets size={32} className="logo-icon" />
                    <h2>JalDrushti</h2>
                </div>
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Sign in to access the drought management dashboard</p>

                {error && <div className="login-error">{error}</div>}

                <button className="btn btn-google login-google-btn" onClick={handleGoogleLogin} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <div className="login-divider">
                    <span>or try demo mode</span>
                </div>

                <div className="demo-buttons">
                    <button className="demo-btn admin-demo" onClick={() => handleDemoLogin('admin')}>
                        <Shield size={20} />
                        <div>
                            <strong>Admin Demo</strong>
                            <span>District Authority</span>
                        </div>
                        <ArrowRight size={16} />
                    </button>
                    <button className="demo-btn operator-demo" onClick={() => handleDemoLogin('operator')}>
                        <Truck size={20} />
                        <div>
                            <strong>Operator Demo</strong>
                            <span>Tanker Driver</span>
                        </div>
                        <ArrowRight size={16} />
                    </button>
                </div>

                <p className="login-footer-text">
                    Integrated Drought Warning & Smart Tanker Management System
                </p>
            </div>
        </div>
    );
}

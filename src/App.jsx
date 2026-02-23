import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'
import OperatorLayout from './layouts/OperatorLayout'
import OverviewPage from './pages/admin/OverviewPage'
import VillagesPage from './pages/admin/VillagesPage'
import TankersPage from './pages/admin/TankersPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import AlertsPage from './pages/admin/AlertsPage'
import AIChatPage from './pages/admin/AIChatPage'
import ScarcityPlanPage from './pages/admin/ScarcityPlanPage'
import OperatorDashboard from './pages/operator/OperatorDashboard'
import OperatorTrips from './pages/operator/OperatorTrips'

function ProtectedRoute({ children, requiredRole }) {
    const { user, role, loading } = useAuth()
    if (loading) return <div className="loading-screen"><div className="loader"></div></div>
    if (!user) return <Navigate to="/login" />
    if (requiredRole && role !== requiredRole) return <Navigate to="/" />
    return children
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<OverviewPage />} />
                <Route path="villages" element={<VillagesPage />} />
                <Route path="tankers" element={<TankersPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="ai-chat" element={<AIChatPage />} />
                <Route path="scarcity-plan" element={<ScarcityPlanPage />} />
            </Route>
            <Route path="/operator" element={
                <ProtectedRoute requiredRole="operator">
                    <OperatorLayout />
                </ProtectedRoute>
            }>
                <Route index element={<OperatorDashboard />} />
                <Route path="trips" element={<OperatorTrips />} />
            </Route>
        </Routes>
    )
}

export default App

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Shield, MapPin, TrendingUp, Truck, Brain, BarChart3, AlertTriangle, Users, Satellite, ChevronRight, ArrowRight, Github, Zap, Eye, Globe } from 'lucide-react';
import './LandingPage.css';

function useScrollReveal() {
    const ref = useRef();
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        const els = ref.current?.querySelectorAll('.animate-in');
        els?.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);
    return ref;
}

function CountUp({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef();
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [started, end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Particles() {
    return (
        <div className="particles">
            {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="particle" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                }} />
            ))}
        </div>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const containerRef = useScrollReveal();
    const [weatherIdx, setWeatherIdx] = useState(0);
    const weatherData = [
        { district: 'Nagpur', temp: '34°C', humidity: '28%', status: 'Dry' },
        { district: 'Amravati', temp: '36°C', humidity: '22%', status: 'Critical' },
        { district: 'Yavatmal', temp: '37°C', humidity: '19%', status: 'Severe' },
        { district: 'Washim', temp: '38°C', humidity: '17%', status: 'Critical' },
        { district: 'Akola', temp: '36°C', humidity: '20%', status: 'Severe' },
    ];

    useEffect(() => {
        const t = setInterval(() => setWeatherIdx(i => (i + 1) % weatherData.length), 3000);
        return () => clearInterval(t);
    }, []);

    const features = [
        { icon: <TrendingUp size={28} />, title: 'Rainfall Analysis', desc: 'Track deviation from normal rainfall patterns across all 11 Vidarbha districts with historical comparison.' },
        { icon: <Droplets size={28} />, title: 'Groundwater Monitoring', desc: 'Real-time groundwater level tracking using GSDA data with depletion trend analysis.' },
        { icon: <BarChart3 size={28} />, title: 'Water Stress Index', desc: 'Village-level WSI calculation combining rainfall, groundwater, and population demand metrics.' },
        { icon: <Truck size={28} />, title: 'Smart Tanker Dispatch', desc: 'Priority-based tanker allocation with GPS tracking and route optimization for efficient delivery.' },
        { icon: <Brain size={28} />, title: 'AI Drought Analyst', desc: 'Gemini AI-powered chatbot for predictive insights, demand forecasting, and district analysis.' },
        { icon: <Satellite size={28} />, title: 'Real-Time Dashboard', desc: 'Live monitoring of all villages, tankers, and drought indicators on interactive maps.' },
    ];

    return (
        <div className="landing" ref={containerRef}>
            <Particles />

            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <Droplets size={28} className="logo-icon" />
                    <span className="logo-text">JalDrushti</span>
                </div>
                <div className="nav-links">
                    <a href="#problem">Problem</a>
                    <a href="#solution">Solution</a>
                    <a href="#features">Features</a>
                    <a href="#impact">Impact</a>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                    Login <ArrowRight size={16} />
                </button>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge animate-in">
                        <Zap size={14} /> Powered by Gemini AI
                    </div>
                    <h1 className="hero-title animate-in animate-delay-1">
                        From <span className="gradient-text">Crisis Management</span> to<br />
                        <span className="gradient-text-2">Preventive Water Governance</span>
                    </h1>
                    <p className="hero-subtitle animate-in animate-delay-2">
                        An integrated digital platform predicting drought stress, optimizing tanker allocation,
                        and empowering district authorities across Vidarbha with AI-driven insights.
                    </p>
                    <div className="hero-actions animate-in animate-delay-3">
                        <button className="btn btn-primary btn-lg glow-btn" onClick={() => navigate('/login')}>
                            Launch Dashboard <ArrowRight size={20} />
                        </button>
                        <a href="#solution" className="btn btn-secondary btn-lg">
                            <Eye size={20} /> See How It Works
                        </a>
                    </div>

                    <div className="hero-weather animate-in animate-delay-4">
                        <div className="weather-ticker">
                            <Globe size={14} />
                            <span>Live:</span>
                            <span className="weather-district">{weatherData[weatherIdx].district}</span>
                            <span className="weather-sep">|</span>
                            <span>{weatherData[weatherIdx].temp}</span>
                            <span className="weather-sep">|</span>
                            <span>Humidity: {weatherData[weatherIdx].humidity}</span>
                            <span className="weather-sep">|</span>
                            <span className={`weather-status ${weatherData[weatherIdx].status.toLowerCase()}`}>
                                {weatherData[weatherIdx].status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hero-stats">
                    {[
                        { value: 35, suffix: '+', label: 'Villages Monitored' },
                        { value: 11, label: 'Districts Covered' },
                        { value: 10, suffix: '+', label: 'Active Tankers' },
                        { value: 99, suffix: '%', label: 'GPS Accuracy' },
                    ].map((s, i) => (
                        <div key={i} className={`hero-stat animate-in animate-delay-${i + 1}`}>
                            <div className="stat-value"><CountUp end={s.value} />{s.suffix}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Problem Section */}
            <section id="problem" className="section problem-section">
                <div className="section-container">
                    <div className="section-header animate-in">
                        <span className="section-tag">The Crisis</span>
                        <h2>Vidarbha's Water Emergency</h2>
                        <p>A creeping disaster fueled by infrastructure decay, resource diversion, and climate vulnerability</p>
                    </div>

                    <div className="problem-grid">
                        {[
                            { icon: <AlertTriangle size={32} />, value: <CountUp end={90} suffix="%" />, label: 'Conservation structures non-functional in Nagpur & Amravati', color: 'red' },
                            { icon: <Droplets size={32} />, value: <CountUp end={398} suffix="M m³" />, label: 'Water diverted annually from agriculture to thermal plants', color: 'orange' },
                            { icon: <Users size={32} />, value: <CountUp end={15} suffix="+" />, label: 'Villages face critical water stress (WSI > 80)', color: 'yellow' },
                            { icon: <MapPin size={32} />, value: '₹41.5 Cr', label: 'Allocated for 2026 scarcity relief, 50%+ to Vidarbha', color: 'blue' },
                        ].map((item, i) => (
                            <div key={i} className={`problem-card animate-in animate-delay-${i + 1}`}>
                                <div className={`problem-icon ${item.color}`}>{item.icon}</div>
                                <div className="problem-value">{item.value}</div>
                                <div className="problem-label">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section id="solution" className="section solution-section">
                <div className="section-container">
                    <div className="section-header animate-in">
                        <span className="section-tag">Our Approach</span>
                        <h2>How JalDrushti Works</h2>
                        <p>Three-stage intelligent pipeline for preventive water governance</p>
                    </div>

                    <div className="solution-steps">
                        {[
                            { step: '01', title: 'Predict', desc: 'Analyze rainfall deviation, groundwater trends, and SSMI data to calculate village-level Water Stress Index and predict drought emergence weeks in advance.', icon: <TrendingUp size={36} /> },
                            { step: '02', title: 'Prioritize', desc: 'Rank villages by urgency using weighted scoring (population × severity × distance). AI generates optimal tanker allocation plans and dispatch routes.', icon: <Shield size={36} /> },
                            { step: '03', title: 'Prevent', desc: 'Deploy tankers via GPS-tracked routes. Monitor delivery in real-time. Generate compliance reports for financial accountability.', icon: <Truck size={36} /> },
                        ].map((s, i) => (
                            <div key={i} className={`solution-step animate-in animate-delay-${i + 1}`}>
                                <div className="step-number">{s.step}</div>
                                <div className="step-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                                {i < 2 && <div className="step-connector"><ChevronRight size={24} /></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section features-section">
                <div className="section-container">
                    <div className="section-header animate-in">
                        <span className="section-tag">Capabilities</span>
                        <h2>Powerful Features</h2>
                        <p>Every tool district authorities need for smart water management</p>
                    </div>

                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className={`feature-card animate-in animate-delay-${(i % 3) + 1}`}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section id="impact" className="section impact-section">
                <div className="section-container">
                    <div className="section-header animate-in">
                        <span className="section-tag">Social Impact</span>
                        <h2>Measurable Outcomes</h2>
                        <p>Data-driven governance creating real change in Vidarbha</p>
                    </div>

                    <div className="impact-grid">
                        {[
                            { label: 'Crop Yield Increase (Soybean)', value: 98, suffix: '%', color: 'green' },
                            { label: 'Green Gram Yield Boost', value: 138, suffix: '%', color: 'cyan' },
                            { label: 'Ghost Trip Elimination', value: 100, suffix: '%', color: 'blue' },
                            { label: 'Irrigation Coverage Gain', value: 50, suffix: 'K ha', color: 'purple' },
                            { label: 'Drought Response Time Reduction', value: 70, suffix: '%', color: 'orange' },
                            { label: 'Financial Accountability', value: 100, suffix: '%', color: 'green' },
                        ].map((item, i) => (
                            <div key={i} className={`impact-card animate-in animate-delay-${(i % 3) + 1}`}>
                                <div className="impact-value">
                                    <CountUp end={item.value} />{item.suffix}
                                </div>
                                <div className={`impact-bar ${item.color}`}>
                                    <div className="impact-bar-fill" style={{ width: `${Math.min(item.value, 100)}%` }}></div>
                                </div>
                                <div className="impact-label">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="cta-container animate-in">
                    <h2>Ready to Transform Water Governance?</h2>
                    <p>Join JalDrushti — empowering Vidarbha's district authorities with AI-driven drought management</p>
                    <div className="cta-buttons">
                        <button className="btn btn-primary btn-lg glow-btn" onClick={() => navigate('/login')}>
                            <Shield size={20} /> Admin Login
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
                            <Truck size={20} /> Operator Login
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Droplets size={24} className="logo-icon" />
                        <span>JalDrushti</span>
                        <span className="footer-sep">|</span>
                        <span className="footer-tagline">Integrated Drought Warning & Smart Tanker System</span>
                    </div>
                    <div className="footer-info">
                        <span>Built by AXION CORP</span>
                        <span className="footer-sep">|</span>
                        <span>Vidarbha, Maharashtra</span>
                        <span className="footer-sep">|</span>
                        <span>2026</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

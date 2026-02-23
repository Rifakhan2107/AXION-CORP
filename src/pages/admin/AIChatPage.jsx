import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Zap, MapPin, Truck, BarChart3, AlertTriangle } from 'lucide-react';
import { chatWithAI } from '../../services/geminiService';
import { villages, DISTRICTS } from '../../data/vidarbhaData';

const QUICK_ACTIONS = [
    { icon: <AlertTriangle size={14} />, label: 'Critical Villages', prompt: 'What are the most critical villages right now? Show their WSI scores and status.' },
    { icon: <MapPin size={14} />, label: 'District Analysis', prompt: 'Give me a detailed analysis of Amravati district — villages, WSI scores, tanker status, and recommendations.' },
    { icon: <Truck size={14} />, label: 'Tanker Forecast', prompt: 'Predict tanker demand for the next 4 weeks across Vidarbha. Which districts need more tankers?' },
    { icon: <BarChart3 size={14} />, label: 'WSI Formula', prompt: 'Explain the Water Stress Index formula and show me the breakdown for the worst-affected village.' },
    { icon: <Zap size={14} />, label: 'Action Plan', prompt: 'What are the top 5 actions district authorities should take THIS WEEK based on current data?' },
    { icon: <MapPin size={14} />, label: 'Pusad Assessment', prompt: 'Give me a full assessment of Pusad village — WSI breakdown, groundwater trends, and interventions needed.' },
];

function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/### (.*)/g, '<h4 style="margin:12px 0 6px;font-size:0.9rem;color:var(--accent-blue)">$1</h4>')
        .replace(/## (.*)/g, '<h3 style="margin:14px 0 8px;font-size:1rem;color:var(--text-primary)">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
        .replace(/`([^`]+)`/g, '<code style="background:rgba(0,212,255,0.1);padding:2px 6px;border-radius:4px;font-size:0.8rem;color:var(--accent-blue)">$1</code>')
        .replace(/^\- (.*)/gm, '<div style="display:flex;gap:8px;margin:3px 0;align-items:flex-start"><span style="color:var(--accent-blue);margin-top:2px">•</span><span>$1</span></div>')
        .replace(/^\d+\. (.*)/gm, '<div style="display:flex;gap:8px;margin:3px 0;align-items:flex-start"><span style="color:var(--accent-purple);font-weight:600;min-width:18px">$1.</span><span>$2</span></div>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
}

export default function AIChatPage() {
    const [messages, setMessages] = useState([
        {
            role: 'ai', content: `## 🤖 JalDrushti AI Drought Analyst

Powered by **Google Gemini 2.0 Flash** with real-time Vidarbha data.

I have access to data on **${villages.length} villages** across **${DISTRICTS.length} districts**, including live WSI scores, groundwater levels, rainfall deviations, and tanker deployments.

**Ask me about:**
- 🏘️ Any specific village (e.g., "Tell me about Pusad")
- 📍 District-level analysis (e.g., "Yavatmal district status")
- 🚚 Tanker demand & deployment forecasts
- 📊 WSI formula breakdown for any village
- ⚡ Intervention recommendations

Select a quick action below or type your question.` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEnd = useRef(null);

    useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setLoading(true);

        try {
            const history = messages.filter(m => m.role !== 'system').map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                content: m.content
            }));
            const response = await chatWithAI(msg, history);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error processing your request. Please try again.' }]);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Sparkles size={24} style={{ color: 'var(--accent-purple)' }} /> AI Drought Analyst
                    </h1>
                    <p className="subtitle">Powered by Google Gemini 2.0 Flash — Real-time Vidarbha data analysis</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-green)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> Connected
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setMessages([messages[0]])}>
                        <Trash2 size={14} /> Clear
                    </button>
                </div>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-msg ${msg.role}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                {msg.role === 'ai' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent-purple)' }}>
                                        <Bot size={14} /> <strong>JalDrushti AI</strong>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                                        <User size={14} /> <strong>You</strong>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'ai' ? (
                                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} style={{ lineHeight: 1.7, fontSize: '0.85rem' }} />
                            ) : (
                                <div style={{ lineHeight: 1.6, fontSize: '0.85rem' }}>{msg.content}</div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-msg ai">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Bot size={14} style={{ color: 'var(--accent-purple)' }} />
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)', animation: 'pulse 0.8s infinite', animationDelay: '0s' }} />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'pulse 0.8s infinite', animationDelay: '0.2s' }} />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 0.8s infinite', animationDelay: '0.4s' }} />
                                </div>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Analyzing Vidarbha drought data...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEnd} />
                </div>

                {messages.length <= 1 && (
                    <div style={{ padding: '0 20px 16px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {QUICK_ACTIONS.map((s, i) => (
                                <button key={i} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem', justifyContent: 'flex-start', gap: 8, padding: '10px 12px' }} onClick={() => sendMessage(s.prompt)}>
                                    {s.icon} {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="chat-input-area">
                    <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about villages, districts, tanker demand, WSI scores..."
                        disabled={loading} />
                    <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

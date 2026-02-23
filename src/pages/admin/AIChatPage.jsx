import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { chatWithAI } from '../../services/geminiService';

const SUGGESTIONS = [
    'Which villages in Nagpur district are most at risk right now?',
    'Predict tanker demand for Amravati over the next 4 weeks',
    'Summarize the drought situation in Wardha district',
    'What are the top 5 critical villages by WSI score?',
    'Compare rainfall patterns across Vidarbha districts',
    'What interventions do you recommend for Pusad village?',
];

export default function AIChatPage() {
    const [messages, setMessages] = useState([
        { role: 'ai', content: '## 🤖 JalDrushti AI Analyst\n\nI\'m your AI-powered drought analyst for the Vidarbha region. I have access to real-time data on **35 villages** across **11 districts**, including WSI scores, groundwater levels, rainfall data, and tanker deployments.\n\nAsk me anything about:\n- Village risk assessments\n- Tanker demand predictions\n- District-level comparisons\n- Intervention recommendations' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEnd = useRef(null);

    useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');
        const userMsg = { role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const history = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'ai' ? 'model' : 'user', content: m.content }));
            const response = await chatWithAI(msg, history);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
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
                    <p className="subtitle">Powered by Google Gemini — Ask about Vidarbha drought data</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setMessages([messages[0]])}>
                    <Trash2 size={14} /> Clear Chat
                </button>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-msg ${msg.role}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.75rem', opacity: 0.7 }}>
                                {msg.role === 'ai' ? <><Bot size={14} /> JalDrushti AI</> : <><User size={14} /> You</>}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-msg ai">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Bot size={14} /> <span style={{ animation: 'pulse 1s infinite' }}>Analyzing Vidarbha data...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEnd} />
                </div>

                {messages.length <= 1 && (
                    <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {SUGGESTIONS.slice(0, 4).map((s, i) => (
                            <button key={i} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }} onClick={() => sendMessage(s)}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="chat-input-area">
                    <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about drought conditions, villages, tanker demand..."
                        disabled={loading} />
                    <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

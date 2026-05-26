import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

export default function AIAssistant({ productId = null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m ShopSavyy AI. Ask me about prices, price history, product details, or get recommendations.',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/api/ai/chat', {
        message: userMsg,
        productId,
        conversationHistory: history,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What\'s the price history?',
    'Is this a good deal?',
    'Compare similar products',
    'Best electronics under ₹10000',
  ];

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 300,
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
        color: '#0a0a0b', fontSize: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(201,169,110,0.4)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,169,110,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,110,0.4)';
        }}
      >
        {open ? '✕' : '✦'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 28, zIndex: 299,
          width: 360, height: 480,
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          animation: 'popUp 0.2s ease',
        }}>
          <style>{`@keyframes popUp { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'var(--accent)',
            }}>✦</div>
            <div>
              <p style={{ fontWeight: 500, fontSize: 14 }}>ShopSavyy AI</p>
              <p style={{ fontSize: 11, color: 'var(--green)' }}>● Online</p>
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 13px',
                  borderRadius: m.role === 'user'
                    ? '14px 14px 2px 14px'
                    : '14px 14px 14px 2px',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                  color: m.role === 'user' ? '#0a0a0b' : 'var(--text)',
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{
                display: 'flex', gap: 4, padding: '10px 14px',
                background: 'var(--bg3)',
                borderRadius: '14px 14px 14px 2px', width: 'fit-content',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--text3)',
                    animation: `bounce 1s ${i * 0.2}s infinite`,
                  }} />
                ))}
                <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 11,
                  border: '1px solid var(--border2)', color: 'var(--text2)',
                  background: 'transparent', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border2)';
                    e.currentTarget.style.color = 'var(--text2)';
                  }}
                >{s}</button>
              ))}
            </div>
          )}

          <div style={{
            padding: '10px 14px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about any product..."
              style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
            />
            <button onClick={send} disabled={!input.trim() || loading}
              className="btn btn-primary" style={{ padding: '8px 14px', flexShrink: 0 }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
import { useCallback, useEffect, useRef, useState } from 'react';
import { sendMessage } from '../api/chat';
import styles from './ChatPanel.module.css';

const GREETING = {
  role: 'ai',
  content: "Hi! I'm DevTrace AI — your personal productivity coach powered by Gemini.\n\nAsk me anything: why your score is low, what to focus on, how to beat your streak, or tips to clear your high-priority backlog.",
};

const SUGGESTIONS = [
  "Why is my productivity score low?",
  "How can I improve my streak?",
  "What should I focus on today?",
  "Am I at risk of burnout?",
];

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { reply } = await sendMessage(msg, history);
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "Sorry, I couldn't connect right now. Check your internet connection and try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarRing}>🤖</div>
            <div>
              <p className={styles.aiName}>DevTrace AI</p>
              <p className={styles.aiStatus}>
                <span className={styles.dot} /> Powered by Gemini
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close chat">✕</button>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}>
              {msg.role === 'ai' && <span className={styles.msgAvatar}>🤖</span>}
              <div className={styles.bubble}>
                {msg.content.split('\n').map((line, j) =>
                  line ? <p key={j}>{line}</p> : <br key={j} />
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className={`${styles.msg} ${styles.msgAi}`}>
              <span className={styles.msgAvatar}>🤖</span>
              <div className={`${styles.bubble} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — only on first message */}
        {messages.length === 1 && !loading && (
          <div className={styles.suggestions}>
            {SUGGESTIONS.map(s => (
              <button key={s} className={styles.chip} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className={styles.inputRow}>
          <textarea
            ref={inputRef}
            className={styles.input}
            placeholder="Ask about your productivity…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={() => send()}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            ↑
          </button>
        </div>

      </div>
    </div>
  );
}

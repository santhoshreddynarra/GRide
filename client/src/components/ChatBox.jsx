import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Send, MessageCircle, X, AlertCircle, Loader2 } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const getToken = () =>
  localStorage.getItem('token') || localStorage.getItem('gigride_token') || '';

const getMyId = () => {
  try {
    const u =
      JSON.parse(localStorage.getItem('user') || localStorage.getItem('gigride_user') || 'null');
    return u?._id || u?.id || null;
  } catch { return null; }
};

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/* ─── single message bubble ──────────────────────────────────────────────── */
const Bubble = memo(({ msg, myId, accent }) => {
  const sid   = msg.senderId?._id || msg.senderId;
  const isMine = sid === myId;

  return (
    <div style={{
      display: 'flex',
      justifyContent: isMine ? 'flex-end' : 'flex-start',
      marginBottom: '0.45rem',
    }}>
      <div style={{
        maxWidth: '78%',
        padding: '0.5rem 0.75rem',
        borderRadius: isMine ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
        background: isMine ? accent : '#f1f5f9',
        color: isMine ? 'white' : '#1e293b',
        fontSize: '0.84rem',
        fontWeight: 500,
        lineHeight: 1.45,
        wordBreak: 'break-word',
        opacity: msg._pending ? 0.55 : 1,
        boxShadow: isMine
          ? `0 2px 8px ${accent}33`
          : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'opacity 0.2s ease',
        position: 'relative',
      }}>
        {msg.text}
        <div style={{
          fontSize: '0.65rem',
          marginTop: '0.2rem',
          opacity: 0.65,
          textAlign: 'right',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3,
        }}>
          {msg._failed && <AlertCircle size={10} />}
          {fmtTime(msg.createdAt)}
          {msg._pending && ' …'}
        </div>
      </div>
    </div>
  );
});
Bubble.displayName = 'Bubble';

/* ─── ChatBox ─────────────────────────────────────────────────────────────── */
/**
 * Props:
 *   jobId        — MongoDB job _id (required)
 *   jobTitle     — display title
 *   receiverId   — other participant's _id
 *   accentColor  — blue (#0277bd) for seeker, green (#2e7d32) for provider
 */
export default function ChatBox({
  jobId,
  jobTitle = 'Job Chat',
  receiverId,
  accentColor = '#0277bd',
}) {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [sending, setSending]     = useState(false);
  const [unread, setUnread]       = useState(0);

  const myId         = useRef(getMyId());
  const bottomRef    = useRef(null);
  const lastTsRef    = useRef(null);  // ISO string of newest message we have
  const pollRef      = useRef(null);
  const inputRef     = useRef(null);
  const openRef      = useRef(false); // avoid stale closure in interval

  openRef.current = open;

  /* ── fetch (only new messages each poll) ───────────────────────────────── */
  const fetchMessages = useCallback(async (initial = false) => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/messages/${jobId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const incoming = (data.messages || []);

      setMessages(prev => {
        // Find messages newer than what we already have
        const existingIds = new Set(prev.filter(m => !m._pending && !m._failed).map(m => m._id));
        const fresh = incoming.filter(m => !existingIds.has(m._id));

        if (fresh.length === 0) return prev;

        // Update last-seen timestamp
        const newest = incoming[incoming.length - 1];
        if (newest) lastTsRef.current = newest.createdAt;

        // If chat is closed, track unread from OTHER user
        if (!openRef.current) {
          const newFromOther = fresh.filter(m => {
            const sid = m.senderId?._id || m.senderId;
            return sid !== myId.current;
          });
          if (newFromOther.length > 0)
            setUnread(u => u + newFromOther.length);
        }

        // Replace optimistic + extend
        const pending = prev.filter(m => m._pending || m._failed);
        return [...incoming, ...pending.filter(p => !incoming.some(i => i._localId === p._localId))];
      });
    } catch { /* silent */ }
    finally { if (initial) setLoading(false); }
  }, [jobId]);

  /* ── start / stop polling ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetchMessages(true);

    pollRef.current = setInterval(() => fetchMessages(false), 2000);
    return () => clearInterval(pollRef.current);
  }, [jobId, fetchMessages]);

  /* ── open chat → reset unread, scroll ─────────────────────────────────── */
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 60);
    }
  }, [open]);

  /* ── auto-scroll when new messages arrive while open ──────────────────── */
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  /* ── send ──────────────────────────────────────────────────────────────── */
  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !receiverId || sending) return;

    setText('');
    setSending(true);

    const _localId = `local-${Date.now()}-${Math.random()}`;
    const optimistic = {
      _id:       _localId,
      _localId,
      _pending:  true,
      senderId:  { _id: myId.current },
      receiverId,
      jobId,
      text:      trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev.filter(m => !m._failed), optimistic]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ jobId, receiverId, text: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace optimistic with real message
        setMessages(prev =>
          prev.map(m => m._localId === _localId
            ? { ...data.message, _localId }
            : m
          )
        );
      } else {
        setMessages(prev => prev.map(m => m._localId === _localId
          ? { ...m, _pending: false, _failed: true }
          : m
        ));
      }
    } catch {
      setMessages(prev => prev.map(m => m._localId === _localId
        ? { ...m, _pending: false, _failed: true }
        : m
      ));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [text, receiverId, jobId, sending]);

  /* ── keyboard shortcut: Enter to send ─────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes chatBounce {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.12); }
        }
        .chat-send-btn:enabled:hover { filter:brightness(1.12); transform:scale(1.05); }
        .chat-send-btn:active         { transform:scale(0.95); }
      `}</style>

      {/* ── Floating trigger button (fixed bottom-right) ── */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}>
        {/* ── Chat panel ── */}
        {open && (
          <>
            {/* Click-outside backdrop (invisible) */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: -1 }}
              onClick={() => setOpen(false)}
            />

            <div style={{
              position: 'absolute',
              bottom: 60,     // above the FAB
              right: 0,
              width: 300,
              height: 400,
              background: 'white',
              borderRadius: 20,
              boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'chatSlideUp 0.2s ease',
            }}>

              {/* ── Header ── */}
              <div style={{
                padding: '0.75rem 1rem',
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MessageCircle size={16} color="white" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: '0.85rem', lineHeight: 1.2 }}>
                      {jobTitle.length > 22 ? jobTitle.slice(0, 22) + '…' : jobTitle}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>
                      Job chat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.18)', border: 'none',
                    borderRadius: 8, padding: '4px 6px', cursor: 'pointer',
                    color: 'white', display: 'flex', alignItems: 'center',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                >
                  <X size={15} />
                </button>
              </div>

              {/* ── Messages ── */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.85rem 0.9rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                scrollbarWidth: 'thin',
                scrollbarColor: '#e2e8f0 transparent',
              }}>
                {loading ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, flexDirection:'column', gap:'0.5rem', color:'#94a3b8' }}>
                    <Loader2 size={22} style={{ animation:'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <p style={{ margin:0, fontSize:'0.78rem', fontWeight:500 }}>Loading chat…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, flexDirection:'column', gap:'0.4rem', color:'#cbd5e1' }}>
                    <MessageCircle size={34} strokeWidth={1.5} />
                    <p style={{ margin:0, fontSize:'0.8rem', fontWeight:600 }}>No messages yet</p>
                    <p style={{ margin:0, fontSize:'0.72rem', opacity:0.75 }}>Say hello! 👋</p>
                  </div>
                ) : messages.map((m, i) => (
                  <Bubble key={m._id || i} msg={m} myId={myId.current} accent={accentColor} />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* ── Input ── */}
              <form
                onSubmit={handleSend}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: '0.45rem',
                  alignItems: 'flex-end',
                  flexShrink: 0,
                  background: '#fafafa',
                }}
              >
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(80, e.target.scrollHeight) + 'px'; }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  maxLength={2000}
                  rows={1}
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.75rem',
                    borderRadius: 12,
                    border: `1.5px solid #e2e8f0`,
                    fontSize: '0.84rem',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.45,
                    background: 'white',
                    transition: 'border 0.15s ease',
                    overflow: 'hidden',
                    minHeight: 36,
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="chat-send-btn"
                  style={{
                    width: 36, height: 36, flexShrink: 0,
                    borderRadius: 10, border: 'none',
                    background: text.trim() && !sending ? accentColor : '#e2e8f0',
                    color: text.trim() && !sending ? 'white' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: text.trim() && !sending ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    boxShadow: text.trim() && !sending ? `0 4px 12px ${accentColor}44` : 'none',
                  }}
                >
                  {sending
                    ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Send size={14} />
                  }
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── Floating Action Button ── */}
        <button
          id="chatbox-fab"
          onClick={() => setOpen(v => !v)}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${accentColor}55, 0 2px 8px rgba(0,0,0,0.12)`,
            transition: 'all 0.2s ease',
            position: 'relative',
            animation: unread > 0 && !open ? 'chatBounce 0.6s ease 1' : 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accentColor}66, 0 4px 12px rgba(0,0,0,0.15)`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}55, 0 2px 8px rgba(0,0,0,0.12)`; }}
          title={open ? 'Close chat' : 'Open job chat'}
          aria-label="Chat"
        >
          {open
            ? <X size={22} color="white" />
            : <MessageCircle size={22} color="white" />
          }

          {/* Unread badge */}
          {!open && unread > 0 && (
            <span style={{
              position: 'absolute',
              top: 0, right: 0,
              minWidth: 18, height: 18,
              background: '#ef4444',
              color: 'white',
              fontSize: '0.62rem',
              fontWeight: 900,
              borderRadius: 999,
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 6px rgba(239,68,68,0.5)',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

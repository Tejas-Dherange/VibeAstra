import { useState, useCallback } from 'react';
import {
  Bot, Sparkles, Loader2, AlertTriangle, CheckCircle2,
  Bus, Calendar, Utensils, Briefcase, Zap, Bell, Navigation,
  RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../lib/api';

// ── Type icons ────────────────────────────────────────────────────────────────
function TypeIcon({ type }) {
  const map = {
    placement: Briefcase,
    event: Calendar,
    transport: Bus,
    food: Utensils,
  };
  const Icon = map[type] || Zap;
  return <Icon size={14} />;
}

// ── Priority badge ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  if (priority === 'high') return <span className="badge-high">🔴 HIGH</span>;
  if (priority === 'medium') return <span className="badge-medium">🟡 MEDIUM</span>;
  return <span className="badge-low">🟢 LOW</span>;
}

// ── Single alert row ──────────────────────────────────────────────────────────
function AIAlertRow({ alert, index }) {
  const borderColor = { high: 'hsl(var(--destructive)/0.5)', medium: 'hsl(var(--warning)/0.4)', low: 'hsl(var(--accent)/0.3)' }[alert.priority];
  const bg = { high: 'hsl(var(--destructive)/0.05)', medium: 'hsl(var(--warning)/0.04)', low: 'hsl(var(--accent)/0.04)' }[alert.priority];

  return (
    <div
      className="animate-fade-up"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem',
        background: bg, border: `1px solid ${borderColor}`,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div style={{ color: borderColor, marginTop: '2px', flexShrink: 0 }}>
        <TypeIcon type={alert.type} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
          {alert.message}
        </p>
      </div>
      <PriorityBadge priority={alert.priority} />
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionButton({ action, onExecute, loading }) {
  const style = {
    apply: { bg: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))', border: 'hsl(var(--primary)/0.3)', icon: Briefcase },
    reminder: { bg: 'hsl(var(--warning)/0.1)', color: 'hsl(var(--warning))', border: 'hsl(var(--warning)/0.3)', icon: Bell },
    navigation: { bg: 'hsl(var(--accent)/0.1)', color: 'hsl(var(--accent))', border: 'hsl(var(--accent)/0.3)', icon: Navigation },
  }[action.type] || { bg: 'hsl(var(--muted-bg))', color: 'hsl(var(--foreground))', border: 'hsl(var(--border))', icon: Zap };

  const Icon = style.icon;

  return (
    <button
      onClick={() => onExecute(action)}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1rem', borderRadius: '8px',
        background: style.bg, color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon size={13} />}
      {action.label}
    </button>
  );
}

// ── Main SmartAssistant component ─────────────────────────────────────────────
export default function SmartAssistant() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const runAgent = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionMsg('');
    try {
      const { data } = await api.post('/ai/agent');
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to connect to AI agent';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = useCallback(async (action) => {
    setActionLoading(action.label);
    setActionMsg('');
    try {
      if (action.type === 'apply') {
        if (!action.metadata?.id) {
          setActionMsg('⚠️ No placement ID in action metadata.');
          return;
        }
        await api.post(`/placements/${action.metadata.id}/apply`);
        setActionMsg(`✅ Applied successfully! Check Placements page.`);
      } else if (action.type === 'reminder') {
        setActionMsg(`🔔 Reminder set: "${action.metadata?.message || action.label}"`);
      } else if (action.type === 'navigation') {
        setActionMsg(`🚌 ${action.metadata?.message || 'Time to leave! Head to the bus stop now.'}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      setActionMsg(`❌ ${msg}`);
    } finally {
      setActionLoading(null);
    }
  }, []);

  return (
    <div style={{
      background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: result ? '0 0 0 1px hsl(var(--primary)/0.15), 0 8px 24px rgba(0,0,0,0.2)' : 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, hsl(var(--primary)/0.08), hsl(var(--secondary)/0.06))',
        borderBottom: '1px solid hsl(var(--border))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
            borderRadius: '8px', padding: '6px', display: 'flex',
          }}>
            <Bot size={16} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>🤖 Smart Assistant</p>
            <p style={{ fontSize: '0.72rem', color: 'hsl(var(--muted))' }}>
              Powered by GPT-4o-mini · Analyzes your real campus data
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {result && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted))' }}
            >
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
          <button
            className="btn-primary"
            onClick={runAgent}
            disabled={loading}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            {loading
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
              : result
                ? <><RefreshCw size={13} /> Re-analyze</>
                : <><Sparkles size={13} /> Analyse My Day</>
            }
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          margin: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
          background: 'hsl(var(--destructive)/0.08)', border: '1px solid hsl(var(--destructive)/0.3)',
          color: 'hsl(var(--destructive))', fontSize: '0.85rem',
        }}>
          <strong>⚠️ {error}</strong>
          {error.includes('API key') && (
            <p style={{ marginTop: '0.4rem', fontSize: '0.78rem', opacity: 0.85 }}>
              Add your key to <code>backend/.env</code> → <code>OPENAI_API_KEY=sk-...</code> then restart the backend.
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !error && !loading && (
        <div style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
          <Sparkles size={32} color="hsl(var(--primary)/0.3)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(var(--foreground))' }}>
            Your AI Campus Assistant
          </p>
          <p style={{ fontSize: '0.82rem', color: 'hsl(var(--muted))', marginTop: '0.3rem', maxWidth: '300px', margin: '0.3rem auto 0' }}>
            Click <strong>Analyse My Day</strong> to get personalized AI insights — deadlines, buses, events, and more.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ padding: '1.5rem 1.25rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: '52px', borderRadius: '8px', marginBottom: '0.5rem',
              background: 'hsl(var(--muted-bg))', animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 1 - (i - 1) * 0.2,
            }} />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !collapsed && (
        <div style={{ padding: '1.25rem' }}>
          {/* Summary */}
          <div style={{
            padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--secondary)/0.04))',
            border: '1px solid hsl(var(--primary)/0.15)',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              ✨ AI Summary
            </p>
            <p style={{ fontSize: '0.88rem', color: 'hsl(var(--foreground))', lineHeight: 1.65 }}>
              {result.summary}
            </p>
            {result._meta && (
              <p style={{ fontSize: '0.7rem', color: 'hsl(var(--muted))', marginTop: '0.5rem' }}>
                {result._meta.model} · {result._meta.tokensUsed} tokens · {new Date(result._meta.generatedAt).toLocaleTimeString('en-IN')}
              </p>
            )}
          </div>

          {/* Alerts */}
          {result.alerts?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                🔔 Alerts ({result.alerts.length})
              </p>
              {result.alerts.map((alert, i) => (
                <AIAlertRow key={i} alert={alert} index={i} />
              ))}
            </div>
          )}

          {/* Actions */}
          {result.actions?.length > 0 && (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                ⚡ Suggested Actions
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {result.actions.map((action, i) => (
                  <ActionButton
                    key={i}
                    action={action}
                    onExecute={handleAction}
                    loading={actionLoading === action.label}
                  />
                ))}
              </div>
              {actionMsg && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.6rem 0.875rem', borderRadius: '8px',
                  background: 'hsl(var(--muted-bg))', border: '1px solid hsl(var(--border))',
                  fontSize: '0.83rem', color: 'hsl(var(--foreground))',
                }}>
                  {actionMsg}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}

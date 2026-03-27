import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Clock, Bus, Calendar, UtensilsCrossed,
  Briefcase, RefreshCw, TrendingUp, ChevronRight, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SmartAssistant from '../components/SmartAssistant';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

function PriorityBadge({ priority }) {
  if (priority === 'HIGH') return <span className="badge-high">🔥 HIGH</span>;
  if (priority === 'MEDIUM') return <span className="badge-medium">⚠️ MEDIUM</span>;
  return <span className="badge-low">✅ NORMAL</span>;
}

function AlertCard({ alert, index }) {
  const borderColor = {
    HIGH: 'hsl(var(--destructive) / 0.5)',
    MEDIUM: 'hsl(var(--warning) / 0.4)',
    LOW: 'hsl(var(--accent) / 0.3)',
  }[alert.priority];

  const bgColor = {
    HIGH: 'hsl(var(--destructive) / 0.05)',
    MEDIUM: 'hsl(var(--warning) / 0.04)',
    LOW: 'hsl(var(--accent) / 0.04)',
  }[alert.priority];

  return (
    <div
      className="animate-fade-up"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
        padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '0.625rem',
        background: bgColor, border: `1px solid ${borderColor}`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1.2 }}>{alert.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'hsl(var(--foreground))' }}>
            {alert.title}
          </span>
          <PriorityBadge priority={alert.priority} />
        </div>
        <p style={{ fontSize: '0.82rem', color: 'hsl(var(--muted))', lineHeight: 1.5 }}>{alert.message}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        background: `${color}22`, borderRadius: '10px', padding: '0.75rem',
        color: color, flexShrink: 0,
      }}>
        <Icon size={20} />
      </div>
      <div>
        <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(var(--foreground))', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', marginTop: '0.2rem' }}>{label}</p>
      </div>
    </div>
  );

  return to ? <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [feed, setFeed] = useState({ alerts: [], stats: { high: 0, medium: 0, low: 0, total: 0 } });
  const [summary, setSummary] = useState({ events: 0, placements: 0, buses: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [feedRes, eventsRes, placementsRes, busRes] = await Promise.all([
        api.get('/smart-feed'),
        api.get('/events'),
        api.get('/placements'),
        api.get('/bus'),
      ]);
      setFeed(feedRes.data);
      setSummary({
        events: eventsRes.data.length,
        placements: placementsRes.data.length,
        buses: busRes.data.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="page-wrapper">
      <Navbar alertCount={feed.stats.high} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(var(--foreground))' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: 'hsl(var(--primary))' }}>{user?.name?.split(' ')[0]} 👋</span>
          </h1>
          <p style={{ color: 'hsl(var(--muted))', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Here's what's happening on campus today · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={AlertTriangle} label="Urgent Alerts" value={feed.stats.high} color="hsl(var(--destructive))" />
          <StatCard icon={Calendar} label="Upcoming Events" value={summary.events} color="hsl(var(--primary))" to="/events" />
          <StatCard icon={Briefcase} label="Open Placements" value={summary.placements} color="hsl(var(--secondary))" to="/placements" />
          <StatCard icon={Bus} label="Bus Routes" value={summary.buses} color="hsl(var(--accent))" />
        </div>

        {/* AI Smart Assistant — full width */}
        <div style={{ marginBottom: '2rem' }}>
          <SmartAssistant />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* Smart Feed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="hsl(var(--primary))" />
                <h2 className="section-title">Smart Feed</h2>
                {feed.stats.high > 0 && (
                  <span className="animate-pulse-glow" style={{
                    background: 'hsl(var(--destructive))', color: 'white',
                    borderRadius: '999px', padding: '0.15rem 0.5rem',
                    fontSize: '0.7rem', fontWeight: 700,
                  }}>{feed.stats.high} urgent</span>
                )}
              </div>
              <button className="btn-secondary" onClick={() => fetchData(true)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                disabled={refreshing}>
                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'hsl(var(--muted))' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : feed.alerts.length === 0 ? (
              <div style={{
                background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
                borderRadius: '12px', padding: '3rem', textAlign: 'center',
              }}>
                <CheckCircle2 size={36} color="hsl(var(--accent))" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600 }}>You're all caught up!</p>
                <p style={{ color: 'hsl(var(--muted))', fontSize: '0.875rem', marginTop: '0.25rem' }}>No alerts right now.</p>
              </div>
            ) : (
              <div>
                {feed.alerts.map((alert, i) => (
                  <AlertCard key={alert.id} alert={alert} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar quick links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 className="section-title" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Quick Links</h3>
              {[
                { to: '/events', icon: Calendar, label: 'Browse Events', sub: `${summary.events} upcoming` },
                { to: '/placements', icon: Briefcase, label: 'Placement Tracker', sub: `${summary.placements} open roles` },
              ].map(({ to, icon: Icon, label, sub }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem', borderRadius: '8px', background: 'hsl(var(--muted-bg))',
                    border: '1px solid hsl(var(--border))', transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--card-hover))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'hsl(var(--muted-bg))'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Icon size={15} color="hsl(var(--primary))" />
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{label}</p>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))' }}>{sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} color="hsl(var(--muted))" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Alert breakdown */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 className="section-title" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Alert Summary</h3>
              {[
                { label: 'High Priority', count: feed.stats.high, cls: 'badge-high' },
                { label: 'Medium', count: feed.stats.medium, cls: 'badge-medium' },
                { label: 'Normal', count: feed.stats.low, cls: 'badge-low' },
              ].map(({ label, count, cls }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>{label}</span>
                  <span className={cls}>{count}</span>
                </div>
              ))}
              <hr className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>{feed.stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

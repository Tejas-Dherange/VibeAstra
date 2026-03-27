import { useEffect, useState } from 'react';
import { Briefcase, Clock, Building2, DollarSign, CheckCircle2, Loader2, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

function deadlineInfo(deadline) {
  const diff = new Date(deadline) - new Date();
  const hours = diff / 3600000;
  if (diff < 0) return { text: 'Expired', color: 'hsl(var(--muted))', priority: 'EXPIRED' };
  if (hours < 3) return { text: `${Math.round(hours * 60)}m left`, color: 'hsl(var(--destructive))', priority: 'HIGH' };
  if (hours < 24) return { text: `${Math.round(hours)}h left`, color: 'hsl(var(--warning))', priority: 'MEDIUM' };
  const days = Math.floor(hours / 24);
  return { text: `${days}d left`, color: 'hsl(var(--accent))', priority: 'LOW' };
}

function PlacementCard({ placement, onApply, index }) {
  const { text, color, priority } = deadlineInfo(placement.deadline);
  const [applying, setApplying] = useState(false);
  const { user } = useAuthStore();

  const handleApply = async () => {
    setApplying(true);
    try { await onApply(placement.id); }
    finally { setApplying(false); }
  };

  const applied = placement.applicationStatus === 'APPLIED';

  return (
    <div className="card animate-fade-up" style={{ padding: '1.25rem', animationDelay: `${index * 60}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '8px',
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--primary))',
          }}>
            {placement.company[0]}
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{placement.company}</h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))' }}>{placement.role}</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem',
            borderRadius: '6px', color, background: `${color}22`, border: `1px solid ${color}44`,
          }}>
            {priority !== 'EXPIRED' && '⏰ '}{text}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.83rem', color: 'hsl(var(--muted))', lineHeight: 1.6, marginBottom: '1rem' }}>
        {placement.description}
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {placement.ctc && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'hsl(var(--accent))', fontWeight: 600 }}>
            <DollarSign size={12} /> {placement.ctc}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'hsl(var(--muted))' }}>
          <Clock size={12} />
          {new Date(placement.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Tags */}
      {placement.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {placement.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px',
              background: 'hsl(var(--muted-bg))', color: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
            }}>{tag}</span>
          ))}
        </div>
      )}

      {user?.role === 'STUDENT' && (
        applied ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem',
            borderRadius: '8px', background: 'hsl(var(--accent) / 0.1)',
            border: '1px solid hsl(var(--accent) / 0.3)', color: 'hsl(var(--accent))',
            fontSize: '0.85rem', fontWeight: 600,
          }}>
            <CheckCircle2 size={15} /> Applied
          </div>
        ) : (
          <button className="btn-primary" onClick={handleApply} disabled={applying || priority === 'EXPIRED'} style={{ width: '100%', justifyContent: 'center' }}>
            {applying && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {applying ? 'Applying...' : priority === 'EXPIRED' ? 'Deadline Passed' : 'Apply Now'}
          </button>
        )
      )}
    </div>
  );
}

export default function PlacementsPage() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/placements').then((r) => setPlacements(r.data)).finally(() => setLoading(false));
  }, []);

  const handleApply = async (id) => {
    const { data } = await api.post(`/placements/${id}/apply`);
    setPlacements((prev) =>
      prev.map((p) => p.id === id ? { ...p, applicationStatus: 'APPLIED' } : p)
    );
  };

  const filtered = placements.filter((p) =>
    p.company.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const appliedCount = placements.filter((p) => p.applicationStatus === 'APPLIED').length;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                <Briefcase size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'hsl(var(--primary))' }} />
                Placement Tracker
              </h1>
              <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Track opportunities, apply, and never miss a deadline
              </p>
            </div>
            {user?.role === 'STUDENT' && appliedCount > 0 && (
              <div style={{
                background: 'hsl(var(--accent) / 0.1)', border: '1px solid hsl(var(--accent) / 0.3)',
                borderRadius: '10px', padding: '0.75rem 1.25rem',
                color: 'hsl(var(--accent))', fontWeight: 700, fontSize: '0.9rem',
              }}>
                ✅ {appliedCount} Applied
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '420px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
          <input className="input" placeholder="Search company or role..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'hsl(var(--muted))' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filtered.map((p, i) => (
              <PlacementCard key={p.id} placement={p} onApply={handleApply} index={i} />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

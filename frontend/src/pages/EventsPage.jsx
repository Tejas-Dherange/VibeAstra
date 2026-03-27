import { useEffect, useState } from 'react';
import { Calendar, Clock, Tag, Search, Loader2, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

const CATEGORIES = ['all', 'hackathon', 'web-dev', 'ai', 'cultural', 'finance'];

function timeLeft(date) {
  const diff = new Date(date) - new Date();
  if (diff < 0) return { text: 'Ended', urgent: false };
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return { text: `${Math.floor(diff / 60000)}m left`, urgent: true };
  if (hours < 24) return { text: `${hours}h left`, urgent: true };
  return { text: `${days}d left`, urgent: false };
}

function EventCard({ event, index }) {
  const { text, urgent } = timeLeft(event.date);
  const catColors = {
    hackathon: 'hsl(var(--secondary))',
    'web-dev': 'hsl(var(--primary))',
    ai: 'hsl(var(--accent))',
    cultural: 'hsl(38 92% 55%)',
    finance: 'hsl(163 94% 45%)',
  };
  const color = catColors[event.category] || 'hsl(var(--muted))';

  return (
    <div className="card animate-fade-up" style={{ padding: '1.25rem', animationDelay: `${index * 60}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{
          background: `${color}22`, color, border: `1px solid ${color}44`,
          padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {event.category}
        </span>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '6px',
          background: urgent ? 'hsl(var(--destructive) / 0.15)' : 'hsl(var(--muted-bg))',
          color: urgent ? 'hsl(var(--destructive))' : 'hsl(var(--muted))',
          border: urgent ? '1px solid hsl(var(--destructive) / 0.3)' : '1px solid hsl(var(--border))',
        }}>
          🕐 {text}
        </span>
      </div>

      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
        {event.title}
      </h3>
      <p style={{ fontSize: '0.83rem', color: 'hsl(var(--muted))', lineHeight: 1.6, marginBottom: '1rem' }}>
        {event.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'hsl(var(--muted))' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={12} />
          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={12} />
          {new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    const matchCat = category === 'all' || e.category === category;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            <Calendar size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'hsl(var(--primary))' }} />
            Campus Events
          </h1>
          <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Discover talks, hackathons, workshops and cultural festivals
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
            <input className="input" placeholder="Search events..." value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{
                  padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  background: category === cat ? 'hsl(var(--primary))' : 'hsl(var(--muted-bg))',
                  color: category === cat ? 'white' : 'hsl(var(--muted))',
                  border: category === cat ? 'none' : '1px solid hsl(var(--border))',
                }}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'hsl(var(--muted))' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            background: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))',
          }}>
            <Calendar size={36} color="hsl(var(--muted))" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600 }}>No events found</p>
            <p style={{ color: 'hsl(var(--muted))', fontSize: '0.875rem' }}>Try a different filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filtered.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

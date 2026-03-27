import { useEffect, useState } from 'react';
import {
  Settings, Calendar, Bus, UtensilsCrossed, Briefcase,
  Plus, Trash2, Pencil, Loader2, Check, X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

const TABS = [
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'food', label: 'Food', icon: UtensilsCrossed },
  { id: 'placements', label: 'Placements', icon: Briefcase },
];

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted))' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Events Tab ─────────────────────────────────────────────────────────────
function EventsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', category: '' });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/events').then((r) => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/events', form);
      setModal(false); setForm({ title: '', description: '', date: '', category: '' }); load();
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`); load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add Event</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted))' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted))' }}>
                  {item.category} · {new Date(item.date).toLocaleString('en-IN')}
                </p>
              </div>
              <button className="btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => del(item.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Event">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} /></div>
          <div><label className="label">Date & Time</label><input className="input" type="datetime-local" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div>
            <label className="label">Category</label>
            <select className="input" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category...</option>
              {['hackathon', 'web-dev', 'ai', 'cultural', 'finance'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} /> : <Check size={14} />} Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Bus Tab ─────────────────────────────────────────────────────────────────
function BusTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ route: '', arrivalTime: '', status: 'on-time' });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/bus').then((r) => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/bus', form); setModal(false); setForm({ route: '', arrivalTime: '', status: 'on-time' }); load(); }
    finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm('Delete?')) { await api.delete(`/bus/${id}`); load(); } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add Route</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.route}</p>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted))' }}>
                  {new Date(item.arrivalTime).toLocaleString('en-IN')} · <span style={{ color: item.status === 'on-time' ? 'hsl(var(--accent))' : 'hsl(var(--warning))' }}>{item.status}</span>
                </p>
              </div>
              <button className="btn-danger" style={{ padding: '0.4rem 0.75rem' }} onClick={() => del(item.id)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Bus Route">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label className="label">Route</label><input className="input" required value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} /></div>
          <div><label className="label">Arrival Time</label><input className="input" type="datetime-local" required value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} /></div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="on-time">On-time</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Loader2 size={14} /> : <Check size={14} />} Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Food Tab ─────────────────────────────────────────────────────────────────
function FoodTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ menu: '', rating: 3 });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/food').then((r) => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/food', { ...form, rating: parseFloat(form.rating) }); setModal(false); setForm({ menu: '', rating: 3 }); load(); }
    finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm('Delete?')) { await api.delete(`/food/${id}`); load(); } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add Menu</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, paddingRight: '1rem' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Rating: {item.rating}/5 {'⭐'.repeat(Math.round(item.rating))}</p>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted))', marginTop: '0.25rem' }}>{item.menu.slice(0, 100)}...</p>
              </div>
              <button className="btn-danger" style={{ padding: '0.4rem 0.75rem', flexShrink: 0 }} onClick={() => del(item.id)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Mess Menu">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label className="label">Menu</label><textarea className="input" required value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} rows={4} placeholder="Breakfast: ..., Lunch: ..., Dinner: ..." /></div>
          <div>
            <label className="label">Rating (1-5): <strong style={{ color: 'hsl(var(--primary))' }}>{form.rating}</strong></label>
            <input type="range" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={{ width: '100%', accentColor: 'hsl(var(--primary))' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Loader2 size={14} /> : <Check size={14} />} Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Placements Tab ───────────────────────────────────────────────────────────
function PlacementsAdminTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', description: '', deadline: '', ctc: '', tags: '' });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/placements').then((r) => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/placements', { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) });
      setModal(false); setForm({ company: '', role: '', description: '', deadline: '', ctc: '', tags: '' }); load();
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm('Delete this placement?')) { await api.delete(`/placements/${id}`); load(); } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add Placement</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.company} – {item.role}</p>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted))' }}>
                  Deadline: {new Date(item.deadline).toLocaleString('en-IN')} {item.ctc ? `· ${item.ctc}` : ''}
                </p>
              </div>
              <button className="btn-danger" style={{ padding: '0.4rem 0.75rem' }} onClick={() => del(item.id)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Placement">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label className="label">Company</label><input className="input" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="label">Role</label><input className="input" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label className="label">Deadline</label><input className="input" type="datetime-local" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div><label className="label">CTC</label><input className="input" placeholder="e.g. 28 LPA" value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} /></div>
          </div>
          <div><label className="label">Tags (comma separated)</label><input className="input" placeholder="web-dev, ai, backend" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Loader2 size={14} /> : <Check size={14} />} Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('events');

  const tabContent = {
    events: <EventsTab />,
    bus: <BusTab />,
    food: <FoodTab />,
    placements: <PlacementsAdminTab />,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            <Settings size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'hsl(var(--secondary))' }} />
            Admin Panel
          </h1>
          <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage campus data — events, buses, food menus, and placements
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1rem', borderRadius: '8px 8px 0 0',
                border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                background: activeTab === id ? 'hsl(var(--card))' : 'transparent',
                color: activeTab === id ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                borderBottom: activeTab === id ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="animate-fade-up">
          {tabContent[activeTab]}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

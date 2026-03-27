import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const INTEREST_OPTIONS = [
  { value: 'web-dev', label: '🌐 Web Dev' },
  { value: 'ai', label: '🤖 AI/ML' },
  { value: 'hackathon', label: '⚡ Hackathon' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'consulting', label: '📊 Consulting' },
  { value: 'cultural', label: '🎭 Cultural' },
  { value: 'backend', label: '⚙️ Backend' },
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const toggleInterest = (val) =>
    setInterests((prev) => prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, interests);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'hsl(var(--background))', padding: '1rem',
    }}>
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, hsl(var(--secondary) / 0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
            borderRadius: '16px', padding: '14px', marginBottom: '1rem',
            boxShadow: '0 8px 24px hsl(var(--primary) / 0.3)',
          }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Campus<span style={{ color: 'hsl(var(--primary))' }}>Care</span>
          </h1>
          <p style={{ color: 'hsl(var(--muted))', fontSize: '0.875rem' }}>Create your student account</p>
        </div>

        <div style={{
          background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
          borderRadius: '16px', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create Account</h2>

          {error && (
            <div style={{
              background: 'hsl(var(--destructive) / 0.1)', border: '1px solid hsl(var(--destructive) / 0.3)',
              borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem',
              color: 'hsl(var(--destructive))', fontSize: '0.875rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
                <input className="input" placeholder="Arjun Sharma" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
                <input className="input" type="email" placeholder="your@campus.edu" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
                <input className="input" type="password" placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6}
                  style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="label">Your Interests (for smart alerts)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {INTEREST_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value} type="button" onClick={() => toggleInterest(value)}
                    style={{
                      padding: '0.3rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem',
                      cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
                      background: interests.includes(value) ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--muted-bg))',
                      color: interests.includes(value) ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                      border: interests.includes(value) ? '1px solid hsl(var(--primary) / 0.5)' : '1px solid hsl(var(--border))',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading && <Loader2 size={15} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

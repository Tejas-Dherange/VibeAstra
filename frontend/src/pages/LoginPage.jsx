import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') { setEmail('admin@campus.edu'); setPassword('admin123'); }
    else { setEmail('arjun@campus.edu'); setPassword('student123'); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'hsl(var(--background))', padding: '1rem',
    }}>
      {/* Background gradient blobs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, hsl(var(--secondary) / 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
            borderRadius: '16px', padding: '14px', marginBottom: '1rem',
            boxShadow: '0 8px 24px hsl(var(--primary) / 0.3)',
          }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--foreground))' }}>
            Campus<span style={{ color: 'hsl(var(--primary))' }}>Care</span>
          </h1>
          <p style={{ color: 'hsl(var(--muted))', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Smart Campus Assistant
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
          borderRadius: '16px', padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Sign In</h2>

          {error && (
            <div style={{
              background: 'hsl(var(--destructive) / 0.1)', border: '1px solid hsl(var(--destructive) / 0.3)',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem',
              color: 'hsl(var(--destructive))', fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
                <input
                  className="input"
                  type="email"
                  placeholder="your@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted))' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid hsl(var(--border))' }}>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', textAlign: 'center', marginBottom: '0.75rem' }}>
              Quick demo access
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => fillDemo('student')} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                🎓 Student
              </button>
              <button className="btn-secondary" onClick={() => fillDemo('admin')} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                ⚙️ Admin
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>
            No account?{' '}
            <Link to="/signup" style={{ color: 'hsl(var(--primary))', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

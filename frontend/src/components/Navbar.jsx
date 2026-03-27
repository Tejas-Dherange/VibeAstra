import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, GraduationCap, LayoutDashboard, Calendar, Briefcase, Settings, LogOut, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

export default function Navbar({ alertCount = 0 }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/placements', icon: Briefcase, label: 'Placements' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', icon: Settings, label: 'Admin' }] : []),
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav style={{
      background: 'hsl(var(--card) / 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid hsl(var(--border))',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '2rem' }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
              borderRadius: '10px', padding: '6px', display: 'flex'
            }}>
              <GraduationCap size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'hsl(var(--foreground))' }}>
              Campus<span style={{ color: 'hsl(var(--primary))' }}>Care</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.75rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 500,
                background: isActive(to) ? 'hsl(var(--primary) / 0.15)' : 'transparent',
                color: isActive(to) ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                transition: 'all 0.2s',
              }}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Alert Bell */}
            <div style={{ position: 'relative' }}>
              <button className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px' }}>
                <Bell size={16} />
              </button>
              {alertCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: 'hsl(var(--destructive))', color: 'white',
                  width: '18px', height: '18px', borderRadius: '50%',
                  fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </div>

            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'hsl(var(--muted-bg))', border: '1px solid hsl(var(--border))',
                  borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer',
                  color: 'hsl(var(--foreground))', fontSize: '0.85rem',
                }}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                <span style={{
                  fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                  background: user?.role === 'ADMIN' ? 'hsl(var(--secondary) / 0.2)' : 'hsl(var(--accent) / 0.2)',
                  color: user?.role === 'ADMIN' ? 'hsl(var(--secondary))' : 'hsl(var(--accent))',
                }}>
                  {user?.role}
                </span>
                <ChevronDown size={13} />
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
                  borderRadius: '10px', minWidth: '180px', padding: '0.5rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200,
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid hsl(var(--border))', marginBottom: '0.4rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{user?.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'hsl(var(--muted))' }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'hsl(var(--destructive))', fontSize: '0.85rem', fontWeight: 500,
                    }}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Layers, Menu, Shield } from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: 64,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-secondary btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Layers size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
              Dev<span style={{ color: 'var(--primary)' }}>Pulse</span>
            </h1>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Agile Project Suite
            </span>
          </div>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'right' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <span className={`badge badge-role-${user.role}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                  {user.role === 'admin' && <Shield size={10} />}
                  {user.role}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.jobTitle}</span>
              </div>
            </div>

            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar" />
            ) : (
              <div className="avatar">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign out of DevPulse"
            id="nav-logout-btn"
          >
            <LogOut size={15} />
            <span style={{ display: 'none' }} className="logout-text">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

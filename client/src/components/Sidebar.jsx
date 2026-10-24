import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  CheckSquare,
  BarChart3,
  Users,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, login } = useAuth();
  const { showToast } = useToast();

  const handleDemoSwitch = async (email, roleLabel) => {
    try {
      await login(email, 'Password123!');
      showToast(`Switched persona to ${roleLabel}`, 'success');
      if (onCloseMobile) onCloseMobile();
    } catch (err) {
      showToast(`Failed to switch demo account: ${err.message}`, 'error');
    }
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/kanban', label: 'Kanban Board', icon: Columns3 },
    { to: '/tasks', label: 'Tasks List', icon: CheckSquare },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ to: '/users', label: 'Team & RBAC', icon: Users });
  }

  return (
    <aside
      className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}
      style={{
        width: 250,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        flexShrink: 0,
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            padding: '0 0.75rem',
          }}
        >
          Workspace Navigation
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Evaluation Persona Switcher */}
      <div
        className="card"
        style={{
          padding: '1rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px dashed var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <Sparkles size={14} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Role Evaluator
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Quick-switch persona to evaluate RBAC and view filters:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            onClick={() => handleDemoSwitch('admin@devpulse.io', 'Admin (Alex M.)')}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          >
            <Zap size={12} color="#a855f7" /> Admin
          </button>
          <button
            onClick={() => handleDemoSwitch('sarah.lead@devpulse.io', 'Manager (Sarah C.)')}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          >
            <Zap size={12} color="#3b82f6" /> Manager
          </button>
          <button
            onClick={() => handleDemoSwitch('alex.dev@devpulse.io', 'Member (Alex R.)')}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          >
            <Zap size={12} color="#10b981" /> Developer
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

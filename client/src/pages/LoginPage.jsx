import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Layers, LogIn, Sparkles, Shield, UserCheck, Code } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      showToast('Welcome back to DevPulse!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    showToast(`Loaded ${demoRole} credentials`, 'info');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(99, 102, 241, 0.6)',
              margin: '0 auto 1rem',
            }}
          >
            <Layers size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Sign in to <span style={{ color: 'var(--primary)' }}>DevPulse</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Next-gen Agile Sprint & Team Project Collaboration Suite
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
              id="login-submit-btn"
            >
              <LogIn size={16} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Evaluator Personas */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
              <Sparkles size={14} color="#a855f7" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c7d2fe' }}>
                Capstone Evaluator Personas (1-Click)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@devpulse.io', 'Admin')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem', flexDirection: 'column', gap: '0.2rem' }}
              >
                <Shield size={14} color="#c084fc" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('sarah.lead@devpulse.io', 'Manager')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem', flexDirection: 'column', gap: '0.2rem' }}
              >
                <UserCheck size={14} color="#60a5fa" />
                <span>Manager</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('alex.dev@devpulse.io', 'Developer')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem', flexDirection: 'column', gap: '0.2rem' }}
              >
                <Code size={14} color="#34d399" />
                <span>Developer</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

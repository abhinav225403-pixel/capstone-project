import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import statsService from '../services/statsService';
import projectService from '../services/projectService';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, projectsRes, usersRes] = await Promise.all([
        statsService.getDashboardStats(),
        projectService.getProjects({ limit: 4 }),
        statsService.getUsers(),
      ]);

      setStats(statsRes.data);
      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton skeleton-title" style={{ width: '40%' }} />
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
        </div>
        <LoadingSkeleton type="stats" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <LoadingSkeleton type="cards" count={2} />
          <LoadingSkeleton type="table" count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorState
          title="Dashboard Telemetry Unavailable"
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  const { summary = {}, statusCounts = {}, priorityCounts = {}, recentActivities = [] } = stats || {};

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.85rem' }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name}</span>
            </h1>
            <span className={`badge badge-role-${user?.role}`}>{user?.role}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your live sprint velocity and project telemetry for today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="btn btn-primary"
            id="dash-create-task-btn"
          >
            <Plus size={16} /> New Task
          </button>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="btn btn-secondary"
              id="dash-create-proj-btn"
            >
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Top Telemetry Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderKanban size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Projects</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.activeProjects || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Tasks</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.totalTasks || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completion Velocity</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.completionRate || 0}%</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Urgent Attention</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{priorityCounts.urgent || 0}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Sprints vs Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem' }}>
        {/* Active Projects Overview */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.15rem' }}>Active Projects</h2>
            </div>
            <button onClick={() => navigate('/projects')} className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No projects created yet. Click "New Project" to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map((p) => {
                const progress = p.stats ? p.stats.progress : 0;
                return (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/projects/${p._id}`)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-glow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      {p.description ? p.description.slice(0, 90) + '...' : 'No description provided.'}
                    </p>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        <span>Progress ({p.stats?.completedTasks || 0}/{p.stats?.totalTasks || 0} tasks)</span>
                        <span>{progress}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: progress === 100 ? 'var(--accent-emerald)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-Time Activity Audit Trail */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem' }}>Workspace Audit Trail</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Feed</span>
          </div>

          {recentActivities.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No recorded activity yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: 380, overflowY: 'auto' }}>
              {recentActivities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {act.user?.name ? act.user.name[0] : 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{act.user?.name || 'User'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0' }}>
                      {act.details || act.action}
                    </p>
                    {act.project && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>
                        [{act.project.key || 'PRJ'}] {act.project.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={projects}
        users={users}
        onTaskSaved={fetchDashboardData}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        users={users}
        onProjectSaved={fetchDashboardData}
      />
    </div>
  );
};

export default DashboardPage;

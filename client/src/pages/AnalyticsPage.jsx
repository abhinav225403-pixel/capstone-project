import React, { useState, useEffect } from 'react';
import statsService from '../services/statsService';
import taskService from '../services/taskService';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, tasksRes] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getUsers(),
        taskService.getTasks({ limit: 100 }),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load telemetry analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportJSON = () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        summary: stats?.summary,
        statusBreakdown: stats?.statusCounts,
        priorityBreakdown: stats?.priorityCounts,
        totalTasksRecorded: tasks.length,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devpulse-analytics-report-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Analytics summary exported as JSON', 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSkeleton type="stats" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <LoadingSkeleton type="cards" count={2} />
          <LoadingSkeleton type="cards" count={2} />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="page-container">
        <ErrorState
          title="Analytics Telemetry Error"
          message={error || 'Unable to retrieve telemetry metrics.'}
          onRetry={fetchAnalytics}
        />
      </div>
    );
  }

  const { summary = {}, statusCounts = {}, priorityCounts = {} } = stats;
  const totalTasks = summary.totalTasks || 1;

  // Workload per team member
  const memberWorkload = users.map((u) => {
    const assigned = tasks.filter((t) => t.assignee && (t.assignee._id === u._id || t.assignee === u._id));
    const completed = assigned.filter((t) => t.status === 'done');
    return {
      user: u,
      total: assigned.length,
      completed: completed.length,
      percentage: assigned.length > 0 ? Math.round((completed.length / assigned.length) * 100) : 0,
    };
  });

  return (
    <div className="page-container">
      {/* Header */}
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
          <h1 style={{ fontSize: '1.85rem' }}>Analytics & Sprint Velocity</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Telemetry, team bandwidth allocation, and status distribution metrics
          </p>
        </div>

        <button onClick={handleExportJSON} className="btn btn-secondary" id="export-report-btn">
          <Download size={15} /> Export Report (JSON)
        </button>
      </div>

      {/* Top Velocity Banner */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sprint Health & Completion Index
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {summary.completionRate}%
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>
                ({statusCounts.done || 0} of {summary.totalTasks || 0} tasks resolved)
              </span>
            </div>
          </div>

          <div style={{ minWidth: 240 }}>
            <div style={{ height: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${summary.completionRate}%`,
                  background: 'linear-gradient(90deg, #6366f1, #10b981)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              <span>Target: 85%+</span>
              <span>Status: {summary.completionRate > 50 ? 'On Track' : 'Needs Focus'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Status Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.15rem' }}>Workflow Status Distribution</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Backlog', count: statusCounts.backlog || 0, color: '#94a3b8' },
              { label: 'To Do', count: statusCounts.todo || 0, color: '#06b6d4' },
              { label: 'In Progress', count: statusCounts.in_progress || 0, color: '#6366f1' },
              { label: 'In Review', count: statusCounts.in_review || 0, color: '#f59e0b' },
              { label: 'Done', count: statusCounts.done || 0, color: '#10b981' },
            ].map((item) => {
              const pct = Math.round((item.count / totalTasks) * 100);
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.count} tasks ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BarChart3 size={18} color="var(--accent-rose)" />
            <h2 style={{ fontSize: '1.15rem' }}>Priority Distribution</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Urgent', count: priorityCounts.urgent || 0, color: '#f43f5e' },
              { label: 'High', count: priorityCounts.high || 0, color: '#f97316' },
              { label: 'Medium', count: priorityCounts.medium || 0, color: '#eab308' },
              { label: 'Low', count: priorityCounts.low || 0, color: '#64748b' },
            ].map((item) => {
              const pct = Math.round((item.count / totalTasks) * 100);
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.count} tasks ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Workload Allocation */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Users size={18} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.15rem' }}>Team Bandwidth & Allocation</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {memberWorkload.map(({ user: member, total, completed, percentage }) => (
            <div
              key={member._id}
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="avatar" style={{ width: 32, height: 32 }}>
                  {member.name ? member.name[0] : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.jobTitle || member.role}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span>Assigned: {total} tasks</span>
                <span>{completed} resolved ({percentage}%)</span>
              </div>

              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: percentage === 100 ? 'var(--accent-emerald)' : 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

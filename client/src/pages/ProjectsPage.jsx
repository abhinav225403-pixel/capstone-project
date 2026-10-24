import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import statsService from '../services/statsService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ProjectModal from '../components/ProjectModal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, usersRes] = await Promise.all([
        projectService.getProjects({
          search,
          status: statusFilter,
          priority: priorityFilter,
          limit: 50,
        }),
        statsService.getUsers(),
      ]);

      setProjects(projRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, priorityFilter]);

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (project, e) => {
    e.stopPropagation();
    setDeletingProject(project);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleteLoading(true);
    try {
      await projectService.deleteProject(deletingProject._id);
      showToast('Project removed successfully', 'success');
      setDeletingProject(null);
      fetchProjects();
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const canManageProject = (p) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const ownerId = p.owner?._id || p.owner;
    return ownerId === user._id;
  };

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
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Projects & Workspaces</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage team project scopes, milestones, and deliverable targets
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          id="create-project-btn"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.5rem 0.75rem' }}
            placeholder="Search projects by name, key, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ padding: '0.5rem 0.75rem', width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="form-select"
            style={{ padding: '0.5rem 0.75rem', width: 'auto' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* 4 Screen States Handling */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : error ? (
        <ErrorState
          title="Could not load projects"
          message={error}
          onRetry={fetchProjects}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            search || statusFilter || priorityFilter
              ? 'No projects match your active search filters. Try resetting the criteria.'
              : 'You have not created or been assigned to any projects yet.'
          }
          actionLabel="Create Project"
          onAction={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {projects.map((p) => {
            const progress = p.stats ? p.stats.progress : 0;
            const isOwnerOrAdmin = canManageProject(p);

            return (
              <div
                key={p._id}
                className="card"
                onClick={() => navigate(`/projects/${p._id}`)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#c7d2fe',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      {p.key}
                    </span>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <PriorityBadge priority={p.priority} />
                      <StatusBadge status={p.status} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{p.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <span>Sprint Progress</span>
                      <span>{p.stats?.completedTasks || 0}/{p.stats?.totalTasks || 0} ({progress}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: progress === 100 ? 'var(--accent-emerald)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Metadata: Target Date & Members */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span>
                        {p.targetDate ? new Date(p.targetDate).toLocaleDateString() : 'No deadline'}
                      </span>
                    </div>

                    {/* Team Members Avatars */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', marginLeft: 8 }}>
                        {(p.members || []).slice(0, 3).map((m, idx) => (
                          <div
                            key={m._id || idx}
                            className="avatar"
                            style={{
                              width: 24,
                              height: 24,
                              fontSize: '0.65rem',
                              marginLeft: idx > 0 ? -6 : 0,
                              zIndex: 3 - idx,
                            }}
                            title={m.name}
                          >
                            {m.name ? m.name[0] : 'U'}
                          </div>
                        ))}
                        {(p.members || []).length > 3 && (
                          <div
                            className="avatar"
                            style={{
                              width: 24,
                              height: 24,
                              fontSize: '0.65rem',
                              marginLeft: -6,
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            +{p.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (if owner or admin) */}
                  {isOwnerOrAdmin && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                        paddingTop: '0.5rem',
                      }}
                    >
                      <button
                        onClick={(e) => handleEdit(p, e)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Project"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={(e) => handleDeletePrompt(p, e)}
                        className="btn btn-danger btn-sm"
                        title="Delete Project"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        users={users}
        onProjectSaved={fetchProjects}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${deletingProject?.name}"?`}
        message="This will permanently delete the project and all associated tasks, comments, and milestones. This action cannot be reversed."
        confirmText="Yes, Delete Project"
        isDanger={true}
        loading={isDeleteLoading}
      />
    </div>
  );
};

export default ProjectsPage;

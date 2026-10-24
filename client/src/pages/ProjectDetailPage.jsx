import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import statsService from '../services/statsService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Columns3,
} from 'lucide-react';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        projectService.getProjectById(id),
        taskService.getTasks({ project: id, limit: 100 }),
        statsService.getUsers(),
      ]);

      setProject(projRes.data);
      setTasks(tasksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleDeleteProject = async () => {
    try {
      await projectService.deleteProject(id);
      showToast('Project deleted successfully', 'success');
      navigate('/projects');
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-container">
        <button onClick={() => navigate('/projects')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back to Projects
        </button>
        <ErrorState
          title="Project Not Found"
          message={error || 'The requested project could not be loaded.'}
          onRetry={fetchProjectDetails}
        />
      </div>
    );
  }

  const isOwnerOrAdmin = user && (user.role === 'admin' || project.owner?._id === user._id);
  const progress = project.stats?.progress || 0;

  return (
    <div className="page-container">
      {/* Navigation & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/projects')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Projects
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(`/kanban?project=${project._id}`)}
            className="btn btn-secondary btn-sm"
          >
            <Columns3 size={15} /> Open Kanban Board
          </button>

          {isOwnerOrAdmin && (
            <>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={() => setDeletingProject(true)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#c7d2fe',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                {project.key}
              </span>
              <h1 style={{ fontSize: '1.85rem' }}>{project.name}</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 800, fontSize: '0.95rem', lineHeight: 1.5 }}>
              {project.description || 'No detailed description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <PriorityBadge priority={project.priority} />
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Owner</span>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{project.owner?.name || 'Unknown'}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category</span>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{project.category}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Deadline</span>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>
              {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'None set'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget</span>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>
              ${(project.budget || 0).toLocaleString()}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Progress</span>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2, color: 'var(--accent-emerald)' }}>
              {progress}% ({project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0} tasks)
            </div>
          </div>
        </div>
      </div>

      {/* Sprints / Tasks Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Sprint Tasks ({tasks.length})</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              All deliverables and work items tracked within this project
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks in this project"
            description="Create the first task to begin tracking your sprint progress."
            actionLabel="Add Task"
            onAction={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Task ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Priority</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assignee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Due Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color var(--transition-fast)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)' }}>
                      {task.taskNumber || 'TASK'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {task.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {task.assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>
                            {task.assignee.name ? task.assignee.name[0] : 'U'}
                          </div>
                          <span>{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projects={[project]}
        users={users}
        defaultProjectId={project._id}
        onTaskSaved={fetchProjectDetails}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={project}
        users={users}
        onProjectSaved={fetchProjectDetails}
      />

      <ConfirmationModal
        isOpen={deletingProject}
        onClose={() => setDeletingProject(false)}
        onConfirm={handleDeleteProject}
        title={`Delete "${project.name}"?`}
        message="This will permanently delete this project and all its tasks. This cannot be undone."
        confirmText="Confirm Delete"
        isDanger={true}
      />
    </div>
  );
};

export default ProjectDetailPage;

import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import statsService from '../services/statsService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TaskModal from '../components/TaskModal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';

export const TasksListPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // Pagination & Sorting (ICTAK Section 6.6)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskRes, projRes, usersRes] = await Promise.all([
        taskService.getTasks({
          search,
          project: projectFilter,
          status: statusFilter,
          priority: priorityFilter,
          assignee: assigneeFilter,
          page,
          limit,
          sortBy,
          order,
        }),
        projectService.getProjects({ limit: 50 }),
        statsService.getUsers(),
      ]);

      setTasks(taskRes.data || []);
      setPagination(taskRes.pagination || { total: 0, totalPages: 1 });
      setProjects(projRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, projectFilter, statusFilter, priorityFilter, assigneeFilter, page, sortBy, order]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (task) => {
    setDeletingTask(task);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleteLoading(true);
    try {
      await taskService.deleteTask(deletingTask._id);
      showToast('Task deleted successfully', 'success');
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setIsDeleteLoading(false);
    }
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
          <h1 style={{ fontSize: '1.85rem' }}>Sprint Tasks & Backlog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Structured table with multi-filter queries, sorting, and pagination
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          id="task-create-btn"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.55rem 0.75rem' }}
            placeholder="Search by title, ticket ID, description, or tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            value={assigneeFilter}
            onChange={(e) => {
              setAssigneeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem', marginLeft: 'auto' }}
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [sb, ord] = e.target.value.split('-');
              setSortBy(sb);
              setOrder(ord);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="dueDate-asc">Due Date (Earliest)</option>
            <option value="estimatedHours-desc">Highest Estimate</option>
          </select>
        </div>
      </div>

      {/* 4 Screen States Handling */}
      {loading ? (
        <LoadingSkeleton type="table" count={8} />
      ) : error ? (
        <ErrorState
          title="Could not load tasks"
          message={error}
          onRetry={fetchTasks}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Try clearing your filters or create a new task to get started."
          actionLabel="Create Task"
          onAction={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.4)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Ticket</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Title</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Project</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Priority</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Assignee</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Estimate</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
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
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {task.taskNumber || 'TASK'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>
                      <span
                        onClick={() => handleEdit(task)}
                        style={{ cursor: 'pointer', color: 'var(--text-main)', transition: 'color var(--transition-fast)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {task.project?.name || '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
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
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {task.estimatedHours ? `${task.estimatedHours}h` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleEdit(task)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: 28, height: 28 }}
                          title="Edit Task"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          className="btn btn-danger btn-icon"
                          style={{ width: 28, height: 28 }}
                          title="Delete Task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (ICTAK Section 6.6) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Showing {tasks.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
              {Math.min(page * limit, pagination.total)} of {pagination.total} tasks
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
                Page {page} of {pagination.totalPages || 1}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        projects={projects}
        users={users}
        onTaskSaved={fetchTasks}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${deletingTask?.taskNumber || deletingTask?.title}"?`}
        message="Are you sure you want to delete this task? All associated checklist items and comments will be permanently erased."
        confirmText="Confirm Delete"
        isDanger={true}
        loading={isDeleteLoading}
      />
    </div>
  );
};

export default TasksListPage;

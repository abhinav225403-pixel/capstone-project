import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Send, CheckSquare, MessageSquare } from 'lucide-react';
import taskService from '../services/taskService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

export const TaskModal = ({
  isOpen,
  onClose,
  task = null,
  projects = [],
  users = [],
  defaultProjectId = '',
  defaultStatus = 'todo',
  onTaskSaved,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || (projects[0] ? projects[0]._id : ''),
    status: defaultStatus,
    priority: 'medium',
    type: 'feature',
    assignee: '',
    dueDate: '',
    estimatedHours: 0,
    tags: '',
  });

  const [checklist, setChecklist] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.project ? (task.project._id || task.project) : defaultProjectId,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        type: task.type || 'feature',
        assignee: task.assignee ? (task.assignee._id || task.assignee) : '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours || 0,
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      });
      setChecklist(task.checklist || []);
      setComments(task.comments || []);
    } else {
      setFormData({
        title: '',
        description: '',
        project: defaultProjectId || (projects[0] ? projects[0]._id : ''),
        status: defaultStatus,
        priority: 'medium',
        type: 'feature',
        assignee: '',
        dueDate: '',
        estimatedHours: 0,
        tags: '',
      });
      setChecklist([]);
      setComments([]);
    }
    setErrors({});
  }, [task, isOpen, defaultProjectId, defaultStatus, projects]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters';
    }

    if (!formData.project) {
      errs.project = 'Please select a project';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        estimatedHours: Number(formData.estimatedHours) || 0,
        checklist,
      };

      if (!payload.assignee) {
        delete payload.assignee;
      }

      if (task && task._id) {
        await taskService.updateTask(task._id, payload);
        showToast('Task updated successfully', 'success');
      } else {
        await taskService.createTask(payload);
        showToast('Task created successfully', 'success');
      }

      if (onTaskSaved) onTaskSaved();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklist([...checklist, { title: newChecklistText.trim(), completed: false }]);
    setNewChecklistText('');
  };

  const handleToggleChecklist = (index) => {
    const updated = [...checklist];
    updated[index].completed = !updated[index].completed;
    setChecklist(updated);
  };

  const handleRemoveChecklist = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !task) return;

    try {
      const res = await taskService.addComment(task._id, newCommentText);
      setComments([...comments, res.data]);
      setNewCommentText('');
      showToast('Comment posted', 'success');
    } catch (err) {
      showToast('Failed to add comment', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>{task ? `Edit ${task.taskNumber || 'Task'}` : 'Create New Task'}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {task ? 'Update details, checklist items, and collaborate' : 'Fill in the details to add a task to your sprint'}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Title */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-title">
                Task Title *
              </label>
              <input
                id="task-title"
                className="form-input"
                placeholder="e.g. Implement OAuth login and token refresh"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Project & Assignee */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="task-project">Project *</label>
                <select
                  id="task-project"
                  className="form-select"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      [{p.key}] {p.name}
                    </option>
                  ))}
                </select>
                {errors.project && <span className="form-error">{errors.project}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="task-assignee">Assignee</label>
                <select
                  id="task-assignee"
                  className="form-select"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.jobTitle || u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status, Priority & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                  <option value="task">Task</option>
                  <option value="improvement">Improvement</option>
                </select>
              </div>
            </div>

            {/* Due Date & Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="task-due">Due Date</label>
                <input
                  id="task-due"
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="task-hours">Estimate (Hours)</label>
                <input
                  id="task-hours"
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-tags">Tags (Comma-separated)</label>
              <input
                id="task-tags"
                className="form-input"
                placeholder="Frontend, API, Auth, Sprint-3"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                rows="3"
                placeholder="Detailed specifications, criteria, and steps to reproduce..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Embedded Checklist Subdocuments (ICTAK Section 6.4) */}
            <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckSquare size={14} color="var(--primary)" />
                  Acceptance Criteria / Checklist ({checklist.filter((c) => c.completed).length}/{checklist.length})
                </span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {checklist.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(15, 23, 42, 0.4)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(idx)}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '0.85rem',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'var(--text-muted)' : 'var(--text-main)',
                      }}
                    >
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(idx)}
                      style={{ color: 'var(--accent-rose)', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                  placeholder="Add a testable acceptance criteria..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Embedded Comments Section (if task exists) */}
            {task && (
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={14} color="var(--primary)" />
                    Activity & Discussion ({comments.length})
                  </span>
                </label>

                <div
                  style={{
                    maxHeight: 180,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  {comments.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No comments yet. Start the discussion!
                    </span>
                  ) : (
                    comments.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(15, 23, 42, 0.5)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, color: '#c7d2fe' }}>{c.authorName || 'Team Member'}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-main)', margin: 0 }}>{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                    placeholder="Write a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="btn btn-secondary btn-sm"
                  >
                    <Send size={14} /> Send
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="task-modal-submit-btn">
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

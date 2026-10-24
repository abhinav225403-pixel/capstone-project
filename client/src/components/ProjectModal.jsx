import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import projectService from '../services/projectService';
import { useToast } from '../context/ToastContext';

export const ProjectModal = ({
  isOpen,
  onClose,
  project = null,
  users = [],
  onProjectSaved,
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    category: 'Full Stack Development',
    priority: 'medium',
    status: 'active',
    targetDate: '',
    budget: 0,
    members: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        key: project.key || '',
        description: project.description || '',
        category: project.category || 'Full Stack Development',
        priority: project.priority || 'medium',
        status: project.status || 'active',
        targetDate: project.targetDate ? project.targetDate.split('T')[0] : '',
        budget: project.budget || 0,
        members: project.members ? project.members.map((m) => (m._id || m)) : [],
      });
    } else {
      setFormData({
        name: '',
        key: '',
        description: '',
        category: 'Full Stack Development',
        priority: 'medium',
        status: 'active',
        targetDate: '',
        budget: 0,
        members: [],
      });
    }
    setErrors({});
  }, [project, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Project name is required';
    }
    if (!formData.key.trim()) {
      errs.key = 'Project key is required';
    } else if (formData.key.trim().length < 2 || formData.key.trim().length > 10) {
      errs.key = 'Key must be 2 to 10 characters';
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
        key: formData.key.toUpperCase(),
        budget: Number(formData.budget) || 0,
      };

      if (project && project._id) {
        await projectService.updateProject(project._id, payload);
        showToast('Project updated successfully', 'success');
      } else {
        await projectService.createProject(payload);
        showToast('Project created successfully', 'success');
      }

      if (onProjectSaved) onProjectSaved();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (userId) => {
    const current = [...formData.members];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(userId);
    }
    setFormData({ ...formData, members: current });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>{project ? 'Edit Project' : 'Create New Project'}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure project scope, milestone timelines, and assign team members
            </p>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="proj-name">Project Name *</label>
                <input
                  id="proj-name"
                  className="form-input"
                  placeholder="e.g. Fintech Core API Engine"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="proj-key">Key Prefix *</label>
                <input
                  id="proj-key"
                  className="form-input"
                  placeholder="e.g. FIN"
                  maxLength={10}
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                />
                {errors.key && <span className="form-error">{errors.key}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="Cloud Engineering">Cloud Engineering</option>
                  <option value="Fintech & Security">Fintech & Security</option>
                  <option value="Healthcare Tech">Healthcare Tech</option>
                  <option value="Mobile Development">Mobile Development</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
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
                <label className="form-label" htmlFor="proj-target">Target Date</label>
                <input
                  id="proj-target"
                  type="date"
                  className="form-input"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="proj-budget">Budget ($)</label>
                <input
                  id="proj-budget"
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="proj-desc">Description</label>
              <textarea
                id="proj-desc"
                className="form-textarea"
                rows="3"
                placeholder="High-level architecture, goals, and technical scope..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Team Members Assignment */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assigned Team Members</label>
              <div
                style={{
                  maxHeight: 140,
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                {users.map((u) => {
                  const isChecked = formData.members.includes(u._id);
                  return (
                    <label
                      key={u._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        padding: '0.3rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleMemberToggle(u._id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        ({u.jobTitle || u.role})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="proj-submit-btn">
              {loading ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

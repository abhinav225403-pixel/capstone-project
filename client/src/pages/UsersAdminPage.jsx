import React, { useState, useEffect } from 'react';
import statsService from '../services/statsService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';

export const UsersAdminPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await statsService.getUsers({ search });
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await statsService.updateUserRole(userId, newRole);
      showToast(`Role updated to ${newRole}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await statsService.toggleUserStatus(userId);
      showToast('User status updated', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to change user status', 'error');
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShieldAlert size={48} color="var(--accent-rose)" style={{ margin: '0 auto 1rem' }} />
          <h2>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Role-Based Access Control: This administration panel is restricted to system administrators only.
          </p>
        </div>
      </div>
    );
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="var(--accent-purple)" />
            <h1 style={{ fontSize: '1.85rem' }}>Team & Access Control (RBAC)</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage user roles, privileges, and account activations
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.5rem 0.75rem' }}
            placeholder="Search users by name, email, department, or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 4 Screen States Handling */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorState
          title="Could not load users"
          message={error}
          onRetry={fetchUsers}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.4)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Member</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Title & Dept</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Assigned Role</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u._id === currentUser._id;
                  return (
                    <tr
                      key={u._id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="avatar">
                            {u.name ? u.name[0] : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {u.name} {isCurrent && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                        <div>{u.jobTitle || 'Software Engineer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.department || 'Engineering'}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <select
                          className="form-select"
                          style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          value={u.role}
                          disabled={isCurrent}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="member">Member</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          className="badge"
                          style={{
                            background: u.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: u.isActive ? '#6ee7b7' : '#fda4af',
                            border: `1px solid ${u.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                          }}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        {!isCurrent && (
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            {u.isActive ? (
                              <>
                                <UserX size={12} /> Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={12} /> Reactivate
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdminPage;

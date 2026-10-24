import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import statsService from '../services/statsService';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PriorityBadge from '../components/PriorityBadge';
import TaskModal from '../components/TaskModal';
import {
  Plus,
  Filter,
  CheckSquare,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#94a3b8' },
  { id: 'todo', title: 'To Do', color: '#06b6d4' },
  { id: 'in_progress', title: 'In Progress', color: '#6366f1' },
  { id: 'in_review', title: 'In Review', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#10b981' },
];

export const KanbanBoardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedProjectId = searchParams.get('project') || '';
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [targetColumnStatus, setTargetColumnStatus] = useState('todo');

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const fetchBoardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, usersRes] = await Promise.all([
        projectService.getProjects({ limit: 50 }),
        statsService.getUsers(),
      ]);

      const projList = projRes.data || [];
      setProjects(projList);
      setUsers(usersRes.data || []);

      // Determine active project
      const activeProjId = selectedProjectId || (projList[0] ? projList[0]._id : '');
      if (!selectedProjectId && activeProjId) {
        setSearchParams({ project: activeProjId });
      }

      if (activeProjId) {
        const taskParams = { project: activeProjId, limit: 100 };
        if (assigneeFilter) taskParams.assignee = assigneeFilter;
        const taskRes = await taskService.getTasks(taskParams);
        setTasks(taskRes.data || []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load kanban sprint board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [selectedProjectId, assigneeFilter]);

  // Status transition handler (Optimistic UI update)
  const handleMoveStatus = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    // Optimistic local update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'info', 2000);
    } catch (err) {
      // Revert upon failure
      setTasks(originalTasks);
      showToast(err.message || 'Failed to update task status', 'error');
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      handleMoveStatus(taskId, status);
      setDraggedTaskId(null);
    }
  };

  const openCreateForColumn = (status) => {
    setSelectedTask(null);
    setTargetColumnStatus(status);
    setIsModalOpen(true);
  };

  const openEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const currentProject = projects.find((p) => p._id === selectedProjectId);

  return (
    <div className="page-container" style={{ paddingBottom: '0.5rem' }}>
      {/* Board Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Interactive Kanban Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Visual agile workflow with drag-and-drop state transitions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Project Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedProjectId}
              onChange={(e) => setSearchParams({ project: e.target.value })}
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Member Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assignee:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">All Members</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => openCreateForColumn('todo')}
            className="btn btn-primary btn-sm"
            id="kanban-create-task-btn"
          >
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* 4 Screen States Handling */}
      {loading ? (
        <LoadingSkeleton type="kanban" />
      ) : error ? (
        <ErrorState
          title="Failed to Load Kanban Board"
          message={error}
          onRetry={fetchBoardData}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No Projects Available"
          description="Create a project first before opening the sprint kanban board."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col, colIdx) => {
            const colTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: col.color,
                        boxShadow: `0 0 8px ${col.color}`,
                      }}
                    />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{col.title}</h3>
                    <span
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateForColumn(col.id)}
                    className="btn btn-secondary btn-icon"
                    style={{ width: 26, height: 26 }}
                    title={`Add task to ${col.title}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Cards List */}
                <div className="kanban-tasks-list">
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      Drop tasks here or click + to add
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const completedChecklist = (task.checklist || []).filter((c) => c.completed).length;
                      const totalChecklist = (task.checklist || []).length;

                      return (
                        <div
                          key={task._id}
                          className="kanban-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task._id)}
                          onClick={() => openEditTask(task)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                color: 'var(--primary)',
                                fontWeight: 700,
                              }}
                            >
                              {task.taskNumber || 'TASK'}
                            </span>
                            <PriorityBadge priority={task.priority} />
                          </div>

                          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                            {task.title}
                          </h4>

                          {/* Checklist & Comments count indicators */}
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                            {totalChecklist > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckSquare size={12} color="var(--primary)" />
                                {completedChecklist}/{totalChecklist}
                              </span>
                            )}
                            {(task.comments || []).length > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MessageSquare size={12} />
                                {task.comments.length}
                              </span>
                            )}
                          </div>

                          {/* Card Footer: Assignee & Direction Shift arrows */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {task.assignee ? (
                                <>
                                  <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>
                                    {task.assignee.name ? task.assignee.name[0] : 'U'}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {task.assignee.name.split(' ')[0]}
                                  </span>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unassigned</span>
                              )}
                            </div>

                            {/* Accessible Directional Shift Buttons */}
                            <div style={{ display: 'flex', gap: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                              {colIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStatus(task._id, COLUMNS[colIdx - 1].id)}
                                  className="btn btn-secondary btn-icon"
                                  style={{ width: 22, height: 22, padding: 0 }}
                                  title={`Move left to ${COLUMNS[colIdx - 1].title}`}
                                >
                                  <ArrowLeft size={11} />
                                </button>
                              )}
                              {colIdx < COLUMNS.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStatus(task._id, COLUMNS[colIdx + 1].id)}
                                  className="btn btn-secondary btn-icon"
                                  style={{ width: 22, height: 22, padding: 0 }}
                                  title={`Move right to ${COLUMNS[colIdx + 1].title}`}
                                >
                                  <ArrowRight size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        projects={projects}
        users={users}
        defaultProjectId={selectedProjectId}
        defaultStatus={targetColumnStatus}
        onTaskSaved={fetchBoardData}
      />
    </div>
  );
};

export default KanbanBoardPage;

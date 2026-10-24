import React from 'react';

const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Completed',
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export const StatusBadge = ({ status }) => {
  const normalized = status ? status.toLowerCase() : 'todo';
  const label = STATUS_LABELS[normalized] || status;

  return (
    <span className={`badge badge-${normalized}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;

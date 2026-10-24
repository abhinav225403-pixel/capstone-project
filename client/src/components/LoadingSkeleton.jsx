import React from 'react';

export const LoadingSkeleton = ({ type = 'cards', count = 3 }) => {
  if (type === 'stats') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card" style={{ height: 110 }}>
            <div className="skeleton skeleton-title" style={{ width: '40%', height: '0.85rem' }} />
            <div className="skeleton" style={{ width: '60%', height: '1.75rem', marginTop: '0.5rem' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="card">
        <div className="skeleton skeleton-title" style={{ width: '30%', marginBottom: '1.5rem' }} />
        {[...Array(count)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '70%', height: '1rem', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ width: '40%', height: '0.75rem' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'kanban') {
    return (
      <div className="kanban-board">
        {[...Array(5)].map((_, colIndex) => (
          <div key={colIndex} className="kanban-column" style={{ minHeight: 400 }}>
            <div className="kanban-column-header">
              <div className="skeleton" style={{ width: 100, height: 16 }} />
              <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
            </div>
            <div className="kanban-tasks-list">
              {[...Array(2)].map((_, cardIndex) => (
                <div key={cardIndex} className="kanban-card skeleton" style={{ height: 110 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default 'cards'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card skeleton-card skeleton" />
      ))}
    </div>
  );
};

export default LoadingSkeleton;

import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="state-empty" role="region" aria-label="Empty State">
      <div className="state-empty-icon">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

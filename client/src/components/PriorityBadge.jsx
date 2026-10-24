import React from 'react';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', icon: AlertCircle, colorClass: 'badge-urgent' },
  high: { label: 'High', icon: ArrowUp, colorClass: 'badge-high' },
  medium: { label: 'Medium', icon: ArrowRight, colorClass: 'badge-medium' },
  low: { label: 'Low', icon: ArrowDown, colorClass: 'badge-low' },
};

export const PriorityBadge = ({ priority = 'medium' }) => {
  const norm = priority ? priority.toLowerCase() : 'medium';
  const config = PRIORITY_CONFIG[norm] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;

  return (
    <span className={`badge ${config.colorClass}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

export default PriorityBadge;

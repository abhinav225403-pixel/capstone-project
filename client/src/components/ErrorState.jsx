import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view. Please try again.',
  onRetry,
}) => {
  return (
    <div className="state-error" role="alert">
      <div className="state-error-icon">
        <AlertTriangle size={28} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary">
          <RefreshCw size={15} />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorState;

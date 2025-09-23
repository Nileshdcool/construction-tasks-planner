import React, { useState } from 'react';
import { ChecklistRowProps, computeStatus } from './ChecklistTypes';
import { ChecklistItemStatusBadge } from '../ChecklistItemStatusBadge';
import { ChecklistItemStatusSelector } from '../ChecklistItemStatusSelector';
import { ChecklistItemStatus } from '../../store/taskStore';

const iconFor = (state: ReturnType<typeof computeStatus>) => {
  if (state === 'blocked') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 border border-red-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </span>
    );
  }
  if (state === 'completed') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 border border-green-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </span>
    );
  }
  if (state === 'final') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 border border-blue-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 border border-gray-300 mr-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
    </span>
  );
};

export const ChecklistRow: React.FC<ChecklistRowProps> = ({ item, mode, onToggle, onRemove, onStatusChange }) => {
  const [editingStatus, setEditingStatus] = useState(false);
  const state = computeStatus(item);
  const completed = !!item.completed;
  const currentStatus = ('status' in item && item.status) ? item.status : 'not-started';

  const handleStatusChange = (newStatus: ChecklistItemStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setEditingStatus(false);
  };

  return (
    <li className="flex items-start py-3 px-6 group">
      {mode === 'view' ? (
        <button
          className="mt-1 mr-3 focus:outline-none"
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggle) onToggle(!completed);
          }}
          aria-label={completed ? 'Mark as not done' : 'Mark as done'}
        >
          {iconFor(state)}
        </button>
      ) : (
        <span className="mt-1 mr-3">{iconFor(state)}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-base ${state === 'blocked' ? 'text-red-700 font-semibold' : completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
          {item.title}
        </div>
        <div className="text-xs mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChecklistItemStatusBadge status={currentStatus} size="sm" />
            {mode === 'view' && onStatusChange && !editingStatus && (
              <button
                onClick={() => setEditingStatus(true)}
                className="text-blue-600 hover:text-blue-700 text-xs"
              >
                Change
              </button>
            )}
          </div>
        </div>
        {editingStatus && mode === 'view' && (
          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
            <div className="text-xs font-medium text-gray-700 mb-2">Change status:</div>
            <ChecklistItemStatusSelector
              value={currentStatus}
              onChange={handleStatusChange}
              showCustomInput={true}
              className="text-xs"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setEditingStatus(false)}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {mode === 'create' && onRemove && (
        <button
          type="button"
          className="ml-2 text-xs text-red-500 hover:underline opacity-70 group-hover:opacity-100"
          onClick={onRemove}
        >
          Remove
        </button>
      )}
    </li>
  );
};

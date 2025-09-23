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
  if (state === 'done') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 border border-green-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </span>
    );
  }
  if (state === 'final-check') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 border border-amber-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
      </span>
    );
  }
  if (state === 'in-progress') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 border border-blue-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12l8-8 8 8M6 10.5V19a1 1 0 001 1h3m0 0h3m-3 0v-3.5a1 1 0 011-1h2a1 1 0 011 1V20m-6 0v3" /></svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 border border-gray-300 mr-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
    </span>
  );
};

export const ChecklistRow: React.FC<ChecklistRowProps> = ({ item, mode, onToggle, onRemove, onStatusChange, onEdit, onDelete }) => {
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const state = computeStatus(item);
  const completed = !!item.completed;
  const currentStatus = ('status' in item && item.status) ? item.status : 'not-started';

  const handleStatusChange = (newStatus: ChecklistItemStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setEditingStatus(false);
  };

  const handleTitleEdit = () => {
    if (editTitle.trim() && editTitle.trim() !== item.title && onEdit) {
      onEdit(editTitle.trim());
    }
    setEditingTitle(false);
    setEditTitle(item.title); // Reset if cancelled or no change
  };

  const handleTitleCancel = () => {
    setEditTitle(item.title);
    setEditingTitle(false);
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
        {editingTitle && mode === 'view' ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-base font-medium border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleEdit();
                } else if (e.key === 'Escape') {
                  handleTitleCancel();
                }
              }}
              onBlur={handleTitleEdit}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTitleEdit();
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Save
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTitleCancel();
                }}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={`font-medium text-base cursor-pointer ${state === 'blocked' ? 'text-red-700 font-semibold' : completed ? 'text-green-700 line-through' : 'text-gray-900'}`}
            onClick={() => mode === 'view' && setEditingTitle(true)}
          >
            {item.title}
          </div>
        )}
        <div className="text-xs mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChecklistItemStatusBadge status={currentStatus} size="sm" />
            {mode === 'view' && onStatusChange && !editingStatus && !editingTitle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingStatus(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs"
              >
                Change Status
              </button>
            )}
            {mode === 'view' && onEdit && !editingStatus && !editingTitle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingTitle(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs"
              >
                Edit
              </button>
            )}
            {mode === 'view' && onDelete && !editingStatus && !editingTitle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this checklist item?')) {
                    onDelete();
                  }
                }}
                className="text-red-600 hover:text-red-700 text-xs"
              >
                Delete
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingStatus(false);
                }}
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
        >
          Remove
        </button>
      )}
    </li>
  );
};

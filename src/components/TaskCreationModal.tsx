import React, { useState, useEffect } from 'react';
import { TaskStatus } from '../store/taskStore';

interface FloorPlanPosition {
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
}

interface TaskCreationModalProps {
  isOpen: boolean;
  position: FloorPlanPosition | null;
  onClose: () => void;
  onCreateTask: (taskData: {
    title: string;
    description?: string;
    status: TaskStatus;
    position: FloorPlanPosition;
  }) => Promise<void>;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  position,
  onClose,
  onCreateTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not-started');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Checklist state
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus('not-started');
      setError('');

      setChecklist([]);
      setNewChecklistItem('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!position) {
      setError('No position selected');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const taskData: {
        title: string;
        description?: string;
        status: TaskStatus;
        position: FloorPlanPosition;
        checklist?: string[];
      } = {
        title: title.trim(),
        status,
        position
      };
      if (description.trim()) {
        taskData.description = description.trim();
      }
      if (checklist.length > 0) {
        taskData.checklist = checklist;
      }
      await onCreateTask(taskData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Task
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Position Info */}
              {position && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-blue-800">
                      Position: {Math.round(position.relativeX)}%, {Math.round(position.relativeY)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title..."
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task description (optional)..."
                    disabled={isSubmitting}
                  />
                </div>


                {/* Checklist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Checklist</label>
                  <div className="flex mb-2 px-0">
                    <button
                      type="button"
                      className="flex items-center border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full px-3 py-1 text-sm font-medium mr-2 transition"
                      disabled={isSubmitting || !newChecklistItem.trim()}
                      onClick={() => {
                        if (newChecklistItem.trim()) {
                          setChecklist([...checklist, newChecklistItem.trim()]);
                          setNewChecklistItem('');
                        }
                      }}
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                      ADD NEW ITEM
                    </button>
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={e => setNewChecklistItem(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Checklist item..."
                      disabled={isSubmitting}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newChecklistItem.trim()) {
                          setChecklist([...checklist, newChecklistItem.trim()]);
                          setNewChecklistItem('');
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  {checklist.length > 0 && (
                    <ul className="divide-y divide-gray-100 mb-2">
                      {checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start py-2 px-0">
                          {/* Icon: always not started for creation */}
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 border border-gray-300 mr-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-base text-gray-900">{item}</div>
                            <div className="text-xs mt-0.5 flex items-center">
                              <span className="text-gray-400">Not started</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ml-2 text-xs text-red-500 hover:underline opacity-70 group-hover:opacity-100"
                            onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))}
                            disabled={isSubmitting}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    id="task-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="final-check">Final Check</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Task'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
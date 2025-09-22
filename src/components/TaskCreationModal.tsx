import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useUserFloorPlans } from '../store/floorPlanStore';
import { TaskStatus } from '../store/taskStore';
import { ChecklistList } from './checklist/ChecklistList';

interface FloorPlanPosition {
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
}

interface TaskCreationModalProps {
  isOpen: boolean;
  position?: FloorPlanPosition | null; // optional for board usage
  initialStatus?: TaskStatus;
  onClose: () => void;
  onCreateTask: (taskData: {
    title: string;
    description?: string;
    status: TaskStatus;
    position?: FloorPlanPosition; // optional
    checklist?: string[];
  }) => Promise<void | { id: string }>;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  position = null,
  initialStatus = 'not-started',
  onClose,
  onCreateTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Checklist state
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [checklistCollapsed, setChecklistCollapsed] = useState(false);

  // Plan selection

  const floorPlans = useUserFloorPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Set selected plan when plans are loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setError('');
      setChecklist([]);
      setNewChecklistItem('');
      if (floorPlans.length > 0 && floorPlans[0]) {
        setSelectedPlanId(floorPlans[0].id);
      } else {
        setSelectedPlanId('');
      }
    }
  }, [isOpen, floorPlans]);

  // If plans load after modal is open, update selected plan
  useEffect(() => {
    if (isOpen && !selectedPlanId && floorPlans.length > 0 && floorPlans[0]) {
      setSelectedPlanId(floorPlans[0].id);
    }
  }, [floorPlans, isOpen, selectedPlanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const taskData: {
        title: string;
        description?: string;
        status: TaskStatus;
        position?: FloorPlanPosition;
        checklist?: string[];
      } = {
        title: title.trim(),
        status,
        ...(position ? { position } : {})
      };
      if (description.trim()) {
        taskData.description = description.trim();
      }
      if (checklist.length > 0) {
        taskData.checklist = checklist;
      }
      if (selectedPlanId) {
        (taskData as any).planId = selectedPlanId;
      }
      await onCreateTask(taskData);
      toast.success('Task created successfully!');
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
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-2 bg-gray-50 cursor-pointer select-none"
                    onClick={() => setChecklistCollapsed(c => !c)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-800">Checklist</span>
                      <span className="text-xs text-gray-500">{checklist.length} item{checklist.length!==1?'s':''}</span>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${checklistCollapsed ? '-rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {!checklistCollapsed && (
                    <div className="p-4 pt-3">
                      <div className="flex mb-3">
                        <input
                          type="text"
                          value={newChecklistItem}
                          onChange={e => setNewChecklistItem(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
                          placeholder="Add new checklist item..."
                          disabled={isSubmitting}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newChecklistItem.trim()) {
                              setChecklist([...checklist, newChecklistItem.trim()]);
                              setNewChecklistItem('');
                              e.preventDefault();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-3 py-1 text-sm font-medium transition"
                          disabled={isSubmitting || !newChecklistItem.trim()}
                          onClick={() => {
                            if (newChecklistItem.trim()) {
                              setChecklist([...checklist, newChecklistItem.trim()]);
                              setNewChecklistItem('');
                            }
                          }}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          Add
                        </button>
                      </div>
                      <ChecklistList
                        items={checklist.map(title => ({ title }))}
                        mode="create"
                        onRemoveTempItem={(idx) => setChecklist(checklist.filter((_, i) => i !== idx))}
                      />
                    </div>
                  )}
                </div>

                {/* Plan Selector */}
                <div>
                  <label htmlFor="task-plan" className="block text-sm font-medium text-gray-700 mb-1">
                    Plan
                  </label>
                  <select
                    id="task-plan"
                    value={selectedPlanId}
                    onChange={e => setSelectedPlanId(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting || floorPlans.length === 0}
                  >
                    {floorPlans.length === 0 && <option value="">No plans available</option>}
                    {floorPlans.map(fp => (
                      <option key={fp.id} value={fp.id}>{fp.name}</option>
                    ))}
                  </select>
                  {floorPlans.length === 0 && (
                    <div className="text-xs text-red-600 mt-1">No plans available. Please create a plan first.</div>
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
                disabled={isSubmitting || !title.trim() || floorPlans.length === 0}
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
import React from 'react';
import { Task, ChecklistItem, useTaskStore, TaskStatus } from '../store/taskStore';
import { ChecklistList } from './checklist/ChecklistList';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  checklist: ChecklistItem[];
  onClose: () => void;
  onAddChecklistItem: (title: string) => void;
  onToggleChecklistItem: (itemId: string, completed: boolean) => void;
}


export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  task,
  checklist,
  onClose,
  onAddChecklistItem,
  onToggleChecklistItem,
}) => {
  const [newItem, setNewItem] = React.useState('');
  const [collapsed, setCollapsed] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(task ? task.title : '');
  const [editDescription, setEditDescription] = React.useState(task?.description || '');
  const [editStatus, setEditStatus] = React.useState<TaskStatus>(task ? task.status : 'not-started');
  const updateTask = useTaskStore(s => s.updateTask);

  React.useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditStatus(task.status);
    }
  }, [task?.id]);
  if (!isOpen || !task) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!editTitle.trim()) return;
          await updateTask(task.id, {
            title: editTitle.trim(),
            ...(editDescription.trim() ? { description: editDescription.trim() } : {}),
            status: editStatus
          });
        }}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Task</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as TaskStatus)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="final-check">Final Check</option>
                  <option value="done">Done</option>
                </select>
              </div>
              {/* Checklist unified section */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-2 bg-gray-50 cursor-pointer select-none"
                  onClick={() => setCollapsed(c => !c)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-800">Checklist</span>
                    <span className="text-xs text-gray-500">{checklist.length} item{checklist.length!==1?'s':''}</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${collapsed ? '-rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
                {!collapsed && (
                  <div className="p-4 pt-3">
                    <div className="flex mb-3">
                      <input
                        type="text"
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
                        placeholder="Add new checklist item..."
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newItem.trim()) {
                            onAddChecklistItem(newItem.trim());
                            setNewItem('');
                            e.preventDefault();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-3 py-1 text-sm font-medium transition"
                        disabled={!newItem.trim()}
                        onClick={() => {
                          if (newItem.trim()) {
                            onAddChecklistItem(newItem.trim());
                            setNewItem('');
                          }
                        }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add
                      </button>
                    </div>
                    <ChecklistList
                      items={checklist}
                      mode="view"
                      onToggleItem={(id, completed) => onToggleChecklistItem(id, completed)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              disabled={!editTitle.trim()}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { Task, ChecklistItem } from '../store/taskStore';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  checklist: ChecklistItem[];
  onClose: () => void;
  onAddChecklistItem: (title: string) => void;
  onToggleChecklistItem: (itemId: string, completed: boolean) => void;
}

const statusIcon = (item: ChecklistItem) => {
  // Blocked/error
  if (item.title.toLowerCase().includes('block') || item.title.toLowerCase().includes('error')) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 border border-red-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </span>
    );
  }
  // Completed
  if (item.completed) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 border border-green-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </span>
    );
  }
  // In progress/final check
  if (item.title.toLowerCase().includes('final')) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 border border-blue-400 mr-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
      </span>
    );
  }
  // Not started
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 border border-gray-300 mr-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
    </span>
  );
};

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  task,
  checklist,
  onClose,
  onAddChecklistItem,
  onToggleChecklistItem,
}) => {
  const [newItem, setNewItem] = React.useState('');
  if (!isOpen || !task) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-900 text-white font-bold text-lg">CI</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                {task.title}
                {task.status === 'blocked' && (
                  <span className="ml-2 text-red-600 text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                    Ticket progress is blocked
                  </span>
                )}
              </h2>
              <div className="text-xs text-gray-500 mt-1">Task ID: {task.id.slice(-6)}</div>
            </div>
          </div>
          <span className="text-xs text-gray-500 font-medium">{checklist.length} STEPS</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Checklist */}
        <div className="px-0 py-0">
          <ul className="divide-y divide-gray-100 mb-2">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-start py-3 px-6">
                <button
                  className="mt-1 mr-3 focus:outline-none"
                  onClick={() => onToggleChecklistItem(item.id, !item.completed)}
                  aria-label={item.completed ? 'Mark as not done' : 'Mark as done'}
                >
                  {statusIcon(item)}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-base ${item.completed ? 'text-green-700 line-through' : item.title.toLowerCase().includes('block') ? 'text-red-700 font-semibold' : 'text-gray-900'}`}>{item.title}</div>
                  <div className="text-xs mt-0.5 flex items-center">
                    {item.completed && <span className="text-green-600">Done: Part installation done</span>}
                    {!item.completed && item.title.toLowerCase().includes('block') && <span className="text-red-600">Blocked : Part installation done</span>}
                    {!item.completed && !item.title.toLowerCase().includes('block') && <span className="text-gray-400">Not started</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center px-6 pb-4 pt-2">
            <button
              className="flex items-center border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full px-3 py-1 text-sm font-medium mr-2 transition"
              onClick={() => {
                if (newItem.trim()) {
                  onAddChecklistItem(newItem.trim());
                  setNewItem('');
                }
              }}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
              ADD NEW ITEM
            </button>
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Checklist item..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

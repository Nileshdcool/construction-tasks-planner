import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { Navigation } from '../components/Navigation';
import { useCurrentUser } from '../store/authStore';
import { useUserTasks, useTaskStore, Task, TaskStatus, ChecklistItem } from '../store/taskStore';

const StatusBadge: React.FC<{ status: TaskStatus }> = React.memo(({ status }) => {
  const statusConfig = {
    'not-started': { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    'blocked': { label: 'Blocked', color: 'bg-red-100 text-red-800' },
    'final-check': { label: 'Final Check', color: 'bg-yellow-100 text-yellow-800' },
    'done': { label: 'Done', color: 'bg-green-100 text-green-800' },
  };

  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
});

// ✅ Optimized TaskCard with React.memo
const TaskCard: React.FC<{ 
  task: Task; 
  checklistItems: ChecklistItem[];
  onTaskClick?: (task: Task) => void;
}> = React.memo(({ task, checklistItems, onTaskClick }) => {
  const completedCount = useMemo(() => 
    checklistItems.filter(item => item.completed).length, 
    [checklistItems]
  );
  
  const progressPercentage = useMemo(() => 
    checklistItems.length > 0 ? (completedCount / checklistItems.length) * 100 : 0,
    [completedCount, checklistItems.length]
  );

  const handleClick = useCallback(() => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  }, [task, onTaskClick]);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
        <StatusBadge status={task.status} />
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{checklistItems.length} checklist items</span>
        <span>{completedCount} completed</span>
      </div>
      
      {checklistItems.length > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export const TaskBoardView: React.FC = () => {
  const currentUser = useCurrentUser();
  const tasks = useUserTasks();
  const taskStore = useTaskStore();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isLoading, setIsLoading] = useState(false);

  // Checklist modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // ✅ Optimized checklist data with better dependency tracking
  const checklistData = useMemo(() => {
    const data: Record<string, ChecklistItem[]> = {};
    const allChecklistItems = taskStore.checklistItems;
    
    for (const task of tasks) {
      data[task.id] = allChecklistItems.filter(item => item.taskId === task.id);
    }
    
    return data;
  }, [tasks, taskStore.checklistItems]);

  // ✅ Memoized task categorization
  const tasksByStatus = useMemo(() => ({
    'not-started': tasks.filter(task => task.status === 'not-started'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    'blocked': tasks.filter(task => task.status === 'blocked'),
    'final-check': tasks.filter(task => task.status === 'final-check'),
    'done': tasks.filter(task => task.status === 'done'),
  }), [tasks]);

  // ✅ Optimized data loading with proper loading states
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        await taskStore.loadUserTasks(currentUser.id);
      } catch (error) {
        console.error('Error loading task data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // ✅ Optimized callback handlers
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedTask(null);
  }, []);

  const handleAddChecklistItem = useCallback((title: string) => {
    if (selectedTask) {
      taskStore.addChecklistItem(selectedTask.id, title);
    }
  }, [selectedTask, taskStore]);

  const handleToggleChecklistItem = useCallback((itemId: string, completed: boolean) => {
    taskStore.toggleChecklistItem(itemId, completed);
  }, [taskStore]);


  const handleAddTask = useCallback((status: TaskStatus) => {
    console.log('Add task with status:', status);
    // TODO: Open create task modal with pre-selected status
  }, []);

  const handleViewModeChange = useCallback((mode: 'board' | 'list') => {
    setViewMode(mode);
  }, []);

  if (!currentUser) {
    return null; // Protected route should handle this
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ BoardView component
  const BoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
        <div key={status} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 capitalize">
              {status.replace('-', ' ')}
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {statusTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {statusTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No tasks</p>
              </div>
            ) : (
              statusTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  checklistItems={checklistData[task.id] || []}
                  onTaskClick={handleTaskClick}
                />
              ))
            )}
          </div>
          
          <button 
            onClick={() => handleAddTask(status as TaskStatus)}
            className="w-full mt-3 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="text-sm">+ Add Task</span>
          </button>
        </div>
      ))}
    </div>
  );

  // ✅ ListView component
  const ListView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">All Tasks</h3>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first task</p>
          <button 
            onClick={() => handleAddTask('not-started')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {tasks.map(task => {
            const taskChecklistItems = checklistData[task.id] || [];
            return (
              <div 
                key={task.id} 
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Task #{task.id.slice(-6)}</span>
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                      <span>{taskChecklistItems.length} checklist items</span>
                      <span>{taskChecklistItems.filter(item => item.completed).length} completed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-gray-400 hover:text-gray-600 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit task:', task.id);
                      }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-600 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete task:', task.id);
                      }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <TaskDetailsModal
        isOpen={detailsOpen}
        task={selectedTask}
        checklist={selectedTask ? checklistData[selectedTask.id] || [] : []}
        onClose={handleCloseDetails}
        onAddChecklistItem={handleAddChecklistItem}
        onToggleChecklistItem={handleToggleChecklistItem}
      />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleAddTask('not-started')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                + New Task
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                Filter
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                Sort
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('board')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition duration-200 ${
                    viewMode === 'board'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
              </div>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'board' ? <BoardView /> : <ListView />}
        </div>
      </main>
    </div>
  );
};
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { TaskCreationModal } from '../components/TaskCreationModal';
import { Navigation } from '../components/Navigation';
import { useCurrentUser } from '../store/authStore';
import { useUserTasks, useTaskStore, Task, TaskStatus, ChecklistItem } from '../store/taskStore';
import { useUserFloorPlans } from '../store/floorPlanStore';

const StatusBadge: React.FC<{ status: TaskStatus }> = React.memo(({ status }) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide';
  const mapping: Record<TaskStatus, { label: string; cls: string }> = {
    'not-started': { label: 'Not Started', cls: 'bg-gray-100 text-gray-700 border border-gray-200' },
    'in-progress': { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    'blocked': { label: 'Blocked', cls: 'bg-red-50 text-red-700 border border-red-200' },
    'final-check': { label: 'Final Check', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    'done': { label: 'Done', cls: 'bg-green-50 text-green-700 border border-green-200' }
  };
  const cfg = mapping[status];
  return <span className={`${base} ${cfg.cls}`}>{cfg.label}</span>;
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

  const showProgress = checklistItems.length > 0;
  return (
    <div
      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      <div className="p-3 pb-2 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-gray-900">{task.title}</h4>
        </div>
        <StatusBadge status={task.status} />
      </div>
      {task.description && (
        <div className="px-3 pb-2 -mt-1">
          <p className="text-[11px] text-gray-600 line-clamp-2 leading-snug">{task.description}</p>
        </div>
      )}
      <div className="px-3 pb-3 mt-auto">
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{completedCount}/{checklistItems.length} steps</span>
          {showProgress && (
            <span className="font-medium text-gray-600 tabular-nums">{Math.round(progressPercentage)}%</span>
          )}
        </div>
        {showProgress && (
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export const TaskBoardView: React.FC = () => {
  const currentUser = useCurrentUser();
  const tasks = useUserTasks();
  const floorPlans = useUserFloorPlans();
  const taskStore = useTaskStore();
  const floorPlanStore = require('../store/floorPlanStore');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [preselectedStatus, setPreselectedStatus] = useState<TaskStatus>('not-started');
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
        // Load floor plans first
        if (floorPlanStore && floorPlanStore.useFloorPlanStore) {
          await floorPlanStore.useFloorPlanStore.getState().loadUserFloorPlans(currentUser.id);
        }
        await taskStore.loadUserTasks(currentUser.id);
      } catch (error) {
        console.error('Error loading task or plan data:', error);
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
    setPreselectedStatus(status);
    setShowCreateModal(true);
  }, []);

  const handleCreateTask = useCallback(async (data: { title: string; description?: string; status: TaskStatus; checklist?: string[] }) => {
    if (!currentUser) return;
    const baseTask: { title: string; status?: TaskStatus; userId: string; description?: string } = {
      title: data.title,
      status: data.status,
      userId: currentUser.id,
      ...(data.description ? { description: data.description } : {})
    };
    const newTask = await taskStore.createNewTask(baseTask);
    if (newTask && data.checklist && data.checklist.length) {
      for (const item of data.checklist) {
        await taskStore.addChecklistItem(newTask.id, item);
      }
    }
  }, [currentUser, taskStore]);

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
    <div className="relative -mx-2 flex overflow-x-auto pb-4 gap-4 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
        <div key={status} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl border border-gray-200 flex flex-col max-h-[calc(100vh-270px)]">
          <div className="px-3 pt-3 pb-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">{status.replace('-', ' ')}</h3>
              <span className="inline-flex items-center justify-center h-5 min-w-[1.5rem] px-1.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-medium">{statusTasks.length}</span>
            </div>
            <button
              onClick={() => handleAddTask(status as TaskStatus)}
              className="text-blue-600 hover:text-blue-700 transition text-xs font-medium"
            >+ Task</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {statusTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">No tasks</div>
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
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => handleAddTask(status as TaskStatus)}
              className="w-full border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 rounded-md py-2 text-xs font-medium transition"
            >+ Add Task</button>
          </div>
        </div>
      ))}
    </div>
  );

  // ✅ ListView component
  const ListView = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">All Tasks</h3>
        <button onClick={() => handleAddTask('not-started')} className="text-blue-600 hover:text-blue-700 text-xs font-medium">+ Task</button>
      </div>
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-10 w-10 text-gray-300 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-sm font-medium text-gray-800 mb-1">No tasks yet</h3>
          <p className="text-gray-500 text-xs mb-4">Get started by creating your first task</p>
          <button onClick={() => handleAddTask('not-started')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition">Create Task</button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {tasks.map(task => {
            const taskChecklistItems = checklistData[task.id] || [];
            const completed = taskChecklistItems.filter(i => i.completed).length;
            const plan = floorPlans.find(fp => fp.id === task.planId);
            return (
              <div key={task.id} onClick={() => handleTaskClick(task)} className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{task.title}</h4>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-gray-500">
                      <span>#{task.id.slice(-6)}</span>
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      <span>{taskChecklistItems.length} steps</span>
                      <span>{completed} done</span>
                      {plan && <span className="text-blue-600">Plan: {plan.name}</span>}
                      {!plan && task.planId && <span className="text-red-500">Plan: (not found)</span>}
                    </div>
                  </div>
                  {taskChecklistItems.length > 0 && (
                    <div className="w-20">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(completed / taskChecklistItems.length) * 100}%` }} />
                      </div>
                    </div>
                  )}
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
      <TaskCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialStatus={preselectedStatus}
        onCreateTask={handleCreateTask}
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
              >+ New Task</button>
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
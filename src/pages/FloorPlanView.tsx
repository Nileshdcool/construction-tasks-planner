import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '../store/authStore';
import { useTaskStore, useUserTasks } from '../store/taskStore';
import { useFloorPlanStore, useActiveFloorPlan, useUserFloorPlans } from '../store/floorPlanStore';
import { Navigation } from '../components/Navigation';
import { FloorPlanUpload } from '../components/FloorPlanUpload';
import { InteractiveFloorPlan } from '../components/InteractiveFloorPlan';
import { TaskCreationModal } from '../components/TaskCreationModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { ChecklistItem } from '../store/taskStore';

export const FloorPlanView: React.FC = () => {
  const currentUser = useCurrentUser();
  const tasks = useUserTasks();
  const { loadUserTasks, createNewTask } = useTaskStore();
  const activeFloorPlan = useActiveFloorPlan();
  const floorPlans = useUserFloorPlans();
  const { loadActiveFloorPlan, uploadFloorPlan, setActiveFloorPlanById, loadUserFloorPlans } = useFloorPlanStore();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskCreationPosition, setTaskCreationPosition] = useState<{
    x: number;
    y: number;
    relativeX: number;
    relativeY: number;
  } | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadActiveFloorPlan(currentUser.id);
      loadUserFloorPlans(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadUserTasks(currentUser.id, activeFloorPlan?.id);
    }
  }, [currentUser, activeFloorPlan?.id]);

  const handleImageUpload = async (_imageUrl: string, imageFile: File) => {
    if (currentUser && imageFile.name) {
      const fileName = imageFile.name.replace(/\.[^/.]+$/, '');
      await uploadFloorPlan(currentUser.id, fileName, imageFile);
    }
  };

  const handleTaskCreate = (position: typeof taskCreationPosition) => {
    setTaskCreationPosition(position);
    setShowTaskModal(true);
    setIsAddingTask(false);
  };

  const handleTaskCreation = async (taskData: {
    title: string;
    description?: string;
    status: 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';
    position?: { x: number; y: number; relativeX: number; relativeY: number };
    checklist?: string[];
  }) => {
    if (currentUser) {
      const taskCreateData: {
        title: string;
        description?: string;
        status: 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';
        position: { x: number; y: number };
        userId: string;
        planId?: string;
      } = {
        title: taskData.title,
        status: taskData.status,
        position: { x: taskData.position?.x || 0, y: taskData.position?.y || 0 },
        userId: currentUser.id
      };
      if (activeFloorPlan?.id) {
        taskCreateData.planId = activeFloorPlan.id;
      }
      if (taskData.description) {
        taskCreateData.description = taskData.description;
      }
      const newTask = await createNewTask(taskCreateData);
      if (newTask) {
  // ...existing code...
        await useTaskStore.getState().loadTaskChecklist(newTask.id);
        
  // ...existing code...
        if (taskData.checklist && taskData.checklist.length > 0) {
          // ...existing code...
          const { getDefaultChecklistItems } = await import('../utils/defaultChecklist');
          const defaultItems = getDefaultChecklistItems();
          const defaultTitles = defaultItems.map(item => item.title);
          
          for (const item of taskData.checklist) {
            // ...existing code...
            if (!defaultTitles.includes(item)) {
              await useTaskStore.getState().addChecklistItem(newTask.id, item);
            }
          }
        }
      }
    }
  };

  const handleTaskSelect = async (task: any) => {
    setSelectedTaskId(task.id);
    await useTaskStore.getState().loadTaskChecklist(task.id);
    setShowDetails(true);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const checklistItems: ChecklistItem[] = selectedTask ? useTaskStore.getState().checklistItems.filter(ci => ci.taskId === selectedTask.id) : [];
  const handleAddChecklistItem = (title: string, status?: string) => {
    if (selectedTask) {
      useTaskStore.getState().addChecklistItem(selectedTask.id, title, status);
    }
  };
  const handleToggleChecklistItem = (itemId: string, completed: boolean) => {
    useTaskStore.getState().toggleChecklistItem(itemId, completed);
  };
  const handleUpdateChecklistItemStatus = (itemId: string, status: string) => {
    useTaskStore.getState().updateChecklistItemStatus(itemId, status);
  };
  
  const handleEditChecklistItem = (itemId: string, newTitle: string) => {
    useTaskStore.getState().editChecklistItem(itemId, newTitle);
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    useTaskStore.getState().removeChecklistItem(itemId);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      await useTaskStore.getState().removeTask(taskId);
  // ...existing code...
      if (selectedTaskId === taskId) {
        setShowDetails(false);
        setSelectedTaskId(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
  // ...existing code...
    }
  };

  if (!currentUser) {
    return null;
  }

  const taskCounts = {
    total: tasks.length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Floor Plan View</h1>
            <p className="text-gray-600">
              Upload your construction floor plan and add tasks by clicking on specific locations
            </p>
          </div>

          {!activeFloorPlan ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <FloorPlanUpload 
                onImageUpload={handleImageUpload}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{activeFloorPlan.name}</h3>
                        <p className="text-sm text-gray-600">Uploaded {new Date(activeFloorPlan.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      {floorPlans.length > 1 && (
                        <div className="flex items-center space-x-2">
                          <label className="text-xs font-medium text-gray-500">Switch Plan:</label>
                          <select
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={activeFloorPlan.id}
                            onChange={(e) => {
                              const newId = e.target.value;
                              if (currentUser) setActiveFloorPlanById(newId, currentUser.id);
                            }}
                          >
                            {floorPlans.map(fp => (
                              <option key={fp.id} value={fp.id}>{fp.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsAddingTask(!isAddingTask)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                        isAddingTask
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isAddingTask ? 'Cancel Adding' : '+ Add Task'}
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            handleImageUpload('', file);
                          }
                        };
                        input.click();
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                    >
                      Replace Plan
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <InteractiveFloorPlan
                  imageUrl={activeFloorPlan.imageUrl}
                  tasks={tasks}
                  onTaskCreate={handleTaskCreate}
                  onTaskSelect={handleTaskSelect}
                  isAddingTask={isAddingTask}
                />
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Total Tasks</h3>
              <p className="text-2xl font-bold text-blue-600">{taskCounts.total}</p>
              <p className="text-xs text-gray-500">Across all areas</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">In Progress</h3>
              <p className="text-2xl font-bold text-yellow-600">{taskCounts.inProgress}</p>
              <p className="text-xs text-gray-500">Active tasks</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{taskCounts.completed}</p>
              <p className="text-xs text-gray-500">Finished tasks</p>
            </div>
          </div>
        </div>
      </main>

      <TaskCreationModal
        isOpen={showTaskModal}
        position={taskCreationPosition}
        onClose={() => {
          setShowTaskModal(false);
          setTaskCreationPosition(null);
        }}
        onCreateTask={handleTaskCreation}
      />
      <TaskDetailsModal
        isOpen={showDetails}
        task={selectedTask}
        checklist={checklistItems}
        onClose={() => setShowDetails(false)}
        onAddChecklistItem={handleAddChecklistItem}
        onToggleChecklistItem={handleToggleChecklistItem}
        onUpdateChecklistItemStatus={handleUpdateChecklistItemStatus}
        onEditChecklistItem={handleEditChecklistItem}
        onDeleteChecklistItem={handleDeleteChecklistItem}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '../store/authStore';
import { useTaskStore, useUserTasks } from '../store/taskStore';
import { useFloorPlanStore, useActiveFloorPlan } from '../store/floorPlanStore';
import { Navigation } from '../components/Navigation';
import { FloorPlanUpload } from '../components/FloorPlanUpload';
import { InteractiveFloorPlan } from '../components/InteractiveFloorPlan';
import { TaskCreationModal } from '../components/TaskCreationModal';

export const FloorPlanView: React.FC = () => {
  const currentUser = useCurrentUser();
  const tasks = useUserTasks();
  const { loadUserTasks, createNewTask } = useTaskStore();
  const activeFloorPlan = useActiveFloorPlan();
  const { loadActiveFloorPlan, uploadFloorPlan } = useFloorPlanStore();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskCreationPosition, setTaskCreationPosition] = useState<{
    x: number;
    y: number;
    relativeX: number;
    relativeY: number;
  } | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserTasks(currentUser.id);
      loadActiveFloorPlan(currentUser.id);
    }
  }, [currentUser]); // Removed store functions from dependencies

  const handleImageUpload = async (_imageUrl: string, imageFile: File) => {
    if (currentUser && imageFile.name) {
      const fileName = imageFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
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
    position: { x: number; y: number; relativeX: number; relativeY: number };
  }) => {
    if (currentUser) {
      const taskCreateData: {
        title: string;
        description?: string;
        status: 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';
        position: { x: number; y: number };
        userId: string;
      } = {
        title: taskData.title,
        status: taskData.status,
        position: { x: taskData.position.x, y: taskData.position.y },
        userId: currentUser.id
      };
      
      if (taskData.description) {
        taskCreateData.description = taskData.description;
      }
      
      await createNewTask(taskCreateData);
    }
  };

  const handleTaskSelect = (task: any) => {
    // Handle task selection (could open task details modal)
    console.log('Task selected:', task);
  };

  if (!currentUser) {
    return null; // Protected route should handle this
  }

  const taskCounts = {
    total: tasks.length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Floor Plan View</h1>
            <p className="text-gray-600">
              Upload your construction floor plan and add tasks by clicking on specific locations
            </p>
          </div>

          {!activeFloorPlan ? (
            /* Floor Plan Upload */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <FloorPlanUpload 
                onImageUpload={handleImageUpload}
              />
            </div>
          ) : (
            /* Interactive Floor Plan */
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{activeFloorPlan.name}</h3>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(activeFloorPlan.uploadedAt).toLocaleDateString()}
                    </p>
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
                        // Handle replace floor plan - could open file picker
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

              {/* Interactive Floor Plan */}
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

          {/* Task Summary Panel */}
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

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={showTaskModal}
        position={taskCreationPosition}
        onClose={() => {
          setShowTaskModal(false);
          setTaskCreationPosition(null);
        }}
        onCreateTask={handleTaskCreation}
      />
    </div>
  );
};
import { create } from 'zustand';
import { 
  createTask, 
  getTasksByUserId, 
  deleteTask,
  createChecklistItem,
  getChecklistItemsByTaskId,
  updateChecklistItemCompleted,
  updateChecklistItemStatus,
  deleteChecklistItem,
  updateTaskFields
} from '../db/database';

export type TaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';
export type ChecklistItemStatus = 'not-started' | 'blocked' | 'final-installation' | 'done' | string;

export interface ChecklistItem {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  status: ChecklistItemStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  position?: { x: number; y: number };
  planId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  checklist?: ChecklistItem[];
}

interface TaskState {
  tasks: Task[];
  checklistItems: ChecklistItem[];
  isLoading: boolean;
  error: string | null;
  
  loadUserTasks: (userId: string, planId?: string) => Promise<void>;
  createNewTask: (taskData: {
    title: string;
    description?: string;
    status?: TaskStatus;
    position?: { x: number; y: number };
    userId: string;
    planId?: string;
  }) => Promise<Task | null>;
  updateTask: (taskId: string, updates: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    position?: { x: number; y: number };
    planId?: string;
  }) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  
  addChecklistItem: (taskId: string, title: string, status?: ChecklistItemStatus) => Promise<ChecklistItem | null>;
  updateChecklistItemStatus: (itemId: string, status: ChecklistItemStatus) => Promise<void>;
  toggleChecklistItem: (itemId: string, completed: boolean) => Promise<void>;
  removeChecklistItem: (itemId: string) => Promise<void>;
  loadTaskChecklist: (taskId: string) => Promise<ChecklistItem[]>;
  
  clearError: () => void;
  resetTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
    (set) => ({
      tasks: [],
      checklistItems: [],
      isLoading: false,
      error: null,

      loadUserTasks: async (userId: string, planId?: string) => {
        console.log('loadUserTasks called for userId:', userId);
        set({ isLoading: true, error: null });
        
        try {
          const taskDocs = await getTasksByUserId(userId, planId);
          const tasks = taskDocs.map(doc => doc.toJSON());
          console.log('Loaded tasks:', tasks.length);
          
          set({ 
            tasks, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Error loading tasks:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load tasks',
            isLoading: false 
          });
        }
      },

      createNewTask: async (taskData) => {
        set({ isLoading: true, error: null });
        
        try {
          const newTaskDoc = await createTask(taskData);
          const newTask = newTaskDoc.toJSON();
          
          set(state => ({ 
            tasks: [...state.tasks, newTask],
            isLoading: false 
          }));
          
          return newTask;
        } catch (error) {
          console.error('Error creating task:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create task',
            isLoading: false 
          });
          return null;
        }
      },

      updateTask: async (taskId, updates) => {
        set({ isLoading: true, error: null });
        try {
          await updateTaskFields(taskId, updates);
          set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
            isLoading: false
          }));
        } catch (error) {
          console.error('Error updating task:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to update task',
            isLoading: false
          });
        }
      },

      removeTask: async (taskId) => {
        set({ isLoading: true, error: null });
        
        try {
          await deleteTask(taskId);
          
          set(state => ({ 
            tasks: state.tasks.filter(task => task.id !== taskId),
            checklistItems: state.checklistItems.filter(item => item.taskId !== taskId),
            isLoading: false 
          }));
        } catch (error) {
          console.error('Error deleting task:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete task',
            isLoading: false 
          });
        }
      },

      addChecklistItem: async (taskId, title, status = 'not-started') => {
        set({ error: null });
        
        try {
          const newItemDoc = await createChecklistItem({ taskId, title, status });
          const newItem = newItemDoc.toJSON();
          
          set(state => ({ 
            checklistItems: [...state.checklistItems, newItem]
          }));
          
          return newItem;
        } catch (error) {
          console.error('Error adding checklist item:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add checklist item'
          });
          return null;
        }
      },

      updateChecklistItemStatus: async (itemId, status) => {
        set({ error: null });
        
        try {
          await updateChecklistItemStatus(itemId, status);
          
          set(state => ({
            checklistItems: state.checklistItems.map(item => {
              if (item.id === itemId) {
                const completed = status === 'done';
                return { ...item, status, completed };
              }
              return item;
            })
          }));
        } catch (error) {
          console.error('Error updating checklist item status:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update checklist item status'
          });
        }
      },

      toggleChecklistItem: async (itemId, completed) => {
        set({ error: null });
        
        try {
          await updateChecklistItemCompleted(itemId, completed);
          
          set(state => ({
            checklistItems: state.checklistItems.map(item => {
              if (item.id === itemId) {
                const newStatus = completed ? 'done' : 
                  (item.status === 'done' ? 'not-started' : item.status);
                return { ...item, completed, status: newStatus };
              }
              return item;
            })
          }));
        } catch (error) {
          console.error('Error updating checklist item:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update checklist item'
          });
        }
      },

      removeChecklistItem: async (itemId) => {
        set({ error: null });
        
        try {
          await deleteChecklistItem(itemId);
          
          set(state => ({ 
            checklistItems: state.checklistItems.filter(item => item.id !== itemId)
          }));
        } catch (error) {
          console.error('Error deleting checklist item:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete checklist item'
          });
        }
      },

      loadTaskChecklist: async (taskId) => {
        try {
          const itemDocs = await getChecklistItemsByTaskId(taskId);
          const items = itemDocs.map(doc => doc.toJSON());
          
          set(state => ({
            checklistItems: [
              ...state.checklistItems.filter(item => item.taskId !== taskId),
              ...items
            ]
          }));
          
          return items;
        } catch (error) {
          console.error('Error loading checklist:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load checklist'
          });
          return [];
        }
      },

      clearError: () => set({ error: null }),
      
      resetTasks: () => set({ 
        tasks: [], 
        checklistItems: [], 
        error: null, 
        isLoading: false 
      }),
    }));

export const useTasksLoading = () => useTaskStore((state) => state.isLoading);
export const useTasksError = () => useTaskStore((state) => state.error);
export const useUserTasks = () => useTaskStore((state) => state.tasks);
export const useTaskById = (taskId: string) => useTaskStore((state) => 
  state.tasks.find(task => task.id === taskId)
);
export const useTasksByStatus = (status: TaskStatus) => useTaskStore((state) => 
  state.tasks.filter(task => task.status === status)
);
export const useChecklistByTaskId = (taskId: string) => useTaskStore((state) => 
  state.checklistItems.filter(item => item.taskId === taskId)
);
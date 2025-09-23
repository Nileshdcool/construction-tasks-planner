import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createFloorPlan, 
  getActiveFloorPlan,
  getFloorPlansByUserId,
  setActiveFloorPlan,
  deleteFloorPlan,
  renameFloorPlan,
  replaceFloorPlanImage,
  updateFloorPlanMetadata
} from '../db';

export interface FloorPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageFileName: string;
  uploadedAt: string;
  updatedAt: string;
  isActive: boolean;
  tags?: string[];
  version?: number;
}

interface FloorPlanState {
  floorPlans: FloorPlan[];
  activeFloorPlan: FloorPlan | null;
  isLoading: boolean;
  error: string | null;
  
  loadUserFloorPlans: (userId: string) => Promise<void>;
  loadActiveFloorPlan: (userId: string) => Promise<void>;
  uploadFloorPlan: (userId: string, name: string, imageFile: File, description?: string, tags?: string[]) => Promise<FloorPlan | null>;
  setActiveFloorPlanById: (floorPlanId: string, userId: string) => Promise<void>;
  removeFloorPlan: (floorPlanId: string) => Promise<void>;
  rename: (floorPlanId: string, name: string) => Promise<void>;
  replaceImage: (floorPlanId: string, imageFile: File) => Promise<void>;
  updateMetadata: (floorPlanId: string, updates: { name?: string; description?: string; tags?: string[] }) => Promise<void>;
  
  clearError: () => void;
  resetFloorPlans: () => void;
}

export const useFloorPlanStore = create<FloorPlanState>()(
  persist(
    (set) => ({
      floorPlans: [],
      activeFloorPlan: null,
      isLoading: false,
      error: null,

      loadUserFloorPlans: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const floorPlanDocs = await getFloorPlansByUserId(userId);
          const floorPlans = floorPlanDocs.map(doc => doc.toJSON());
          
          set({ 
            floorPlans, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Error loading floor plans:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load floor plans',
            isLoading: false 
          });
        }
      },

      loadActiveFloorPlan: async (userId: string) => {
        set({ error: null });
        
        try {
          const activeFloorPlanDoc = await getActiveFloorPlan(userId);
          const activeFloorPlan = activeFloorPlanDoc ? activeFloorPlanDoc.toJSON() : null;
          
          set({ activeFloorPlan });
        } catch (error) {
          console.error('Error loading active floor plan:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load active floor plan'
          });
        }
      },

      uploadFloorPlan: async (userId: string, name: string, imageFile: File, description?: string, tags?: string[]) => {
        set({ isLoading: true, error: null });
        
        try {
          const base64Image = await convertFileToBase64(imageFile);
          
          const newFloorPlanDoc = await createFloorPlan({
            userId,
            name,
            ...(description ? { description } : {}),
            imageUrl: base64Image,
            imageFileName: imageFile.name,
            ...(tags ? { tags } : {})
          });
          
          const newFloorPlan = newFloorPlanDoc.toJSON();
          
          set(state => ({ 
            floorPlans: [...state.floorPlans, newFloorPlan],
            activeFloorPlan: newFloorPlan,
            isLoading: false 
          }));
          
          return newFloorPlan;
        } catch (error) {
          console.error('Error uploading floor plan:', error);
          
          let errorMessage = 'Failed to upload floor plan';
          if (error instanceof Error) {
            errorMessage = error.message;
            
            if (error.message.includes('VD2') || error.message.includes('schema')) {
              errorMessage = 'Schema validation failed. Try using window.rxdbUtils.clearIndexedDB() to reset the database and reload the page.';
            }
          }
          
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          return null;
        }
      },

      setActiveFloorPlanById: async (floorPlanId: string, userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await setActiveFloorPlan(floorPlanId, userId);
          
          set(state => ({
            floorPlans: state.floorPlans.map(fp => ({
              ...fp,
              isActive: fp.id === floorPlanId
            })),
            activeFloorPlan: state.floorPlans.find(fp => fp.id === floorPlanId) || null,
            isLoading: false
          }));
        } catch (error) {
          console.error('Error setting active floor plan:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to set active floor plan',
            isLoading: false 
          });
        }
      },

      removeFloorPlan: async (floorPlanId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteFloorPlan(floorPlanId);

          try {
            const { useTaskStore } = await import('./taskStore');
            useTaskStore.getState().resetTasks();
          } catch (e) {
          }

          set(state => {
            const wasActive = state.activeFloorPlan?.id === floorPlanId;
            const remainingPlans = state.floorPlans.filter(fp => fp.id !== floorPlanId);
            return {
              floorPlans: remainingPlans,
              activeFloorPlan: wasActive ? (remainingPlans[0] || null) : state.activeFloorPlan,
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error deleting floor plan:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete floor plan',
            isLoading: false 
          });
        }
      },

      rename: async (floorPlanId: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          await renameFloorPlan(floorPlanId, name);
          set(state => ({
            floorPlans: state.floorPlans.map(fp => fp.id === floorPlanId ? { ...fp, name } : fp),
            activeFloorPlan: state.activeFloorPlan?.id === floorPlanId ? { ...state.activeFloorPlan, name } : state.activeFloorPlan,
            isLoading: false
          }));
        } catch (error) {
          console.error('Error renaming floor plan:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to rename floor plan', isLoading: false });
        }
      },

      replaceImage: async (floorPlanId: string, imageFile: File) => {
        set({ isLoading: true, error: null });
        try {
          const base64 = await convertFileToBase64(imageFile);
          await replaceFloorPlanImage(floorPlanId, base64, imageFile.name);
          set(state => ({
            floorPlans: state.floorPlans.map(fp => fp.id === floorPlanId ? { ...fp, imageUrl: base64, imageFileName: imageFile.name } : fp),
            activeFloorPlan: state.activeFloorPlan?.id === floorPlanId ? { ...state.activeFloorPlan, imageUrl: base64, imageFileName: imageFile.name } : state.activeFloorPlan,
            isLoading: false
          }));
        } catch (error) {
          console.error('Error replacing floor plan image:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to replace floor plan image', isLoading: false });
        }
      },

      updateMetadata: async (floorPlanId: string, updates: { name?: string; description?: string; tags?: string[] }) => {
        set({ isLoading: true, error: null });
        try {
          await updateFloorPlanMetadata(floorPlanId, updates);
          set(state => ({
            floorPlans: state.floorPlans.map(fp => fp.id === floorPlanId ? { ...fp, ...updates } : fp),
            activeFloorPlan: state.activeFloorPlan?.id === floorPlanId ? { ...state.activeFloorPlan, ...updates } : state.activeFloorPlan,
            isLoading: false
          }));
        } catch (error) {
          console.error('Error updating floor plan metadata:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update floor plan metadata', isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
      
      resetFloorPlans: () => set({ 
        floorPlans: [], 
        activeFloorPlan: null, 
        error: null, 
        isLoading: false 
      }),
    }),
    {
      name: 'floor-plan-storage',
      partialize: (state) => ({ 
        activeFloorPlan: state.activeFloorPlan
      }),
    }
  )
);

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const useFloorPlansLoading = () => useFloorPlanStore((state) => state.isLoading);
export const useFloorPlansError = () => useFloorPlanStore((state) => state.error);
export const useActiveFloorPlan = () => useFloorPlanStore((state) => state.activeFloorPlan);
export const useUserFloorPlans = () => useFloorPlanStore((state) => state.floorPlans);
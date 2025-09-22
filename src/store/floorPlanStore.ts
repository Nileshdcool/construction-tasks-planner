import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createFloorPlan, 
  getActiveFloorPlan,
  getFloorPlansByUserId,
  setActiveFloorPlan,
  deleteFloorPlan
} from '../db/database';

export interface FloorPlan {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  imageFileName: string;
  uploadedAt: string;
  isActive: boolean;
}

interface FloorPlanState {
  // State
  floorPlans: FloorPlan[];
  activeFloorPlan: FloorPlan | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadUserFloorPlans: (userId: string) => Promise<void>;
  loadActiveFloorPlan: (userId: string) => Promise<void>;
  uploadFloorPlan: (userId: string, name: string, imageFile: File) => Promise<FloorPlan | null>;
  setActiveFloorPlanById: (floorPlanId: string, userId: string) => Promise<void>;
  removeFloorPlan: (floorPlanId: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  resetFloorPlans: () => void;
}

export const useFloorPlanStore = create<FloorPlanState>()(
  persist(
    (set) => ({
      // Initial state
      floorPlans: [],
      activeFloorPlan: null,
      isLoading: false,
      error: null,

      // Load all floor plans for a user
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

      // Load active floor plan for a user
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

      // Upload a new floor plan
      uploadFloorPlan: async (userId: string, name: string, imageFile: File) => {
        set({ isLoading: true, error: null });
        
        try {
          // Convert image to base64 for storage (in a real app, you might upload to cloud storage)
          const base64Image = await convertFileToBase64(imageFile);
          
          const newFloorPlanDoc = await createFloorPlan({
            userId,
            name,
            imageUrl: base64Image, // Store as base64
            imageFileName: imageFile.name
          });
          
          const newFloorPlan = newFloorPlanDoc.toJSON();
          
          set(state => ({ 
            floorPlans: [...state.floorPlans, newFloorPlan],
            activeFloorPlan: newFloorPlan, // New floor plan becomes active
            isLoading: false 
          }));
          
          return newFloorPlan;
        } catch (error) {
          console.error('Error uploading floor plan:', error);
          
          let errorMessage = 'Failed to upload floor plan';
          if (error instanceof Error) {
            errorMessage = error.message;
            
            // Check for schema validation errors
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

      // Set active floor plan
      setActiveFloorPlanById: async (floorPlanId: string, userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await setActiveFloorPlan(floorPlanId, userId);
          
          // Update local state
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

      // Remove a floor plan
      removeFloorPlan: async (floorPlanId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await deleteFloorPlan(floorPlanId);
          
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

      // Utility actions
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
      // Only persist non-sensitive state
      partialize: (state) => ({ 
        activeFloorPlan: state.activeFloorPlan
      }),
    }
  )
);

// Helper function to convert File to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Selectors for easier access
export const useFloorPlansLoading = () => useFloorPlanStore((state) => state.isLoading);
export const useFloorPlansError = () => useFloorPlanStore((state) => state.error);
export const useActiveFloorPlan = () => useFloorPlanStore((state) => state.activeFloorPlan);
export const useUserFloorPlans = () => useFloorPlanStore((state) => state.floorPlans);
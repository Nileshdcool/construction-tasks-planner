import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDocType } from '../db/schemas/user';
import { initializeDatabase } from '../db/database';

interface AuthState {
  currentUser: UserDocType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeAuth: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const cleanupFlag = sessionStorage.getItem('rxdb-cleanup-done');
          if (cleanupFlag) {
            sessionStorage.removeItem('rxdb-cleanup-done');
            console.log('🧹 Database cleanup detected - resetting auth state');
            set({ 
              currentUser: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null
            });
            return;
          }

          const db = await initializeDatabase();
          
          const state = get();
          if (state.currentUser?.id) {
            const user = await db.users.findOne({
              selector: { id: state.currentUser.id }
            }).exec();
            
            if (user) {
              const now = new Date().toISOString();
              const updatedUser = await user.incrementalPatch({ lastLoginAt: now });
              set({ 
                currentUser: updatedUser.toJSON(), 
                isAuthenticated: true, 
                isLoading: false 
              });
            } else {
              set({ 
                currentUser: null, 
                isAuthenticated: false, 
                isLoading: false 
              });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ 
            currentUser: null,
            isAuthenticated: false,
            error: null,
            isLoading: false 
          });
        }
      },

      login: async (username: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const trimmedUsername = username.trim();
          if (!trimmedUsername) {
            throw new Error('Username is required');
          }
          
          if (trimmedUsername.length > 50) {
            throw new Error('Username must be 50 characters or less');
          }

          const db = await initializeDatabase();
          
          let user = await db.users.findOne({
            selector: { username: trimmedUsername }
          }).exec();
          
          if (!user) {
            const now = new Date().toISOString();
            const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            user = await db.users.insert({
              id,
              username: trimmedUsername,
              createdAt: now,
              lastLoginAt: now,
            });
          } else {
            const now = new Date().toISOString();
            user = await user.incrementalPatch({ lastLoginAt: now });
          }
          
          set({ 
            currentUser: user.toJSON(), 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
        }
      },

      /**
       * Logout current user
       */
      logout: async () => {
        set({ isLoading: true });
        
        try {
          set({ 
            currentUser: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ 
            error: 'Failed to logout', 
            isLoading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
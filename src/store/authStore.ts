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

      /**
       * Initialize authentication by checking for existing user session
       */
      initializeAuth: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if we just did a cleanup (only check once)
          const cleanupFlag = sessionStorage.getItem('rxdb-cleanup-done');
          if (cleanupFlag) {
            sessionStorage.removeItem('rxdb-cleanup-done'); // Remove immediately
            console.log('🧹 Database cleanup detected - resetting auth state');
            set({ 
              currentUser: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null
            });
            return;
          }

          // Initialize RxDB database
          const db = await initializeDatabase();
          
          // Check if we have a persisted user ID
          const state = get();
          if (state.currentUser?.id) {
            // Verify user still exists in RxDB
            const user = await db.users.findOne({
              selector: { id: state.currentUser.id }
            }).exec();
            
            if (user) {
              // Update last login time using RxDB incrementalPatch
              const now = new Date().toISOString();
              const updatedUser = await user.incrementalPatch({ lastLoginAt: now });
              set({ 
                currentUser: updatedUser.toJSON(), 
                isAuthenticated: true, 
                isLoading: false 
              });
            } else {
              // User no longer exists, clear session
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
          // If database initialization fails, reset auth state cleanly
          set({ 
            currentUser: null,
            isAuthenticated: false,
            error: null, // Don't show error to user
            isLoading: false 
          });
        }
      },

      /**
       * Login with username (no password required)
       */
      login: async (username: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Validate username
          const trimmedUsername = username.trim();
          if (!trimmedUsername) {
            throw new Error('Username is required');
          }
          
          if (trimmedUsername.length > 50) {
            throw new Error('Username must be 50 characters or less');
          }

          // Get RxDB database
          const db = await initializeDatabase();
          
          // Check if user exists in RxDB
          let user = await db.users.findOne({
            selector: { username: trimmedUsername }
          }).exec();
          
          if (!user) {
            // Create new user if doesn't exist
            const now = new Date().toISOString();
            const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            user = await db.users.insert({
              id,
              username: trimmedUsername,
              createdAt: now,
              lastLoginAt: now,
            });
          } else {
            // Update existing user's last login using RxDB incrementalPatch
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
          // Clear user session
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

      /**
       * Clear any authentication errors
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-store',
      // Only persist user session data, not the entire state
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks for easier usage
export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
// Re-export store and hooks for easier imports
export { 
  useAuthStore, 
  useCurrentUser, 
  useIsAuthenticated, 
  useAuthLoading, 
  useAuthError 
} from './authStore';
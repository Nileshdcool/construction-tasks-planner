import React, { useState, useEffect } from 'react';
import { useAuthStore, useAuthLoading, useAuthError } from '../store/authStore';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthLoading();
  const authError = useAuthError();

  // Clear errors when component mounts or username changes
  useEffect(() => {
    clearError();
    setValidationError('');
  }, [username, clearError]);

  // Call onLoginSuccess when authentication is successful
  useEffect(() => {
    if (isAuthenticated && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationError('');
    clearError();
    
    // Validate username
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setValidationError('Username is required');
      return;
    }
    
    if (trimmedUsername.length > 50) {
      setValidationError('Username must be 50 characters or less');
      return;
    }
    
    // Check for invalid characters (optional - you can customize this)
    const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      setValidationError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    
    try {
      await login(trimmedUsername);
      // onLoginSuccess will be called by useEffect when isAuthenticated becomes true
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login form error:', error);
    }
  };

  const displayError = validationError || authError;

  const disabled = isLoading || !username.trim();
  return (
    <div className="w-full max-w-md">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-blue-900/5 ring-1 ring-gray-200/60 p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-blue-500/10 via-indigo-400/10 to-cyan-300/10 rounded-full blur-3xl" />
        <div className="relative">
          <header className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 mb-4">
              <span className="text-lg font-bold tracking-tight">CP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in with just a username. No password required.</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-gray-600 tracking-wide mb-2 uppercase">Username</label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. site_manager_01"
                  className={`peer w-full rounded-lg border bg-white/70 backdrop-blur-sm px-3 py-2.5 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${displayError ? 'border-red-400 focus:ring-red-400/60' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'}`}
                  disabled={isLoading}
                  maxLength={50}
                  autoComplete="username"
                  autoFocus
                  aria-invalid={!!displayError}
                  aria-describedby={displayError ? 'username-error' : undefined}
                />
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2zm2 5.291A7.962 7.962 0 014 12H2c0 3.042 1.135 5.824 3 7.938l1-0.647z" />
                    </svg>
                  )}
                </div>
              </div>
              {displayError && (
                <p id="username-error" className="mt-2 text-xs text-red-600" role="alert">{displayError}</p>
              )}
              <p className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 110-12 6 6 0 010 12z" /></svg>
                Letters, numbers, - and _ only
              </p>
            </div>
            <button
              type="submit"
              disabled={disabled}
              className={`group relative w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold tracking-wide transition shadow-sm ${disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:from-blue-500 hover:to-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {!isLoading && <span className="absolute left-4 opacity-0 group-hover:opacity-100 transition text-xs">↵</span>}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div className="mt-8 space-y-2 text-center">
            <p className="text-[11px] text-gray-500">Offline-first • Data stored locally • No password risk</p>
            <p className="text-[10px] text-gray-400">By continuing you acknowledge local-only storage (no cloud sync yet).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
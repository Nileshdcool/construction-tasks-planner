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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Construction Planner
          </h1>
          <p className="text-gray-600">
            Enter your username to continue
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                displayError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={50}
              autoComplete="username"
              autoFocus
            />
            {displayError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {displayError}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition duration-200 ${
              isLoading || !username.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            No password required • Your data is stored locally
          </p>
        </div>
      </div>
    </div>
  );
};
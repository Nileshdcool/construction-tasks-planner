import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Handle successful login
  const handleLoginSuccess = () => {
    navigate('/dashboard', { replace: true });
  };

  // Don't render login form if already authenticated
  if (isAuthenticated && !isLoading) {
    return null; // Will redirect via useEffect
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};
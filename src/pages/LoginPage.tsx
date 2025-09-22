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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Themed Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-600" />
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{backgroundImage:'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0, transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0, transparent 60%)'}} />
      {/* Grid subtle */}
      <div className="absolute inset-0 opacity-[0.10]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize:'46px 46px'}} />
      {/* Glow circles */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-indigo-500/30 blur-3xl" />
      {/* Center Card */}
      <div className="relative z-10 w-full px-4 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/30 shadow-lg shadow-blue-900/30 mb-4">
              <span className="text-white text-lg font-bold tracking-tight">CP</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Construction Planner</h1>
            <p className="text-blue-100 text-sm mt-2 max-w-xs mx-auto leading-relaxed">Offline-first floor plan tasking & checklists for modern site teams.</p>
          </div>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
          <div className="mt-6 text-center text-[11px] text-blue-200/80 tracking-wide">v0.1.0 · Local data only · Secure by design</div>
        </div>
      </div>
    </div>
  );
};
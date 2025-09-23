import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser, useAuthStore } from '../store/authStore';

export const Navigation: React.FC = () => {
  const currentUser = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
      </svg>
    )},
    { path: '/plans', label: 'Plans', icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10l9 4 9-4V7" />
      </svg>
    )},
    { path: '/floor-plan', label: 'Floor Plan', icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { path: '/tasks', label: 'Task Board', icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
  ];

  return (
    <header className="bg-white shadow-cp border-b border-cp-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-3 text-xl font-bold text-cp-primary-600 hover:text-cp-primary-700 transition-colors"
            >
              <div className="w-8 h-8 cp-gradient-primary rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span>Construction Planner</span>
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-cp-primary-100 text-cp-primary-700 shadow-sm'
                      : 'text-cp-neutral-700 hover:text-cp-primary-600 hover:bg-cp-neutral-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-cp-neutral-700">
              <div className="w-6 h-6 bg-cp-primary-500 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium text-cp-neutral-900">{currentUser.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-cp-neutral-100 hover:bg-cp-neutral-200 text-cp-neutral-700 hover:text-cp-neutral-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-cp-neutral-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="md:hidden border-t border-cp-neutral-200 bg-cp-neutral-50">
        <div className="px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-cp-primary-100 text-cp-primary-700'
                  : 'text-cp-neutral-700 hover:text-cp-primary-600 hover:bg-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};
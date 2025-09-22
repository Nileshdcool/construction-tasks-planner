import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../store/authStore';
import { Navigation } from './Navigation';
import RxDBDataViewer from './RxDBDataViewer';

export const Dashboard: React.FC = () => {
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return null; // This shouldn't happen if routing is set up correctly
  }

  return (
    <div className="min-h-screen bg-cendas-neutral-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Hero Section with Cendas branding */}
          <div className="cendas-gradient-primary rounded-lg p-8 text-white mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Cendas Construction Planner
              </h1>
              <p className="text-cendas-primary-100 text-lg mb-6">
                Professional offline-first construction task management
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Link
                  to="/floor-plan"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-200 group"
                >
                  <div className="text-cendas-secondary-400 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">Floor Plans</h3>
                  <p className="text-sm text-cendas-primary-100">Manage construction floor plans</p>
                </Link>
                
                <Link
                  to="/tasks"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-200 group"
                >
                  <div className="text-cendas-success-400 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">Task Board</h3>
                  <p className="text-sm text-cendas-primary-100">Track project tasks & progress</p>
                </Link>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  <div className="text-cendas-warning-400 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">Analytics</h3>
                  <p className="text-sm text-cendas-primary-100">Project insights & reports</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-cendas p-6 border border-cendas-neutral-200">
              <h3 className="text-lg font-semibold text-cendas-neutral-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-cendas-primary-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                User Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cendas-neutral-600">Username:</span>
                  <span className="text-sm text-cendas-neutral-900 font-semibold">{currentUser.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cendas-neutral-600">User ID:</span>
                  <span className="text-xs text-cendas-neutral-700 font-mono bg-cendas-neutral-100 px-2 py-1 rounded">{currentUser.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cendas-neutral-600">Created:</span>
                  <span className="text-sm text-cendas-neutral-900">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cendas-neutral-600">Last Login:</span>
                  <span className="text-xs text-cendas-neutral-700">
                    {new Date(currentUser.lastLoginAt).toLocaleDateString()}{' '}
                    {new Date(currentUser.lastLoginAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-cendas p-6 border border-cendas-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cendas-success-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-cendas-neutral-600">Tasks Completed</p>
                    <p className="text-2xl font-bold text-cendas-neutral-900">0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-cendas p-6 border border-cendas-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cendas-primary-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-cendas-neutral-600">In Progress</p>
                    <p className="text-2xl font-bold text-cendas-neutral-900">0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RxDB Data Viewer - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8">
              {/* Emergency Cleanup Button with Cendas styling */}
              <div className="mb-4 p-4 bg-cendas-warning-50 border border-cendas-warning-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-cendas-warning-800">🛠️ Development Tools</h4>
                    <p className="text-xs text-cendas-warning-700">Emergency database cleanup for development</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('⚠️ This will clear ALL database data and reload the page. Continue?')) {
                        const script = `
(async function() {
  console.log('🧹 Emergency cleanup...');
  try {
    // Step 1: Close database connections
    if (window.rxdbUtils) {
      try { await window.rxdbUtils.closeDatabase(); } catch(e) {}
    }
    
    // Step 2: Clear all IndexedDB
    if ('databases' in indexedDB) {
      const dbs = await indexedDB.databases();
      await Promise.all(dbs.map(db => {
        if (db.name?.includes('construction') || db.name?.includes('rxdb') || db.name?.includes('dexie')) {
          return new Promise(resolve => {
            const req = indexedDB.deleteDatabase(db.name);
            req.onsuccess = req.onerror = req.onblocked = () => resolve();
          });
        }
        return Promise.resolve();
      }));
    }
    
    // Step 3: Clear ALL localStorage (including Zustand persist data)
    localStorage.clear();
    
    // Step 4: Clear sessionStorage  
    sessionStorage.clear();
    
    // Step 5: Set a flag to indicate fresh start needed
    sessionStorage.setItem('rxdb-cleanup-done', 'true');
    
    console.log('✅ Cleanup complete - navigating to login...');
    
    // Navigate to login and reload
    window.location.href = '/login';
    
  } catch(e) { 
    console.error('Cleanup error:', e); 
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('rxdb-cleanup-done', 'true');
    window.location.href = '/login';
  }
})();`;
                        eval(script);
                      }
                    }}
                    className="px-4 py-2 bg-cendas-danger-500 hover:bg-cendas-danger-600 text-white text-sm font-medium rounded-md transition duration-200"
                  >
                    🧹 Emergency DB Cleanup
                  </button>
                </div>
              </div>
              <RxDBDataViewer />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
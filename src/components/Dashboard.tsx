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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Construction Planner
              </h2>
              <p className="text-gray-600 mb-6">
                Your offline-first construction task management application.
              </p>
              
              {/* User Info Card */}
              <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Username:</span> {currentUser.username}
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> {currentUser.id}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Login:</span>{' '}
                    {new Date(currentUser.lastLoginAt).toLocaleDateString()}{' '}
                    {new Date(currentUser.lastLoginAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Link 
                  to="/floor-plan"
                  className="block bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors"
                >
                  <h4 className="text-lg font-medium text-blue-900 mb-2">Floor Plan View</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Interactive floor plan for task management
                  </p>
                  <span className="inline-flex items-center text-blue-600 text-sm font-medium">
                    Open Floor Plan →
                  </span>
                </Link>
                
                <Link 
                  to="/tasks"
                  className="block bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors"
                >
                  <h4 className="text-lg font-medium text-green-900 mb-2">Task Board</h4>
                  <p className="text-green-700 text-sm mb-4">
                    Manage tasks and checklists
                  </p>
                  <span className="inline-flex items-center text-green-600 text-sm font-medium">
                    Open Task Board →
                  </span>
                </Link>
              </div>

              {/* RxDB Data Viewer - Development Only */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8">
                  {/* Emergency Cleanup Button */}
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">🛠️ Development Tools</h4>
                        <p className="text-xs text-yellow-700">Emergency database cleanup for COL23 errors</p>
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
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition duration-200"
                      >
                        🧹 Emergency DB Cleanup
                      </button>
                    </div>
                  </div>
                  <RxDBDataViewer />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
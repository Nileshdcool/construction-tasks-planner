// Debug component to view RxDB data in real-time
import React, { useState, useEffect } from 'react';
import { getDatabase } from '../db/database';

interface UserData {
  id: string;
  username: string;
  createdAt: string;
  lastLoginAt: string;
}

export const RxDBDataViewer: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const allUsers = await db.users.find().exec();
      const userData = allUsers.map((user: any) => user.toJSON());
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (window.confirm('⚠️ This will clear ALL database data and reload the page. Continue?')) {
      try {
        const rxdbUtils = (window as any).rxdbUtils;
        if (rxdbUtils) {
          await rxdbUtils.clearIndexedDB();
        }
        
        // Complete cleanup
        localStorage.clear();
        sessionStorage.clear();
        sessionStorage.setItem('rxdb-cleanup-done', 'true');
        
        // Navigate to login
        window.location.href = '/login';
        
      } catch (error) {
        console.error('Error clearing database:', error);
        // Fallback cleanup
        localStorage.clear();
        sessionStorage.clear();
        sessionStorage.setItem('rxdb-cleanup-done', 'true');
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">RxDB Data Viewer</h3>
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={handleClearDatabase}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              title="Clear all database data (development only)"
            >
              🧹 Clear DB
            </button>
          )}
        </div>
        <p>Loading database data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">RxDB Data Viewer - Error</h3>
          <div className="flex space-x-2">
            <button 
              onClick={loadUsers}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Retry
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={handleClearDatabase}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                title="Clear all database data (development only)"
              >
                🧹 Clear DB
              </button>
            )}
          </div>
        </div>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">RxDB Data Viewer</h3>
        <button 
          onClick={loadUsers}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 mr-2"
        >
          Refresh
        </button>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleClearDatabase}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            title="Clear all database data (development only)"
          >
            🧹 Clear DB
          </button>
        )}
      </div>
      
      <div className="mb-2">
        <span className="text-sm text-gray-600">
          Total Users: {users.length} | 
          Storage: IndexedDB (Dexie) | 
          Database: construction_planner_db
        </span>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500 italic">No users found in database</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">ID</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Username</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Created</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-sm font-mono text-xs">
                    {user.id}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-semibold">
                    {user.username}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {new Date(user.lastLoginAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Tip: Open browser DevTools → Application → IndexedDB → construction_planner_db to see raw data</p>
      </div>
    </div>
  );
};

export default RxDBDataViewer;
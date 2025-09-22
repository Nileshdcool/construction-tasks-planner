import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { FloorPlanView } from './pages/FloorPlanView';
import { TaskBoardView } from './pages/TaskBoardView';
import { initDevUtils } from './db/devUtils';
import './App.css';

function App(): React.JSX.Element {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize authentication when app starts
  useEffect(() => {
    initializeAuth();
    initDevUtils(); // Initialize development utilities
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/floor-plan" 
            element={
              <ProtectedRoute>
                <FloorPlanView />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TaskBoardView />
              </ProtectedRoute>
            } 
          />
          
          {/* Default route - redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../store/authStore';
import { Navigation } from './Navigation';
import RxDBDataViewer from './RxDBDataViewer';
import { useTaskStore, useUserTasks } from '../store/taskStore';

export const Dashboard: React.FC = () => {
  const currentUser = useCurrentUser();
  const tasks = useUserTasks();
  const loadUserTasks = useTaskStore(s => s.loadUserTasks);
  const checklistItems = useTaskStore(s => s.checklistItems);
  // Simple admin determination: treat username 'admin' (case-insensitive) as admin user
  const isAdmin = !!currentUser && currentUser.username.toLowerCase() === 'admin';

  // Ensure tasks are loaded when arriving at dashboard
  useEffect(() => {
    if (currentUser) {
      loadUserTasks(currentUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loadUserTasks]);

  // Derive analytics metrics
  const analytics = useMemo(() => {
    const total = tasks.length;
    const byStatus = {
      'not-started': 0,
      'in-progress': 0,
      'blocked': 0,
      'final-check': 0,
      'done': 0,
    } as Record<string, number>;
    tasks.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });

    const completed = byStatus['done'] || 0;
    const inProgress = byStatus['in-progress'] || 0;
    const blocked = byStatus['blocked'] || 0;
    const finalCheck = byStatus['final-check'] || 0;
    const notStarted = byStatus['not-started'] || 0;
    const completionPct = total ? Math.round((completed / total) * 100) : 0;

    const totalChecklistItems = checklistItems.length;
    const completedChecklistItems = checklistItems.filter(i => i.completed).length;
    const checklistCompletionPct = totalChecklistItems ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

    const checklistByTask: Record<string, { total: number; done: number; }> = {};
    checklistItems.forEach(item => {
      if (!checklistByTask[item.taskId]) {
        checklistByTask[item.taskId] = { total: 0, done: 0 };
      }
      const bucket = checklistByTask[item.taskId]!;
      bucket.total += 1;
      if (item.completed) bucket.done += 1;
    });
    const checklistTaskIds = Object.keys(checklistByTask);
    const avgChecklistCompletion = checklistTaskIds.length
      ? Math.round(
          (checklistTaskIds.reduce((acc, id) => {
            const b = checklistByTask[id]!;
            return acc + (b.done / b.total);
          }, 0) / checklistTaskIds.length) * 100
        )
      : 0;

    // Recently updated tasks (top 5)
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    // Tasks without checklist (among tasks loaded vs items grouped)
    const tasksWithChecklist = new Set(checklistItems.map(ci => ci.taskId));
    const tasksWithoutChecklist = tasks.filter(t => !tasksWithChecklist.has(t.id)).length;

    return {
      total,
      byStatus,
      completed,
      inProgress,
      blocked,
      finalCheck,
      notStarted,
      completionPct,
      totalChecklistItems,
      completedChecklistItems,
      checklistCompletionPct,
      avgChecklistCompletion,
      tasksWithoutChecklist,
      recentTasks,
    };
  }, [tasks, checklistItems]);

  if (!currentUser) {
    return null; // This shouldn't happen if routing is set up correctly
  }

  return (
    <div className="min-h-screen bg-cp-neutral-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-cp-primary-500 rounded-lg p-8 text-white mb-8 shadow-lg">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4 text-white">
                Construction Planner
              </h1>
              <p className="text-white text-lg mb-6">
                Professional offline-first construction task management
              </p>
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Link
                  to="/floor-plan"
                  className="bg-white/20 border border-white/30 rounded-lg p-4 hover:bg-white/30 transition-all duration-200 group"
                >
                  <div className="text-yellow-300 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 text-white">Floor Plans</h3>
                  <p className="text-sm text-white/80">Manage construction floor plans</p>
                </Link>
                <Link
                  to="/tasks"
                  className="bg-white/20 border border-white/30 rounded-lg p-4 hover:bg-white/30 transition-all duration-200 group"
                >
                  <div className="text-green-300 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 text-white">Task Board</h3>
                  <p className="text-sm text-white/80">Track project tasks & progress</p>
                </Link>
                <div className="bg-white/20 border border-white/30 rounded-lg p-4">
                  <div className="text-yellow-200 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 text-white">Analytics</h3>
                  <p className="text-sm text-white/80">Project insights & reports</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
              <h3 className="text-lg font-semibold text-cp-neutral-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-cp-primary-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                User Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cp-neutral-600">Username:</span>
                  <span className="text-sm text-cp-neutral-900 font-semibold">{currentUser.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cp-neutral-600">User ID:</span>
                  <span className="text-xs text-cp-neutral-700 font-mono bg-cp-neutral-100 px-2 py-1 rounded">{currentUser.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cp-neutral-600">Created:</span>
                  <span className="text-sm text-cp-neutral-900">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cp-neutral-600">Last Login:</span>
                  <span className="text-xs text-cp-neutral-700">
                    {new Date(currentUser.lastLoginAt).toLocaleDateString()}{' '}
                    {new Date(currentUser.lastLoginAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Completed */}
              <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cp-success-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-cp-neutral-600 uppercase tracking-wide">Completed</p>
                    <p className="text-2xl font-bold text-cp-neutral-900">{analytics.completed}</p>
                    <p className="text-xs text-cp-neutral-500">{analytics.completionPct}% of {analytics.total || 0}</p>
                  </div>
                </div>
              </div>
              {/* In Progress */}
              <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cp-primary-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-cp-neutral-600 uppercase tracking-wide">In Progress</p>
                    <p className="text-2xl font-bold text-cp-neutral-900">{analytics.inProgress}</p>
                    <p className="text-xs text-cp-neutral-500">Active tasks</p>
                  </div>
                </div>
              </div>
              {/* Blocked */}
              <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cp-danger-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-cp-neutral-600 uppercase tracking-wide">Blocked</p>
                    <p className="text-2xl font-bold text-cp-neutral-900">{analytics.blocked}</p>
                    <p className="text-xs text-cp-neutral-500">Need attention</p>
                  </div>
                </div>
              </div>
              {/* Final Check */}
              <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cp-warning-400 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-cp-neutral-600 uppercase tracking-wide">Final Check</p>
                    <p className="text-2xl font-bold text-cp-neutral-900">{analytics.finalCheck}</p>
                    <p className="text-xs text-cp-neutral-500">Ready to verify</p>
                  </div>
                </div>
              </div>
              {/* Checklist Progress */}
              <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cp-secondary-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-cp-neutral-600 uppercase tracking-wide">Checklist</p>
                    <p className="text-2xl font-bold text-cp-neutral-900">{analytics.checklistCompletionPct}%</p>
                    <p className="text-xs text-cp-neutral-500">{analytics.completedChecklistItems}/{analytics.totalChecklistItems} items</p>
                  </div>
                </div>
              </div>
              {/* Tasks w/o Checklist */}
              <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cp-neutral-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-cp-neutral-600 uppercase tracking-wide">No Checklist</p>
                    <p className="text-2xl font-bold text-cp-neutral-900">{analytics.tasksWithoutChecklist}</p>
                    <p className="text-xs text-cp-neutral-500">Of {analytics.total} tasks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution & Recent Activity */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Distribution */}
            <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200 lg:col-span-2">
              <h3 className="text-sm font-semibold text-cp-neutral-800 mb-4 tracking-wide uppercase">Task Status Distribution</h3>
              <div className="space-y-4">
                {[
                  { label: 'Not Started', value: analytics.notStarted, color: 'bg-cp-neutral-300' },
                  { label: 'In Progress', value: analytics.inProgress, color: 'bg-cp-primary-500' },
                  { label: 'Blocked', value: analytics.blocked, color: 'bg-cp-danger-500' },
                  { label: 'Final Check', value: analytics.finalCheck, color: 'bg-cp-warning-400' },
                  { label: 'Done', value: analytics.completed, color: 'bg-cp-success-500' },
                ].map(row => {
                  const pct = analytics.total ? Math.round((row.value / analytics.total) * 100) : 0;
                  return (
                    <div key={row.label} className="flex items-center">
                      <div className="w-32 text-xs font-medium text-cp-neutral-600">{row.label}</div>
                      <div className="flex-1 h-3 bg-cp-neutral-100 rounded-full overflow-hidden mr-3">
                        <div className={`${row.color} h-full transition-all`} style={{ width: pct + '%' }} />
                      </div>
                      <div className="w-16 text-right text-xs text-cp-neutral-500">{row.value} ({pct}%)</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-[11px] text-cp-neutral-500">Checklist metrics reflect only tasks whose checklist items have been loaded in this session.</div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-cp p-6 border border-cp-neutral-200">
              <h3 className="text-sm font-semibold text-cp-neutral-800 mb-4 tracking-wide uppercase">Recent Activity</h3>
              <ul className="space-y-3">
                {analytics.recentTasks.length === 0 && (
                  <li className="text-xs text-cp-neutral-500">No tasks yet.</li>
                )}
                {analytics.recentTasks.map(task => (
                  <li key={task.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-cp-neutral-800">{task.title}</p>
                      <p className="text-[11px] text-cp-neutral-500">{task.status} · {new Date(task.updatedAt).toLocaleDateString()} {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RxDB Data Viewer & Emergency Tools - Visible only for admin (and still only in development env) */}
          {process.env.NODE_ENV === 'development' && isAdmin && (
            <div className="mt-8">
              <div className="mb-4 p-4 bg-cp-warning-50 border border-cp-warning-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-cp-warning-800">🛠️ Development Tools</h4>
                    <p className="text-xs text-cp-warning-700">Emergency database cleanup for development</p>
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
                    className="px-4 py-2 bg-cp-danger-500 hover:bg-cp-danger-600 text-white text-sm font-medium rounded-md transition duration-200"
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
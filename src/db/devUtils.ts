// Development utility to manage RxDB database
import { closeDatabase, resetDatabase } from './database';

// Clear IndexedDB for fresh start (manual cleanup only)
export const clearIndexedDB = async () => {
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      console.log('🧹 Starting IndexedDB cleanup...');
      
      // First, try to close any existing database connections
      try {
        const { closeDatabase } = await import('./database');
        await closeDatabase();
        console.log('✅ Closed existing database connections');
      } catch (error) {
        console.log('⚠️ Could not close database connections:', error);
      }
      
      // Wait a bit for connections to close
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get all databases
      if ('databases' in indexedDB) {
        const databases = await indexedDB.databases();
        console.log('📋 Found databases:', databases.map(db => db.name));
        
        await Promise.all(
          databases.map(db => {
            if (db.name?.includes('construction_planner') || 
                db.name?.includes('rxdb') || 
                db.name?.includes('dexie')) {
              return new Promise<void>((resolve, reject) => {
                console.log(`🗑️ Deleting database: ${db.name}`);
                const deleteRequest = indexedDB.deleteDatabase(db.name!);
                deleteRequest.onsuccess = () => {
                  console.log(`✅ Deleted IndexedDB: ${db.name}`);
                  resolve();
                };
                deleteRequest.onerror = () => {
                  console.error(`❌ Failed to delete: ${db.name}`, deleteRequest.error);
                  reject(deleteRequest.error);
                };
                deleteRequest.onblocked = () => {
                  console.warn(`⚠️ Delete blocked for: ${db.name} - close all tabs`);
                  resolve(); // Continue anyway
                };
              });
            }
            return Promise.resolve();
          })
        );
      } else {
        // Fallback for browsers that don't support databases()
        const commonDbNames = [
          'construction_planner_db',
          'construction_planner_db_v2',
          'rxdb-dexie',
          'rxdb-internal'
        ];
        
        await Promise.all(
          commonDbNames.map(name => 
            new Promise<void>((resolve) => {
              const deleteRequest = indexedDB.deleteDatabase(name);
              deleteRequest.onsuccess = () => {
                console.log(`✅ Deleted database: ${name}`);
                resolve();
              };
              deleteRequest.onerror = () => {
                console.log(`ℹ️ Database ${name} didn't exist or couldn't be deleted`);
                resolve();
              };
              deleteRequest.onblocked = () => {
                console.warn(`⚠️ Delete blocked for: ${name}`);
                resolve();
              };
            })
          )
        );
      }
      
      // Also clear sessionStorage
      sessionStorage.clear();
      
      // Set cleanup flag to prevent reload loops
      sessionStorage.setItem('rxdb-cleanup-done', 'true');
      
      console.log('🧹 IndexedDB cleanup completed');
      
      // Clear ALL localStorage (including Zustand persist data)
      localStorage.clear();
      console.log('🗑️ All localStorage and sessionStorage cleared');
      
    } catch (error) {
      console.error('❌ Error during IndexedDB cleanup:', error);
      throw error;
    }
  }
};

// Development utilities (manual tools only)
export const initDevUtils = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    window.rxdbUtils = {
      closeDatabase,
      resetDatabase,
      clearIndexedDB
    };
    
    console.log('🛠️ RxDB Dev Utils available:');
    console.log('  window.rxdbUtils.closeDatabase() - Close current database');
    console.log('  window.rxdbUtils.resetDatabase() - Reset and recreate database');
    console.log('  window.rxdbUtils.clearIndexedDB() - Clear all IndexedDB data');
    
    // No auto-cleanup - only manual tools available
  }
};
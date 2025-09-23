
import { closeDatabase, resetDatabase } from './database';

export const clearIndexedDB = async () => {
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      console.log('🧹 Starting IndexedDB cleanup...');
      try {
        const { closeDatabase } = await import('./database');
        await closeDatabase();
        console.log('✅ Closed existing database connections');
      } catch (error) {
        console.log('⚠️ Could not close database connections:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
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
                  resolve();
                };
              });
            }
            return Promise.resolve();
          })
        );
      } else {
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
                resolve();
              };
              deleteRequest.onblocked = () => {
                resolve();
              };
            })
          )
        );
      }
      sessionStorage.clear();
      sessionStorage.setItem('rxdb-cleanup-done', 'true');
      console.log('🧹 IndexedDB cleanup completed');
      localStorage.clear();
      console.log('🗑️ All localStorage and sessionStorage cleared');
    } catch (error) {
      console.error('❌ Error during IndexedDB cleanup:', error);
      throw error;
    }
  }
};

export const initDevUtils = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    window.rxdbUtils = {
      closeDatabase,
      resetDatabase,
      clearIndexedDB
    };
    console.log('🛠️ RxDB Dev Utils available:');
    console.log('  window.rxdbUtils.closeDatabase()');
    console.log('  window.rxdbUtils.resetDatabase()');
    console.log('  window.rxdbUtils.clearIndexedDB()');
  }
};
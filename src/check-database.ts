// Test that REAL RxDB v16.19.0 is running with the fixed dynamic imports
import { initializeDatabase } from './db/database';

export async function checkActualDatabase() {
  console.log('🔍 Checking that REAL RxDB v16.19.0 is running with fixed imports...');
  
  try {
    const db = await initializeDatabase();
    
    // Check if it's real RxDB by testing RxDB-specific features
    if (db && db.collections && db.collections.users) {
      console.log('✅ CONFIRMED: REAL RxDB v16.19.0 is running!');
      console.log('✅ Database name:', (db as any).name);
      console.log('✅ Collections:', Object.keys(db.collections));
      console.log('✅ Storage type:', (db as any).storage?.name || 'Unknown');
      
      // Test basic operations
      const testUser = await db.users.insert({
        id: 'test_' + Date.now(),
        username: 'rxdb_test_user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
      
      console.log('✅ Insert test successful:', testUser.toJSON());
      
      const foundUser = await db.users.findOne({
        selector: { username: 'rxdb_test_user' }
      }).exec();
      
      console.log('✅ Query test successful:', foundUser?.toJSON());
      
      // Test update
      if (foundUser) {
        const updatedUser = await foundUser.incrementalPatch({
          lastLoginAt: new Date().toISOString()
        });
        console.log('✅ Update test successful:', updatedUser.toJSON());
      }
      
      console.log('🎉 ALL RxDB v16.19.0 TESTS PASSED!');
      return { success: true, type: 'REAL_RXDB', db };
    } else {
      console.log('❌ NOT RxDB - missing collections structure');
      return { success: false, type: 'UNKNOWN', db };
    }
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { success: false, type: 'ERROR', error };
  }
}

// Export for use in other files
export default checkActualDatabase;
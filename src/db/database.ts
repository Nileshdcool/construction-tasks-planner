import { userSchema } from './schemas/user';
import { taskSchema, checklistItemSchema } from './schemas/task';
import { floorPlanSchema } from './schemas/floorPlan';

// Database interface compatible with RxDB
interface DatabaseAPI {
  users: {
    findOne(query: { selector: any }): { exec(): Promise<any> };
    insert(data: any): Promise<any>;
    find(): { exec(): Promise<any[]> };
  };
  tasks: {
    findOne(query: { selector: any }): { exec(): Promise<any> };
    insert(data: any): Promise<any>;
    find(query?: { selector?: any }): { exec(): Promise<any[]> };
    remove(): Promise<void>;
  };
  checklistItems: {
    findOne(query: { selector: any }): { exec(): Promise<any> };
    insert(data: any): Promise<any>;
    find(query?: { selector?: any }): { exec(): Promise<any[]> };
    remove(): Promise<void>;
  };
  floorPlans: {
    findOne(query: { selector: any }): { exec(): Promise<any> };
    insert(data: any): Promise<any>;
    find(query?: { selector?: any }): { exec(): Promise<any[]> };
    remove(): Promise<void>;
  };
  collections: any;
  remove(): Promise<void>;
}

// Database instance - singleton pattern
let database: DatabaseAPI | null = null;
let isInitializing = false;

// Create database using dynamic imports to avoid TS module resolution issues
async function createRxDBInstance(): Promise<DatabaseAPI> {
  try {
    console.log('🚀 Creating RxDB v16.19.0 database with dynamic imports...');
    console.log('📦 Attempting to load RxDB core module...');
    
    // Load dev-mode plugin first to get better error messages
    try {
      const devModeModule = await import('rxdb/plugins/dev-mode');
      const RxDBDevModePlugin = (devModeModule as any).RxDBDevModePlugin || (devModeModule as any).default?.RxDBDevModePlugin;
      const corePluginModule = await import('rxdb/plugins/core');
      const addRxPlugin = (corePluginModule as any).addRxPlugin || (corePluginModule as any).default?.addRxPlugin;
      
      if (addRxPlugin && RxDBDevModePlugin) {
        addRxPlugin(RxDBDevModePlugin);
        console.log('✅ Dev-mode plugin loaded for better error messages');
      } else {
        console.log('⚠️ Could not find addRxPlugin or RxDBDevModePlugin functions');
      }

      // Load migration schema plugin for schema migrations
      const migrationSchemaModule = await import('rxdb/plugins/migration-schema');
      const RxDBMigrationSchemaPlugin = (migrationSchemaModule as any).RxDBMigrationSchemaPlugin || (migrationSchemaModule as any).default?.RxDBMigrationSchemaPlugin;
      
      if (addRxPlugin && RxDBMigrationSchemaPlugin) {
        addRxPlugin(RxDBMigrationSchemaPlugin);
        console.log('✅ Migration schema plugin loaded for database migrations');
      } else {
        console.log('⚠️ Could not find RxDBMigrationSchemaPlugin');
      }
    } catch (error) {
      console.log('⚠️ Could not load plugins:', error);
    }
    
    // Dynamic import to avoid TypeScript compilation issues
    const coreModule = await import('rxdb/plugins/core');
    console.log('📦 Core module loaded, available exports:', Object.keys(coreModule));
    console.log('📦 Core module default exports:', Object.keys(coreModule.default || {}));
    let createRxDatabase = (coreModule as any).createRxDatabase || (coreModule as any).default?.createRxDatabase;
    
    // Debug what we actually got
    console.log('🔍 createRxDatabase function found:', !!createRxDatabase);
    
    // If not found in core, try the main module
    if (!createRxDatabase) {
      console.log('Trying main rxdb module for createRxDatabase');
      const mainModule = await import('rxdb');
      createRxDatabase = (mainModule as any).createRxDatabase;
    }
    
    if (!createRxDatabase) {
      throw new Error('createRxDatabase not found in any RxDB module');
    }
    
    // Try to get storage with validation wrapper (required for dev-mode)
    let storage: any;
    try {
      // Load validation wrapper first
      const validateModule = await import('rxdb/plugins/validate-ajv');
      const wrappedValidateAjvStorage = (validateModule as any).wrappedValidateAjvStorage || (validateModule as any).default?.wrappedValidateAjvStorage;
      
      if (!wrappedValidateAjvStorage) {
        throw new Error('wrappedValidateAjvStorage not found');
      }
      
      // Try Dexie storage
      const dexieModule = await import('rxdb/plugins/storage-dexie');
      console.log('📦 Dexie module exports:', Object.keys(dexieModule));
      console.log('📦 Dexie module default exports:', Object.keys(dexieModule.default || {}));
      const getRxStorageDexie = (dexieModule as any).getRxStorageDexie || (dexieModule as any).default?.getRxStorageDexie;
      console.log('🔍 getRxStorageDexie function found:', !!getRxStorageDexie);
      
      if (getRxStorageDexie) {
        // Wrap Dexie storage with validation (required for dev-mode)
        storage = wrappedValidateAjvStorage({
          storage: getRxStorageDexie()
        });
        console.log('✅ Using Dexie/IndexedDB storage with validation wrapper');
        console.log('🔍 Storage object:', storage);
      } else {
        throw new Error('getRxStorageDexie not found');
      }
    } catch (error) {
      console.log('Dexie not available, trying memory storage with validation');
      try {
        // Load validation wrapper
        const validateModule = await import('rxdb/plugins/validate-ajv');
        const wrappedValidateAjvStorage = (validateModule as any).wrappedValidateAjvStorage || (validateModule as any).default?.wrappedValidateAjvStorage;
        
        const memoryModule = await import('rxdb/plugins/storage-memory');
        console.log('📦 Memory module exports:', Object.keys(memoryModule));
        const getRxStorageMemory = (memoryModule as any).getRxStorageMemory || (memoryModule as any).default?.getRxStorageMemory;
        console.log('🔍 getRxStorageMemory function found:', !!getRxStorageMemory);
        
        if (getRxStorageMemory && wrappedValidateAjvStorage) {
          // Wrap memory storage with validation (required for dev-mode)
          storage = wrappedValidateAjvStorage({
            storage: getRxStorageMemory()
          });
          console.log('✅ Using Memory storage with validation wrapper');
          console.log('🔍 Storage object:', storage);
        } else {
          throw new Error('No storage or validation available');
        }
      } catch (error2) {
        throw new Error('No RxDB storage plugins available');
      }
    }
    
    // Create the RxDB database
    console.log('🔨 Creating database with:');
    console.log('  - name: construction_planner_db');
    console.log('  - storage:', storage?.name || 'unknown');
    console.log('  - createRxDatabase function:', typeof createRxDatabase);
    
    const db = await createRxDatabase({
      name: 'construction_planner_db_v6', // Another bump to ensure clean slate after schema sync
      storage: storage,
      ignoreDuplicate: true,
    });
    
    // Add collections
    await db.addCollections({
      users: {
        schema: userSchema
      },
      tasks: {
        schema: taskSchema
      },
      checklistItems: {
        schema: checklistItemSchema,
        migrationStrategies: {
          // Migration from version 0 to version 1
          1: function (oldDoc: any) {
            // Add status field with default value
            const newDoc = { ...oldDoc };
            newDoc.status = oldDoc.status || 'not-started';
            return newDoc;
          }
        }
      },
      floorPlans: {
        schema: floorPlanSchema,
        migrationStrategies: {
          // Migration from version 0 to version 1
          1: function (oldDoc: any) {
            // Add new fields with default values
            const newDoc = { ...oldDoc };
            newDoc.description = oldDoc.description || '';
            newDoc.updatedAt = oldDoc.updatedAt || oldDoc.uploadedAt;
            newDoc.tags = oldDoc.tags || [];
            newDoc.version = oldDoc.version || 1;
            return newDoc;
          }
        }
      }
    });
    
    console.log('✅ REAL RxDB v16.19.0 database created successfully!');
    console.log('✅ Collections added:', Object.keys(db.collections));
    console.log('🔢 Total collections in database:', Object.keys(db.collections).length);
    
    return db as unknown as DatabaseAPI;
    
  } catch (error) {
    console.error('❌ RxDB creation failed:', error);
    console.log('💡 This is expected with RxDB v16+ import issues');
    
    // Reset database reference on any error
    database = null;
    isInitializing = false;
    
    // Check for Dexie DatabaseClosedError
    if (error instanceof Error && error.message.includes('Database has been closed')) {
      console.warn('🔧 Database was closed, attempting fresh initialization...');
      
      // Wait a bit and try again once
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        return await createRxDBInstance();
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        const helpError = new Error(
          'Database connection failed. Please run window.rxdbUtils.clearIndexedDB() in the browser console and reload the page.'
        );
        throw helpError;
      }
    }
    
    // Check for schema migration errors (COL12)
    if (error instanceof Error && (error.message.includes('COL12') || error.message.includes('migrationStrategy'))) {
      console.warn('🔧 Schema conflict detected!');
      console.log('🛠️ To fix this, run the following in the browser console:');
      console.log('   window.rxdbUtils.clearIndexedDB()');
      console.log('   Then reload the page');
      
      // Create a more helpful error message
      const schemaError = new Error(
        'Database schema conflict detected. Please run window.rxdbUtils.clearIndexedDB() in the browser console and then reload the page to continue.'
      );
      throw schemaError;
    }
    
    throw error;
  }
}

/**
 * Create and return the RxDB database instance
 * Uses Latest RxDB v16.19.0 with dynamic imports
 * No sync helper used - pure offline implementation as required
 */
export async function getDatabase(): Promise<DatabaseAPI> {
  if (database) {
    try {
      // Test if the database is still alive by checking collections
      if (database.collections && Object.keys(database.collections).length > 0) {
        console.log('♻️ Reusing existing RxDB database instance');
        return database;
      } else {
        console.log('⚠️ Database exists but has no collections, reinitializing...');
        database = null;
      }
    } catch (error) {
      console.log('⚠️ Database connection test failed, reinitializing...', error);
      database = null;
    }
  }
  
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (database) {
      return database;
    }
  }

  isInitializing = true;
  try {
    console.log('🚀 Creating new RxDB database instance...');
    database = await createRxDBInstance();
    return database;
  } finally {
    isInitializing = false;
  }
}

/**
 * Initialize the database
 */
export async function initializeDatabase(): Promise<DatabaseAPI> {
  const db = await getDatabase();
  console.log('✅ REAL RxDB database initialized');
  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (database) {
    console.log('🔄 Closing RxDB database...');
    try {
      // Check if database is still alive before trying to close it
      if (database.collections) {
        await database.remove();
      }
    } catch (error) {
      console.warn('Warning closing database:', error);
      // Even if closing fails, reset the reference
    }
    database = null;
    isInitializing = false; // Reset initialization flag
    console.log('✅ RxDB database closed and references cleared');
  }
}

/**
 * Reset and recreate the database (useful for development/testing)
 */
export async function resetDatabase(): Promise<DatabaseAPI> {
  await closeDatabase();
  return getDatabase();
}

/**
 * Get the database instance (for direct access if needed)
 */
export function getDatabaseInstance(): DatabaseAPI | null {
  return database;
}

export async function findUserByUsername(username: string) {
  const db = await getDatabase();
  return db.users.findOne({
    selector: { username }
  }).exec();
}

export async function createUser(username: string) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return db.users.insert({
    id,
    username,
    createdAt: now,
    lastLoginAt: now,
  });
}

export async function updateUserLastLogin(userId: string) {
  const db = await getDatabase();
  const user = await db.users.findOne({
    selector: { id: userId }
  }).exec();
  
  if (user) {
    const now = new Date().toISOString();
    return user.incrementalPatch({ lastLoginAt: now });
  }
  return null;
}

export async function createTask(taskData: {
  title: string;
  description?: string;
  status?: 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';
  position?: { x: number; y: number };
  userId: string;
  planId?: string;
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return db.tasks.insert({
    id,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status || 'not-started',
    position: taskData.position,
    planId: taskData.planId,
    userId: taskData.userId,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getTasksByUserId(userId: string, planId?: string) {
  const db = await getDatabase();
  const selector: any = { userId };
  if (planId) selector.planId = planId;
  return db.tasks.find({
    selector
  }).exec();
}

export async function updateTaskStatus(taskId: string, status: 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done') {
  const db = await getDatabase();
  const task = await db.tasks.findOne({
    selector: { id: taskId }
  }).exec();
  
  if (task) {
    const now = new Date().toISOString();
    return task.incrementalPatch({ status, updatedAt: now });
  }
  return null;
}

// Generic update for multiple task fields
export async function updateTaskFields(taskId: string, updates: {
  title?: string;
  description?: string;
  status?: 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';
  position?: { x: number; y: number };
  planId?: string;
}) {
  const db = await getDatabase();
  const task = await db.tasks.findOne({ selector: { id: taskId } }).exec();
  if (task) {
    const now = new Date().toISOString();
    const patch: any = { updatedAt: now };
    if (typeof updates.title === 'string') patch.title = updates.title;
    if (typeof updates.description === 'string') patch.description = updates.description;
    if (updates.status) patch.status = updates.status;
    if (updates.position) patch.position = updates.position;
     if (typeof updates.planId === 'string') patch.planId = updates.planId;
    return task.incrementalPatch(patch);
  }
  return null;
}

export async function deleteTask(taskId: string) {
  const db = await getDatabase();
  const task = await db.tasks.findOne({
    selector: { id: taskId }
  }).exec();
  
  if (task) {
    // Also delete associated checklist items
    const checklistItems = await db.checklistItems.find({
      selector: { taskId }
    }).exec();
    
    for (const item of checklistItems) {
      await item.remove();
    }
    
    return task.remove();
  }
  return null;
}

export async function createChecklistItem(itemData: {
  taskId: string;
  title: string;
  status?: string;
  order?: number;
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get the current max order for this task
  const existingItems = await db.checklistItems.find({
    selector: { taskId: itemData.taskId }
  }).exec();
  
  const order = itemData.order !== undefined ? itemData.order : existingItems.length;
  
  return db.checklistItems.insert({
    id,
    taskId: itemData.taskId,
    title: itemData.title,
    completed: false,
    status: itemData.status || 'not-started',
    order,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getChecklistItemsByTaskId(taskId: string) {
  const db = await getDatabase();
  return db.checklistItems.find({
    selector: { taskId }
  }).exec();
}

export async function updateChecklistItemCompleted(itemId: string, completed: boolean) {
  const db = await getDatabase();
  const item = await db.checklistItems.findOne({
    selector: { id: itemId }
  }).exec();
  
  if (item) {
    const now = new Date().toISOString();
    const updates: any = { completed, updatedAt: now };
    
    // Sync status with completion: if checking, set to 'done'; if unchecking, set to 'not-started'
    if (completed) {
      updates.status = 'done';
    } else {
      // Only change status to 'not-started' if it was 'done', preserve other statuses
      const currentStatus = item.status || 'not-started';
      if (currentStatus === 'done') {
        updates.status = 'not-started';
      }
    }
    
    return item.incrementalPatch(updates);
  }
  return null;
}

export async function updateChecklistItemStatus(itemId: string, status: string) {
  const db = await getDatabase();
  const item = await db.checklistItems.findOne({
    selector: { id: itemId }
  }).exec();
  
  if (item) {
    const now = new Date().toISOString();
    const updates: any = { status, updatedAt: now };
    
    // Sync completion with status: 'done' should be checked, others should be unchecked
    updates.completed = status === 'done';
    
    return item.incrementalPatch(updates);
  }
  return null;
}

export async function deleteChecklistItem(itemId: string) {
  const db = await getDatabase();
  const item = await db.checklistItems.findOne({
    selector: { id: itemId }
  }).exec();
  
  if (item) {
    return item.remove();
  }
  return null;
}

export async function createFloorPlan(floorPlanData: {
  userId: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageFileName: string;
  tags?: string[];
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = `floor_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // First, deactivate any existing active floor plans for this user
  const existingPlans = await db.floorPlans.find({
    selector: { userId: floorPlanData.userId, isActive: true }
  }).exec();
  
  for (const plan of existingPlans) {
    await plan.incrementalPatch({ isActive: false });
  }
  
  // Create new floor plan as active
  return db.floorPlans.insert({
    id,
    userId: floorPlanData.userId,
    name: floorPlanData.name,
    description: floorPlanData.description || '',
    imageUrl: floorPlanData.imageUrl,
    imageFileName: floorPlanData.imageFileName,
    uploadedAt: now,
    updatedAt: now,
    isActive: true,
    tags: floorPlanData.tags || [],
    version: 1,
  });
}

export async function getActiveFloorPlan(userId: string) {
  const db = await getDatabase();
  return db.floorPlans.findOne({
    selector: { userId, isActive: true }
  }).exec();
}

export async function getFloorPlansByUserId(userId: string) {
  const db = await getDatabase();
  return db.floorPlans.find({
    selector: { userId }
  }).exec();
}

export async function setActiveFloorPlan(floorPlanId: string, userId: string) {
  const db = await getDatabase();
  
  // Deactivate all floor plans for this user
  const allPlans = await db.floorPlans.find({
    selector: { userId }
  }).exec();
  
  for (const plan of allPlans) {
    await plan.incrementalPatch({ isActive: false });
  }
  
  // Activate the selected floor plan
  const selectedPlan = await db.floorPlans.findOne({
    selector: { id: floorPlanId }
  }).exec();
  
  if (selectedPlan) {
    return selectedPlan.incrementalPatch({ isActive: true });
  }
  return null;
}

export async function deleteFloorPlan(floorPlanId: string) {
  const db = await getDatabase();
  // Find and delete all tasks with this planId
  const tasks = await db.tasks.find({ selector: { planId: floorPlanId } }).exec();
  for (const task of tasks) {
    // This will also delete associated checklist items
    if (task.id) {
      await exports.deleteTask(task.id);
    }
  }

  // Now delete the floor plan itself
  const floorPlan = await db.floorPlans.findOne({ selector: { id: floorPlanId } }).exec();
  if (floorPlan) {
    return floorPlan.remove();
  }
  return null;
}

// Update floor plan name
export async function renameFloorPlan(floorPlanId: string, name: string) {
  const db = await getDatabase();
  const plan = await db.floorPlans.findOne({ selector: { id: floorPlanId } }).exec();
  if (plan) {
    const now = new Date().toISOString();
    const currentVersion = plan.version || 1;
    return plan.incrementalPatch({ 
      name, 
      updatedAt: now,
      version: currentVersion + 1
    });
  }
  return null;
}

// Update floor plan metadata (description, tags, etc.)
export async function updateFloorPlanMetadata(floorPlanId: string, updates: {
  name?: string;
  description?: string;
  tags?: string[];
}) {
  const db = await getDatabase();
  const plan = await db.floorPlans.findOne({ selector: { id: floorPlanId } }).exec();
  if (plan) {
    const now = new Date().toISOString();
    const currentVersion = plan.version || 1;
    const updateData: any = {
      updatedAt: now,
      version: currentVersion + 1
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    
    return plan.incrementalPatch(updateData);
  }
  return null;
}

// Replace floor plan image (keep other fields same)
export async function replaceFloorPlanImage(floorPlanId: string, imageUrl: string, imageFileName: string) {
  const db = await getDatabase();
  const plan = await db.floorPlans.findOne({ selector: { id: floorPlanId } }).exec();
  if (plan) {
    const now = new Date().toISOString();
    const currentVersion = plan.version || 1;
    return plan.incrementalPatch({ 
      imageUrl, 
      imageFileName,
      updatedAt: now,
      version: currentVersion + 1
    });
  }
  return null;
}
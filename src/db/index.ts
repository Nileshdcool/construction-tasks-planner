// Re-export all database functionality from the modular services
// This maintains backward compatibility with existing imports

// Core database functions
export {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  resetDatabase,
  getDatabaseInstance,
  type DatabaseAPI
} from './core/connection';

// User service functions
export {
  findUserByUsername,
  createUser,
  updateUserLastLogin
} from './services/userService';

// Task service functions
export {
  createTask,
  getTasksByUserId,
  updateTaskStatus,
  updateTaskFields,
  deleteTask
} from './services/taskService';

// Checklist service functions
export {
  createChecklistItem,
  getChecklistItemsByTaskId,
  updateChecklistItemCompleted,
  updateChecklistItemStatus,
  updateChecklistItemTitle,
  deleteChecklistItem
} from './services/checklistService';

// Floor plan service functions
export {
  createFloorPlan,
  getActiveFloorPlan,
  getFloorPlansByUserId,
  setActiveFloorPlan,
  deleteFloorPlan,
  renameFloorPlan,
  updateFloorPlanMetadata,
  replaceFloorPlanImage
} from './services/floorPlanService';
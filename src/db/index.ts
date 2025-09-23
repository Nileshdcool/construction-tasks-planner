export {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  resetDatabase,
  getDatabaseInstance,
  type DatabaseAPI
} from './core/connection';

export {
  findUserByUsername,
  createUser,
  updateUserLastLogin
} from './services/userService';

export {
  createTask,
  getTasksByUserId,
  updateTaskStatus,
  updateTaskFields,
  deleteTask
} from './services/taskService';

export {
  createChecklistItem,
  getChecklistItemsByTaskId,
  updateChecklistItemCompleted,
  updateChecklistItemStatus,
  updateChecklistItemTitle,
  deleteChecklistItem
} from './services/checklistService';

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
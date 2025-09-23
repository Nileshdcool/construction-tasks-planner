import { getDatabase } from '../core/connection';

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
  
  // Create the task
  const task = await db.tasks.insert({
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

  // Import and create default checklist items
  const { getDefaultChecklistItems } = await import('../../utils/defaultChecklist');
  const defaultItems = getDefaultChecklistItems();
  
  // Create default checklist items for the new task
  for (const item of defaultItems) {
    // Use direct database access to avoid circular dependency
    const db = await getDatabase();
    const now = new Date().toISOString();
    const checklistId = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.checklistItems.insert({
      id: checklistId,
      taskId: id,
      title: item.title,
      completed: false,
      status: item.status || 'not-started',
      order: item.order,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return task;
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
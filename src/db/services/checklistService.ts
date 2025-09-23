import { getDatabase } from '../core/connection';

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

export async function updateChecklistItemTitle(itemId: string, title: string) {
  const db = await getDatabase();
  const item = await db.checklistItems.findOne({
    selector: { id: itemId }
  }).exec();
  
  if (item) {
    const now = new Date().toISOString();
    return item.incrementalPatch({ title, updatedAt: now });
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
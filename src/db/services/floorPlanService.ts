import { getDatabase } from '../core/connection';

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
  
  // Import task deletion function
  const { deleteTask } = await import('./taskService');
  
  // Find and delete all tasks with this planId
  const tasks = await db.tasks.find({ selector: { planId: floorPlanId } }).exec();
  for (const task of tasks) {
    // This will also delete associated checklist items
    if (task.id) {
      await deleteTask(task.id);
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
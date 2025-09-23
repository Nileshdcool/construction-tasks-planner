import { getDatabase } from '../core/connection';

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
export interface UserDocType {
  id: string;
  username: string;
  createdAt: string;
  lastLoginAt: string;
}

export const userSchema = {
  title: 'User',
  description: 'User schema for construction planner app',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    username: {
      type: 'string',
      maxLength: 50
    },
    createdAt: {
      type: 'string'
    },
    lastLoginAt: {
      type: 'string'
    }
  },
  required: ['id', 'username', 'createdAt', 'lastLoginAt'],
  indexes: ['username']
} as const;
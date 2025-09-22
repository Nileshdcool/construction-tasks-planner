// User document type - this represents the data structure stored in RxDB
export interface UserDocType {
  id: string;
  username: string;
  createdAt: string;
  lastLoginAt: string;
}

// RxDB Schema definition for users collection
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
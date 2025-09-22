// Task status options as per requirements
export type TaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';

// TypeScript interfaces for our data models
export interface ChecklistItemDocType {
  id: string;
  taskId: string; // Reference to parent task
  title: string;
  completed: boolean;
  order: number; // For ordering checklist items
  createdAt: string;
  updatedAt: string;
}

export interface TaskDocType {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  position?: { 
    x: number; 
    y: number; 
  }; // For floor plan positioning
  userId: string; // For user data isolation
  createdAt: string;
  updatedAt: string;
}

// RxDB Schema for Tasks
export const taskSchema = {
  title: 'task schema',
  description: 'Construction task management',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    title: {
      type: 'string',
      maxLength: 200
    },
    description: {
      type: 'string',
      maxLength: 1000
    },
    status: {
      type: 'string',
      enum: ['not-started', 'in-progress', 'blocked', 'final-check', 'done'],
      maxLength: 20,
      default: 'not-started'
    },
    position: {
      type: 'object',
      properties: {
        x: {
          type: 'number',
          minimum: 0,
          maximum: 10000
        },
        y: {
          type: 'number',
          minimum: 0,
          maximum: 10000
        }
      },
      additionalProperties: false
    },
    userId: {
      type: 'string',
      maxLength: 100
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    }
  },
  required: ['id', 'title', 'status', 'userId', 'createdAt', 'updatedAt'],
  indexes: [
    'userId',
    'status',
    'createdAt'
  ]
} as const;

// RxDB Schema for Checklist Items
export const checklistItemSchema = {
  title: 'checklist item schema',
  description: 'Task checklist items',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    taskId: {
      type: 'string',
      maxLength: 100
    },
    title: {
      type: 'string',
      maxLength: 300
    },
    completed: {
      type: 'boolean',
      default: false
    },
    order: {
      type: 'number',
      minimum: 0,
      maximum: 1000,
      multipleOf: 1
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    }
  },
  required: ['id', 'taskId', 'title', 'completed', 'order', 'createdAt', 'updatedAt'],
  indexes: [
    'taskId',
    'order',
    'createdAt'
  ]
} as const;
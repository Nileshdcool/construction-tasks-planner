export type TaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'final-check' | 'done';

export type ChecklistItemStatus = 'not-started' | 'blocked' | 'final-installation' | 'done' | string;

export interface ChecklistItemDocType {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  status: ChecklistItemStatus;
  order: number;
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
  };
  planId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

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
    planId: {
      type: 'string',
      maxLength: 100
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

export const checklistItemSchema = {
  title: 'checklist item schema',
  description: 'Task checklist items',
  version: 1,
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
    status: {
      type: 'string',
      maxLength: 50,
      default: 'not-started'
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
  required: ['id', 'taskId', 'title', 'completed', 'status', 'order', 'createdAt', 'updatedAt'],
  indexes: [
    'taskId',
    'order',
    'createdAt',
    'status'
  ]
} as const;
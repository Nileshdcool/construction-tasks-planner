// Floor plan document type
export interface FloorPlanDocType {
  id: string;
  userId: string; // For user data isolation
  name: string;
  description?: string; // Optional description for the floor plan
  imageUrl: string; // Could be base64 or file path
  imageFileName: string;
  uploadedAt: string;
  updatedAt: string; // Track when plan was last modified
  isActive: boolean; // Only one active floor plan per user
  tags?: string[]; // Optional tags for categorization
  version?: number; // Version number for tracking changes
}

// RxDB Schema for Floor Plans
export const floorPlanSchema = {
  title: 'floor plan schema',
  description: 'Construction floor plan management',
  version: 1, // Incremented version for schema change
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    userId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string',
      maxLength: 200
    },
    description: {
      type: 'string',
      maxLength: 1000
    },
    imageUrl: {
      type: 'string',
      maxLength: 5000000 // Increased to 5MB worth of base64 data for large floor plans
    },
    imageFileName: {
      type: 'string',
      maxLength: 255
    },
    uploadedAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    },
    isActive: {
      type: 'boolean',
      default: false
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 50
      },
      maxItems: 10
    },
    version: {
      type: 'number',
      minimum: 1,
      default: 1
    }
  },
  required: ['id', 'userId', 'name', 'imageUrl', 'imageFileName', 'uploadedAt', 'updatedAt', 'isActive'],
  indexes: [
    'userId',
    'isActive',
    'uploadedAt',
    'updatedAt'
  ]
} as const;
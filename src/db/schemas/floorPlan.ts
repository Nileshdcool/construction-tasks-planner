// Floor plan document type
export interface FloorPlanDocType {
  id: string;
  userId: string; // For user data isolation
  name: string;
  imageUrl: string; // Could be base64 or file path
  imageFileName: string;
  uploadedAt: string;
  isActive: boolean; // Only one active floor plan per user
}

// RxDB Schema for Floor Plans
export const floorPlanSchema = {
  title: 'floor plan schema',
  description: 'Construction floor plan management',
  version: 0, // Keeping version 0 and will clear data for schema change
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
    isActive: {
      type: 'boolean',
      default: false
    }
  },
  required: ['id', 'userId', 'name', 'imageUrl', 'imageFileName', 'uploadedAt', 'isActive'],
  indexes: [
    'userId',
    'isActive',
    'uploadedAt'
  ]
} as const;
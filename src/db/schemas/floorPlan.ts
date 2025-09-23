export interface FloorPlanDocType {
  id: string;
  userId: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageFileName: string;
  uploadedAt: string;
  updatedAt: string;
  isActive: boolean;
  tags?: string[];
  version?: number;
}

export const floorPlanSchema = {
  title: 'floor plan schema',
  description: 'Construction floor plan management',
  version: 1,
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
      maxLength: 5000000
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
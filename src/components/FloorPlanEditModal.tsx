import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FloorPlan } from '../store/floorPlanStore';

interface FloorPlanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlan: FloorPlan;
  onUpdate: (floorPlanId: string, updates: { name?: string; description?: string; tags?: string[] }) => Promise<void>;
}

export const FloorPlanEditModal: React.FC<FloorPlanEditModalProps> = ({
  isOpen,
  onClose,
  floorPlan,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && floorPlan) {
      setFormData({
        name: floorPlan.name || '',
        description: floorPlan.description || '',
        tags: floorPlan.tags || []
      });
    }
  }, [isOpen, floorPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(floorPlan.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tags: formData.tags
      });
      toast.success('Floor plan updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update floor plan');
      console.error('Error updating floor plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-cp-neutral-900">
              Edit Floor Plan
            </h3>
            <button
              onClick={onClose}
              className="text-cp-neutral-400 hover:text-cp-neutral-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-cp-neutral-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border border-cp-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-primary-400 focus:border-transparent"
                placeholder="Enter floor plan name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-cp-neutral-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-cp-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-primary-400 focus:border-transparent resize-none"
                placeholder="Add a description for this floor plan..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-cp-neutral-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cp-primary-100 text-cp-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-cp-primary-600 hover:text-cp-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-md border border-cp-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-primary-400 focus:border-transparent"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="px-3 py-2 rounded-md bg-cp-neutral-100 hover:bg-cp-neutral-200 text-cp-neutral-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-2 border-t border-cp-neutral-200">
              <div className="text-xs text-cp-neutral-500 space-y-1">
                <div>Created: {new Date(floorPlan.uploadedAt).toLocaleDateString()}</div>
                {floorPlan.updatedAt !== floorPlan.uploadedAt && (
                  <div>Modified: {new Date(floorPlan.updatedAt).toLocaleDateString()}</div>
                )}
                {floorPlan.version && floorPlan.version > 1 && (
                  <div>Version: {floorPlan.version}</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-cp-neutral-700 bg-white border border-cp-neutral-300 rounded-md hover:bg-cp-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-cp-primary-600 border border-transparent rounded-md hover:bg-cp-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navigation } from '../components/Navigation';
import { FloorPlanEditModal } from '../components/FloorPlanEditModal';
import { useCurrentUser } from '../store/authStore';
import { useFloorPlanStore, useUserFloorPlans, useActiveFloorPlan } from '../store/floorPlanStore';

interface NewPlanFormState {
  name: string;
  description: string;
  file: File | null;
  tags: string[];
}

export const PlansPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const floorPlans = useUserFloorPlans();
  const activePlan = useActiveFloorPlan();
  const { loadUserFloorPlans, uploadFloorPlan, setActiveFloorPlanById, removeFloorPlan, rename, replaceImage, updateMetadata } = useFloorPlanStore();

  const [newPlan, setNewPlan] = useState<NewPlanFormState>({ name: '', description: '', file: null, tags: [] });
  const [renameStates, setRenameStates] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      loadUserFloorPlans(currentUser.id);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !newPlan.name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setNewPlan(prev => ({ ...prev, name: baseName, file }));
    } else {
      setNewPlan(prev => ({ ...prev, file }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.file || !newPlan.name.trim()) return;
    setIsSubmitting(true);
    try {
      await uploadFloorPlan(currentUser.id, newPlan.name.trim(), newPlan.file, newPlan.description.trim(), newPlan.tags);
      toast.success('Plan created successfully!');
      setNewPlan({ name: '', description: '', file: null, tags: [] });
      setShowAdd(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async (id: string) => {
    const value = renameStates[id]?.trim();
    if (!value) return;
    await rename(id, value);
  };

  const handleReplace = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        replaceImage(id, file);
      }
    };
    input.click();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this plan? This cannot be undone.')) return;
    await removeFloorPlan(id);
  };

  const handleActivate = async (id: string) => {
    if (currentUser) {
      await setActiveFloorPlanById(id, currentUser.id);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
  };

  const handleUpdateMetadata = async (floorPlanId: string, updates: { name?: string; description?: string; tags?: string[] }) => {
    await updateMetadata(floorPlanId, updates);
  };

  return (
    <div className="min-h-screen bg-cendas-neutral-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-cendas-neutral-900 mb-1">Floor Plans</h1>
              <p className="text-cendas-neutral-600 text-sm">Manage multiple project floor plans. Activate one to place and view tasks.</p>
            </div>
            <button
              onClick={() => setShowAdd(s => !s)}
              className="px-4 py-2 rounded-md text-sm font-medium bg-cendas-primary-600 hover:bg-cendas-primary-700 text-white transition"
            >
              {showAdd ? 'Cancel' : 'New Plan'}
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleCreate} className="mb-8 bg-white border border-cendas-neutral-200 rounded-lg p-5 shadow-sm">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-cendas-neutral-600 mb-1">Plan Image</label>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="block w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cendas-neutral-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan(p => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-md border border-cendas-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cendas-primary-400"
                    placeholder="Ground Floor"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-cendas-neutral-600 mb-1">Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-md border border-cendas-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cendas-primary-400 resize-none"
                  placeholder="Optional description for this floor plan..."
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={!newPlan.file || !newPlan.name.trim() || isSubmitting}
                  className="px-4 py-2 rounded-md bg-cendas-primary-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cendas-primary-700 transition"
                >
                  {isSubmitting ? 'Creating...' : 'Create Plan'}
                </button>
                {newPlan.file && (
                  <span className="text-[11px] text-cendas-neutral-500 truncate max-w-[140px]">{newPlan.file.name}</span>
                )}
              </div>
            </form>
          )}

          {floorPlans.length === 0 ? (
            <div className="bg-white border border-cendas-neutral-200 rounded-lg p-8 text-center text-sm text-cendas-neutral-600">
              No floor plans yet. Create your first one.
            </div>
          ) : floorPlans.length === 1 ? (
            (() => {
              const plan = floorPlans[0];
              if (!plan) return null;
              const isActive = activePlan?.id === plan.id;
              return (
                <div className={`relative group bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col max-w-xl mx-auto ${isActive ? 'border-cendas-primary-400 ring-1 ring-cendas-primary-300' : 'border-cendas-neutral-200'}`}>
                  <div className="aspect-video w-full bg-cendas-neutral-100 flex items-center justify-center overflow-hidden">
                    {plan.imageUrl ? (
                      <img src={plan.imageUrl} alt={plan.name} className="object-contain max-h-full" />
                    ) : (
                      <span className="text-xs text-cendas-neutral-400">No image</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-2">
                        <input
                          value={renameStates[plan.id] ?? plan.name}
                          onChange={(e) => setRenameStates(s => ({ ...s, [plan.id]: e.target.value }))}
                          onBlur={() => handleRename(plan.id)}
                          className="w-full bg-transparent border border-transparent focus:border-cendas-primary-300 rounded px-1 py-0.5 text-sm font-medium text-cendas-neutral-900 focus:outline-none"
                        />
                        <div className="flex items-center space-x-2 mt-1">
                          {isActive && <span className="inline-flex items-center px-2 py-0.5 rounded bg-cendas-primary-100 text-cendas-primary-700 text-[10px] font-semibold">ACTIVE</span>}
                          <span className="text-[10px] text-cendas-neutral-500">{new Date(plan.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        {plan.description && (
                          <p className="text-[11px] text-cendas-neutral-600 mt-1 truncate" title={plan.description}>{plan.description}</p>
                        )}
                        {plan.tags && plan.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {plan.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-cendas-neutral-100 text-cendas-neutral-600">
                                {tag}
                              </span>
                            ))}
                            {plan.tags.length > 3 && (
                              <span className="text-[9px] text-cendas-neutral-500">+{plan.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleActivate(plan.id)}
                        className={`text-[10px] font-medium px-2 py-1 rounded border transition ${isActive ? 'border-cendas-primary-400 text-cendas-primary-600 bg-cendas-primary-50' : 'border-cendas-neutral-300 text-cendas-neutral-600 hover:bg-cendas-neutral-100'}`}
                      >
                        {isActive ? 'Active' : 'Activate'}
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-cendas-neutral-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-[11px] px-2 py-1 rounded bg-cendas-primary-50 hover:bg-cendas-primary-100 text-cendas-primary-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleReplace(plan.id)}
                          className="text-[11px] px-2 py-1 rounded bg-cendas-neutral-100 hover:bg-cendas-neutral-200 text-cendas-neutral-700 font-medium"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-[11px] px-2 py-1 rounded bg-cendas-danger-50 hover:bg-cendas-danger-100 text-cendas-danger-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-[10px] text-cendas-neutral-500 font-mono truncate max-w-[90px]">{plan.id.slice(0,10)}...</div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {floorPlans.sort((a,b)=> new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map(plan => {
                const isActive = activePlan?.id === plan.id;
                return (
                  <div key={plan.id} className={`relative group bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col ${isActive ? 'border-cendas-primary-400 ring-1 ring-cendas-primary-300' : 'border-cendas-neutral-200'}`}>
                    <div className="aspect-video w-full bg-cendas-neutral-100 flex items-center justify-center overflow-hidden">
                      {plan.imageUrl ? (
                        <img src={plan.imageUrl} alt={plan.name} className="object-contain max-h-full" />
                      ) : (
                        <span className="text-xs text-cendas-neutral-400">No image</span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 mr-2">
                          <input
                            value={renameStates[plan.id] ?? plan.name}
                            onChange={(e) => setRenameStates(s => ({ ...s, [plan.id]: e.target.value }))}
                            onBlur={() => handleRename(plan.id)}
                            className="w-full bg-transparent border border-transparent focus:border-cendas-primary-300 rounded px-1 py-0.5 text-sm font-medium text-cendas-neutral-900 focus:outline-none"
                          />
                          <div className="flex items-center space-x-2 mt-1">
                            {isActive && <span className="inline-flex items-center px-2 py-0.5 rounded bg-cendas-primary-100 text-cendas-primary-700 text-[10px] font-semibold">ACTIVE</span>}
                            <span className="text-[10px] text-cendas-neutral-500">{new Date(plan.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          {plan.description && (
                            <p className="text-[11px] text-cendas-neutral-600 mt-1 truncate" title={plan.description}>{plan.description}</p>
                          )}
                          {plan.tags && plan.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {plan.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-cendas-neutral-100 text-cendas-neutral-600">
                                  {tag}
                                </span>
                              ))}
                              {plan.tags.length > 3 && (
                                <span className="text-[9px] text-cendas-neutral-500">+{plan.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleActivate(plan.id)}
                          className={`text-[10px] font-medium px-2 py-1 rounded border transition ${isActive ? 'border-cendas-primary-400 text-cendas-primary-600 bg-cendas-primary-50' : 'border-cendas-neutral-300 text-cendas-neutral-600 hover:bg-cendas-neutral-100'}`}
                        >
                          {isActive ? 'Active' : 'Activate'}
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-cendas-neutral-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="text-[11px] px-2 py-1 rounded bg-cendas-primary-50 hover:bg-cendas-primary-100 text-cendas-primary-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleReplace(plan.id)}
                            className="text-[11px] px-2 py-1 rounded bg-cendas-neutral-100 hover:bg-cendas-neutral-200 text-cendas-neutral-700 font-medium"
                          >
                            Replace
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="text-[11px] px-2 py-1 rounded bg-cendas-danger-50 hover:bg-cendas-danger-100 text-cendas-danger-600 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="text-[10px] text-cendas-neutral-500 font-mono truncate max-w-[90px]">{plan.id.slice(0,10)}...</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      {editingPlan && (
        <FloorPlanEditModal
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          floorPlan={editingPlan}
          onUpdate={handleUpdateMetadata}
        />
      )}
    </div>
  );
};

import { ChecklistItemStatus } from '../store/taskStore';

export interface DefaultChecklistItem {
  title: string;
  status: ChecklistItemStatus;
  order: number;
}

// Default checklist items that will be added to every new task
export const DEFAULT_CHECKLIST_ITEMS: DefaultChecklistItem[] = [
  {
    title: "Review project requirements and specifications",
    status: "not-started",
    order: 1
  },
  {
    title: "Gather necessary materials and tools",
    status: "not-started", 
    order: 2
  },
  {
    title: "Set up workspace and safety measures",
    status: "not-started",
    order: 3
  },
];

/**
 * Returns a copy of the default checklist items for a new task
 */
export function getDefaultChecklistItems(): DefaultChecklistItem[] {
  return DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item }));
}
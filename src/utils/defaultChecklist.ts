import { ChecklistItemStatus } from '../store/taskStore';

export interface DefaultChecklistItem {
  title: string;
  status: ChecklistItemStatus;
  order: number;
}

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

export function getDefaultChecklistItems(): DefaultChecklistItem[] {
  return DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item }));
}
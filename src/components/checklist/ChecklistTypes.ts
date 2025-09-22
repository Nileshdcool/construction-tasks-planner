import { ChecklistItem } from '../../store/taskStore';

export interface BaseChecklistItemData {
  id?: string; // optional for unsaved (creation modal)
  title: string;
  completed?: boolean;
}

export type ExistingChecklistItem = ChecklistItem;

export type AnyChecklistItem = ExistingChecklistItem | BaseChecklistItemData;

export interface ChecklistRowProps {
  item: AnyChecklistItem;
  mode: 'view' | 'create';
  onToggle?: ((completed: boolean) => void) | undefined;
  onRemove?: (() => void) | undefined;
}

export interface ChecklistListProps {
  items: AnyChecklistItem[];
  mode: 'view' | 'create';
  onToggleItem?: (id: string, completed: boolean) => void; // only in view mode
  onRemoveTempItem?: (index: number) => void; // only in create mode
}

export function computeStatus(item: AnyChecklistItem) {
  const lower = item.title.toLowerCase();
  const isBlocked = lower.includes('block');
  const isFinal = lower.includes('final');
  const completed = !!item.completed;
  let state: 'blocked' | 'completed' | 'final' | 'not-started' = 'not-started';
  if (isBlocked) state = 'blocked';
  else if (completed) state = 'completed';
  else if (isFinal) state = 'final';
  return state;
}

export function statusMeta(state: ReturnType<typeof computeStatus>) {
  switch (state) {
    case 'blocked':
      return { color: 'red', label: 'Blocked : Part installation done' };
    case 'completed':
      return { color: 'green', label: 'Done: Part installation done' };
    case 'final':
      return { color: 'blue', label: 'Final installation done' };
    default:
      return { color: 'gray', label: 'Not started' };
  }
}

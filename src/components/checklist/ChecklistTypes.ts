import { ChecklistItem, ChecklistItemStatus } from '../../store/taskStore';

export interface BaseChecklistItemData {
  id?: string; // optional for unsaved (creation modal)
  title: string;
  completed?: boolean;
  status?: ChecklistItemStatus;
}

export type ExistingChecklistItem = ChecklistItem;

export type AnyChecklistItem = ExistingChecklistItem | BaseChecklistItemData;

export interface ChecklistRowProps {
  item: AnyChecklistItem;
  mode: 'view' | 'create';
  onToggle?: ((completed: boolean) => void) | undefined;
  onRemove?: (() => void) | undefined;
  onStatusChange?: ((status: ChecklistItemStatus) => void) | undefined;
}

export interface ChecklistListProps {
  items: AnyChecklistItem[];
  mode: 'view' | 'create';
  onToggleItem?: (id: string, completed: boolean) => void; // only in view mode
  onRemoveTempItem?: (index: number) => void; // only in create mode
  onUpdateItemStatus?: (id: string, status: ChecklistItemStatus) => void; // only in view mode
}

export function computeStatus(item: AnyChecklistItem) {
  // Use the actual status field if available, otherwise fall back to text-based detection for backward compatibility
  if ('status' in item && item.status) {
    const completed = !!item.completed;
    
    // Map status to display states
    switch (item.status) {
      case 'blocked':
        return 'blocked';
      case 'final-installation':
        return completed ? 'completed' : 'final';
      case 'done':
        return 'completed';
      case 'not-started':
      default:
        return completed ? 'completed' : 'not-started';
    }
  }
  
  // Fallback to text-based detection for backward compatibility
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
      return { color: 'red', label: 'Blocked' };
    case 'completed':
      return { color: 'green', label: 'Done' };
    case 'final':
      return { color: 'amber', label: 'Final Installation' };
    default:
      return { color: 'gray', label: 'Not Started' };
  }
}

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
  onEdit?: ((newTitle: string) => void) | undefined;
  onDelete?: (() => void) | undefined;
}

export interface ChecklistListProps {
  items: AnyChecklistItem[];
  mode: 'view' | 'create';
  onToggleItem?: (id: string, completed: boolean) => void; // only in view mode
  onRemoveTempItem?: (index: number) => void; // only in create mode
  onUpdateItemStatus?: (id: string, status: ChecklistItemStatus) => void; // only in view mode
  onEditItem?: (id: string, newTitle: string) => void; // only in view mode
  onDeleteItem?: (id: string) => void; // only in view mode
}

export function computeStatus(item: AnyChecklistItem) {
  // Use the actual status field if available, otherwise fall back to text-based detection for backward compatibility
  if ('status' in item && item.status) {
    const completed = !!item.completed;
    
    // Map status to display states
    switch (item.status) {
      case 'not-started':
        return 'not-started';
      case 'in-progress':
        return 'in-progress';
      case 'blocked':
        return 'blocked';
      case 'final-check':
        return 'final-check';
      case 'done':
        return 'done';
      // Legacy support
      case 'final-installation':
        return completed ? 'done' : 'final-check';
      default:
        return completed ? 'done' : 'not-started';
    }
  }
  
  // Fallback to text-based detection for backward compatibility
  const lower = item.title.toLowerCase();
  const isBlocked = lower.includes('block');
  const isFinal = lower.includes('final');
  const completed = !!item.completed;
  let state: 'blocked' | 'done' | 'final-check' | 'not-started' | 'in-progress' = 'not-started';
  if (isBlocked) state = 'blocked';
  else if (completed) state = 'done';
  else if (isFinal) state = 'final-check';
  return state;
}

export function statusMeta(state: ReturnType<typeof computeStatus>) {
  switch (state) {
    case 'not-started':
      return { color: 'gray', label: 'Not Started' };
    case 'in-progress':
      return { color: 'blue', label: 'In Progress' };
    case 'blocked':
      return { color: 'red', label: 'Blocked' };
    case 'final-check':
      return { color: 'amber', label: 'Final Check Awaiting' };
    case 'done':
      return { color: 'green', label: 'Done' };
    default:
      return { color: 'gray', label: 'Not Started' };
  }
}

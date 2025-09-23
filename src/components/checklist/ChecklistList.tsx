import React from 'react';
import { ChecklistListProps, AnyChecklistItem } from './ChecklistTypes';
import { ChecklistRow } from './ChecklistRow';

export const ChecklistList: React.FC<ChecklistListProps> = ({ 
  items, 
  mode, 
  onToggleItem, 
  onRemoveTempItem, 
  onUpdateItemStatus, 
  onEditItem, 
  onDeleteItem 
}) => {
  if (!items.length) return null;
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item, idx) => (
        <ChecklistRow
          key={(item as AnyChecklistItem).id ?? idx}
          item={item}
          mode={mode}
          {...(mode === 'view' && item.id && onToggleItem ? { onToggle: (completed: boolean) => onToggleItem(item.id!, completed) } : {})}
          {...(mode === 'view' && item.id && onUpdateItemStatus ? { onStatusChange: (status: string) => onUpdateItemStatus(item.id!, status) } : {})}
          {...(mode === 'view' && item.id && onEditItem ? { onEdit: (newTitle: string) => onEditItem(item.id!, newTitle) } : {})}
          {...(mode === 'view' && item.id && onDeleteItem ? { onDelete: () => onDeleteItem(item.id!) } : {})}
          {...(mode === 'create' && onRemoveTempItem ? { onRemove: () => onRemoveTempItem(idx) } : {})}
        />
      ))}
    </ul>
  );
};

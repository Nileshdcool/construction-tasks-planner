import React from 'react';
import { ChecklistListProps, AnyChecklistItem } from './ChecklistTypes';
import { ChecklistRow } from './ChecklistRow';

export const ChecklistList: React.FC<ChecklistListProps> = ({ items, mode, onToggleItem, onRemoveTempItem }) => {
  if (!items.length) return null;
  return (
    <ul className="divide-y divide-gray-100 mb-2">
      {items.map((item, idx) => (
        <ChecklistRow
          key={(item as AnyChecklistItem).id ?? idx}
          item={item}
          mode={mode}
          {...(mode === 'view' && item.id && onToggleItem ? { onToggle: (completed: boolean) => onToggleItem(item.id!, completed) } : {})}
          {...(mode === 'create' && onRemoveTempItem ? { onRemove: () => onRemoveTempItem(idx) } : {})}
        />
      ))}
    </ul>
  );
};

import React, { useState } from 'react';
import { ChecklistItemStatus } from '../store/taskStore';

interface ChecklistItemStatusSelectorProps {
  value: ChecklistItemStatus;
  onChange: (status: ChecklistItemStatus) => void;
  showCustomInput?: boolean;
  className?: string;
}

// Predefined statuses with their display labels and colors
export const PREDEFINED_STATUSES = [
  { value: 'not-started', label: 'Not Started', color: 'gray' },
  { value: 'blocked', label: 'Blocked', color: 'red' },
  { value: 'final-installation', label: 'Final Installation', color: 'amber' },
  { value: 'done', label: 'Done', color: 'green' }
] as const;

export const ChecklistItemStatusSelector: React.FC<ChecklistItemStatusSelectorProps> = ({
  value,
  onChange,
  showCustomInput = true,
  className = ''
}) => {
  const [isCustom, setIsCustom] = useState(() => 
    !PREDEFINED_STATUSES.some(status => status.value === value)
  );
  const [customValue, setCustomValue] = useState(() => 
    isCustom ? value : ''
  );

  const handlePredefinedChange = (newValue: string) => {
    setIsCustom(false);
    onChange(newValue);
  };

  const handleCustomToggle = () => {
    if (!isCustom) {
      setIsCustom(true);
      setCustomValue('');
      onChange('');
    } else {
      setIsCustom(false);
      onChange('not-started');
    }
  };

  const handleCustomValueChange = (newCustomValue: string) => {
    setCustomValue(newCustomValue);
    onChange(newCustomValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Predefined Status Options */}
      <div className="grid grid-cols-2 gap-2">
        {PREDEFINED_STATUSES.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => handlePredefinedChange(status.value)}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition ${
              !isCustom && value === status.value
                ? getSelectedClasses(status.color)
                : getUnselectedClasses(status.color)
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Custom Status Option */}
      {showCustomInput && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCustomToggle}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md border transition ${
              isCustom
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isCustom ? 'Custom Status (selected)' : 'Custom Status'}
          </button>
          
          {isCustom && (
            <input
              type="text"
              value={customValue}
              onChange={(e) => handleCustomValueChange(e.target.value)}
              placeholder="Enter custom status..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              autoFocus
            />
          )}
        </div>
      )}
    </div>
  );
};

function getSelectedClasses(color: string): string {
  const colorMap = {
    gray: 'bg-gray-100 border-gray-400 text-gray-800',
    red: 'bg-red-50 border-red-400 text-red-800',
    amber: 'bg-amber-50 border-amber-400 text-amber-800',
    green: 'bg-green-50 border-green-400 text-green-800'
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
}

function getUnselectedClasses(color: string): string {
  const colorMap = {
    gray: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
    red: 'bg-white border-gray-300 text-gray-700 hover:bg-red-50',
    amber: 'bg-white border-gray-300 text-gray-700 hover:bg-amber-50',
    green: 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
}
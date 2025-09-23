import React from 'react';
import { ChecklistItemStatus } from '../store/taskStore';
import { PREDEFINED_STATUSES } from './ChecklistItemStatusSelector';

interface ChecklistItemStatusBadgeProps {
  status: ChecklistItemStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const ChecklistItemStatusBadge: React.FC<ChecklistItemStatusBadgeProps> = ({
  status,
  size = 'sm',
  className = ''
}) => {
  // Find predefined status configuration
  const predefinedStatus = PREDEFINED_STATUSES.find(s => s.value === status);
  
  // Determine display text and color
  const displayText = predefinedStatus ? predefinedStatus.label : status;
  const color = predefinedStatus ? predefinedStatus.color : 'blue'; // Custom statuses use blue

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  };

  // Color classes
  const colorClasses = getColorClasses(color);

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium tracking-wide
      ${sizeClasses[size]}
      ${colorClasses}
      ${className}
    `}>
      {displayText}
    </span>
  );
};

function getColorClasses(color: string): string {
  const colorMap = {
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    green: 'bg-green-50 text-green-700 border border-green-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200' // For custom statuses
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
}
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus } from '../store/taskStore';

interface FloorPlanPosition {
  x: number;
  y: number;
  relativeX: number; // Percentage position (0-100)
  relativeY: number; // Percentage position (0-100)
}

interface TaskMarker extends Task {
  position: FloorPlanPosition;
}

interface InteractiveFloorPlanProps {
  imageUrl: string;
  tasks: Task[];
  onTaskCreate: (position: FloorPlanPosition) => void;
  onTaskSelect: (task: Task) => void;
  isAddingTask?: boolean;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'not-started': return 'bg-gray-500';
    case 'in-progress': return 'bg-blue-500';
    case 'blocked': return 'bg-red-500';
    case 'final-check': return 'bg-yellow-500';
    case 'done': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getTaskTypeAbbreviation = (title: string): string => {
  // Extract meaningful abbreviation from task title
  const words = title.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    return 'T'; // Fallback for empty title
  } else if (words.length === 1 && words[0]) {
    // Single word - take first 2-3 characters
    return words[0].substring(0, Math.min(3, words[0].length)).toUpperCase();
  } else if (words.length === 2 && words[0] && words[1]) {
    // Two words - take first letter of each
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  } else if (words.length >= 3) {
    // Multiple words - take first letter of first 2-3 words
    return words.slice(0, 3)
      .filter(word => word && word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  } else {
    // Fallback
    return words[0]?.charAt(0).toUpperCase() || 'T';
  }
};

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({
  imageUrl,
  tasks,
  onTaskCreate,
  onTaskSelect,
  isAddingTask = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert tasks with positions to markers
  const taskMarkers: TaskMarker[] = tasks
    .filter(task => task.position)
    .map(task => ({
      ...task,
      position: {
        x: task.position!.x,
        y: task.position!.y,
        relativeX: (task.position!.x / imageDimensions.width) * 100,
        relativeY: (task.position!.y / imageDimensions.height) * 100,
      }
    }));

  useEffect(() => {
    const updateImageDimensions = () => {
      if (imageRef.current && imageLoaded) {
        setImageDimensions({
          width: imageRef.current.naturalWidth,
          height: imageRef.current.naturalHeight
        });
      }
    };

    updateImageDimensions();
    window.addEventListener('resize', updateImageDimensions);
    return () => window.removeEventListener('resize', updateImageDimensions);
  }, [imageLoaded]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isAddingTask || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to relative coordinates (percentage)
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;

    // Convert to absolute coordinates based on natural image size
    const absoluteX = (x / rect.width) * imageDimensions.width;
    const absoluteY = (y / rect.height) * imageDimensions.height;

    const position: FloorPlanPosition = {
      x: absoluteX,
      y: absoluteY,
      relativeX,
      relativeY
    };

    onTaskCreate(position);
  };

  const handleTaskMarkerClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setSelectedTask(task.id === selectedTask ? null : task.id);
    onTaskSelect(task);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="relative">
      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            {isAddingTask 
              ? "Click anywhere on the floor plan to add a new task at that location"
              : "Click on task markers to view details, or enable 'Add Task' mode to create new tasks"
            }
          </div>
        </div>
      </div>

      {/* Floor Plan Container */}
      <div 
        ref={containerRef}
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        style={{ 
          cursor: isAddingTask ? 'crosshair' : 'default',
          minHeight: '400px'
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Construction floor plan"
          className="w-full h-auto block"
          onLoad={handleImageLoad}
          onClick={handleImageClick}
          style={{ 
            maxHeight: '80vh',
            objectFit: 'contain'
          }}
        />

        {/* Task Markers Overlay */}
        {imageLoaded && taskMarkers.map((taskMarker) => (
          <div
            key={taskMarker.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${taskMarker.position.relativeX}%`,
              top: `${taskMarker.position.relativeY}%`,
              zIndex: selectedTask === taskMarker.id ? 20 : 10
            }}
            onClick={(e) => handleTaskMarkerClick(e, taskMarker)}
          >
            {/* Task Marker Pin with Task Type Label */}
            <div className={`relative ${getStatusColor(taskMarker.status)} rounded-full w-8 h-8 border-2 border-white shadow-lg transform transition-transform group-hover:scale-110 ${selectedTask === taskMarker.id ? 'scale-125 ring-2 ring-blue-400' : ''} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold leading-none">
                {getTaskTypeAbbreviation(taskMarker.title)}
              </span>
            </div>

            {/* Enhanced Task Info Tooltip */}
            <div className={`absolute transition-all duration-300 ease-out z-50 pointer-events-none ${
              selectedTask === taskMarker.id 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
            } ${
              taskMarker.position.relativeY < 30 
                ? 'top-full mt-3' // Show below if near top
                : taskMarker.position.relativeY > 70
                ? 'bottom-full mb-3' // Show above if near bottom
                : 'bottom-full mb-3' // Default above
            } ${
              taskMarker.position.relativeX < 20
                ? 'left-0 transform-none' // Align left if near left edge
                : taskMarker.position.relativeX > 80
                ? 'right-0 transform-none' // Align right if near right edge
                : 'left-1/2 transform -translate-x-1/2' // Center by default
            }`}>
              <div className="bg-slate-800 backdrop-blur-sm text-white text-sm rounded-xl px-4 py-3 shadow-2xl border border-slate-600/50 min-w-max max-w-sm">
                {/* Header with task type and title */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${getStatusColor(taskMarker.status)} text-white text-xs font-bold shadow-sm`}>
                    {getTaskTypeAbbreviation(taskMarker.title)}
                  </div>
                  <div className="font-semibold text-white leading-tight">
                    {taskMarker.title}
                  </div>
                </div>
                
                {/* Description */}
                {taskMarker.description && (
                  <div className="text-slate-300 mb-2 leading-relaxed">
                    {taskMarker.description.length > 80 
                      ? `${taskMarker.description.substring(0, 80)}...` 
                      : taskMarker.description
                    }
                  </div>
                )}
                
                {/* Status info */}
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(taskMarker.status)}`}></div>
                  <span className="text-slate-400 capitalize">
                    {taskMarker.status.replace('-', ' ')}
                  </span>
                </div>
                
                {/* Enhanced Arrow */}
                <div className={`absolute ${
                  taskMarker.position.relativeX < 20 ? 'left-4' :
                  taskMarker.position.relativeX > 80 ? 'right-4' :
                  'left-1/2 transform -translate-x-1/2'
                } w-0 h-0 ${
                  taskMarker.position.relativeY < 30
                    ? 'bottom-full border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-slate-800'
                    : 'top-full border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-800'
                }`}></div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Overlay */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <div className="text-sm text-gray-600">Loading floor plan...</div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Task Status Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { status: 'not-started', label: 'Not Started' },
            { status: 'in-progress', label: 'In Progress' },
            { status: 'blocked', label: 'Blocked' },
            { status: 'final-check', label: 'Final Check' },
            { status: 'done', label: 'Done' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status as TaskStatus)}`}></div>
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Count */}
      <div className="mt-2 text-sm text-gray-600 text-center">
        {taskMarkers.length} task{taskMarkers.length !== 1 ? 's' : ''} positioned on floor plan
      </div>
    </div>
  );
};
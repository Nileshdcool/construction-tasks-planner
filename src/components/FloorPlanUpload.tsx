import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface FloorPlanUploadProps {
  onImageUpload: (imageUrl: string, imageFile: File) => void;
  currentImage?: string;
}

export const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ 
  onImageUpload, 
  currentImage 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processImageFile(imageFile);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    setIsUploading(true);
    
    // Create object URL for immediate preview
    const imageUrl = URL.createObjectURL(file);
    
    // Simulate upload delay (in real app, this would upload to server/storage)
    setTimeout(() => {
      onImageUpload(imageUrl, file);
      setIsUploading(false);
    }, 1000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (currentImage) {
      URL.revokeObjectURL(currentImage);
    }
    onImageUpload('', new File([], ''));
  };

  return (
    <div className="w-full">
      {!currentImage ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Uploading floor plan...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Floor Plan
              </h3>
              <p className="text-gray-600 mb-4 max-w-sm">
                Drag and drop your construction floor plan image here, or click to browse
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUploadClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Choose File
                </button>
                <div className="text-xs text-gray-500 flex items-center">
                  Supports: JPG, PNG, GIF, WebP
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Floor Plan Uploaded
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleUploadClick}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium transition duration-200"
              >
                Replace
              </button>
              <button
                onClick={handleRemoveImage}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm font-medium transition duration-200"
              >
                Remove
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <img
              src={currentImage}
              alt="Floor plan preview"
              className="max-w-full max-h-64 mx-auto rounded border"
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
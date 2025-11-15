
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  maxFiles: number;
  onFilesChange: (files: string[]) => void;
  uploadedFiles: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ maxFiles, onFilesChange, uploadedFiles }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(Array.from(event.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const newFiles = files.slice(0, maxFiles - uploadedFiles.length);
    if (newFiles.length === 0) return;

    let processedCount = 0;
    const newFileUrls: string[] = [];

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFileUrls.push(reader.result as string);
        processedCount++;
        if (processedCount === newFiles.length) {
          onFilesChange([...uploadedFiles, ...newFileUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative block w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-colors ${isDragging ? 'border-brand-purple bg-brand-purple/10' : 'border-gray-300'}`}
      >
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-purple hover:opacity-80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple">
                <span>Nahrát soubory</span>
                <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} disabled={uploadedFiles.length >= maxFiles} />
            </label>
            <p className="pl-1">nebo přetáhněte</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF do 10MB</p>
        </div>
      </div>
       <p className="text-sm font-medium text-gray-700">Nahráno {uploadedFiles.length} z {maxFiles} fotografií</p>
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <img src={file} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-0 right-0 m-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
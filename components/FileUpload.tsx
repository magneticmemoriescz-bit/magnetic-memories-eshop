
import React, { useState, useRef } from 'react';
import { UploadedPhoto } from '../types';

// --- KONFIGURACE CLOUDINARY ---
// Cloud Name z vašeho dashboardu: dvzuwzrpm
const CLOUDINARY_CLOUD_NAME = 'dvzuwzrpm'; 
// Upload Preset, který jste vytvořila: magnetic_memories
const CLOUDINARY_UPLOAD_PRESET = 'magnetic_memories'; 

export interface UploadedFilesInfo {
    photos: UploadedPhoto[];
    groupId: string | null;
}

interface FileUploadProps {
  maxFiles: number;
  onFilesChange: (filesInfo: UploadedFilesInfo) => void;
  uploadedFilesInfo: UploadedFilesInfo;
  isReorderable?: boolean;
}

/**
 * Vlastní komponenta pro nahrávání fotografií
 * - Provádí kompresi na straně klienta (šetří data a peníze)
 * - Nahrává přímo do Cloudinary (vysoké limity zdarma)
 * - Podporuje Drag & Drop a řazení (pro kalendáře)
 */
export const FileUpload: React.FC<FileUploadProps> = ({ maxFiles, onFilesChange, uploadedFilesInfo, isReorderable = false }) => {
  const { photos } = uploadedFilesInfo;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Komprese pro zajištění maximální tiskové kvality (DPI)
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // 2500px je ideální pro tisk A4/A5 ve 300 DPI
          const MAX_WIDTH = 2500;
          const MAX_HEIGHT = 2500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Chyba při zpracování fotky.'));
          }, 'image/jpeg', 0.90); // Špičková kvalita 90%
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    if (photos.length + filesArray.length > maxFiles) {
      alert(`Můžete nahrát maximálně ${maxFiles} fotografií.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const newUploadedPhotos: UploadedPhoto[] = [...photos];

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        if (!file.type.startsWith('image/')) continue;

        const compressedBlob = await compressImage(file);
        
        const formData = new FormData();
        formData.append('file', compressedBlob);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'magnetic_memories');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Nahrávání selhalo');
        }

        const data = await response.json();
        newUploadedPhotos.push({
          url: data.secure_url,
          name: file.name
        });

        setUploadProgress(Math.round(((i + 1) / filesArray.length) * 100));
      }

      onFilesChange({ photos: newUploadedPhotos, groupId: `local-${Date.now()}` });
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Nahrávání se nezdařilo: ${error.message}. Zkontrolujte prosím nastavení Cloudinary.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onFilesChange({ photos: newPhotos, groupId: null });
  };

  const handleDragStart = (index: number) => { if (isReorderable) setDraggedIndex(index); };
  const handleDragEnter = (index: number) => { if (isReorderable && draggedIndex !== null) setDropIndex(index); };
  const handleDropOrder = () => {
    if (draggedIndex === null || dropIndex === null) return;
    const newPhotos = [...photos];
    const item = newPhotos.splice(draggedIndex, 1)[0];
    newPhotos.splice(dropIndex, 0, item);
    onFilesChange({ photos: newPhotos, groupId: uploadedFilesInfo.groupId });
    setDraggedIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="space-y-4">
        <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragActive ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-300 hover:border-brand-purple bg-gray-50'}
                ${isUploading ? 'pointer-events-none opacity-70' : ''}
            `}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            
            <div className="flex flex-col items-center">
                {isUploading ? (
                    <div className="w-full">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mx-auto"></div>
                        <p className="mt-4 font-medium text-brand-purple">Optimalizace a nahrávání ({uploadProgress}%)</p>
                    </div>
                ) : (
                    <>
                        <svg className="h-12 w-12 text-brand-purple mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-800">Klikněte nebo přetáhněte fotky sem</p>
                        <p className="mt-1 text-xs text-gray-500">Zvolte až {maxFiles} fotografií najednou.</p>
                    </>
                )}
            </div>
        </div>

        <div className="flex justify-between items-center text-sm">
            <span className={`font-medium ${photos.length === maxFiles ? 'text-green-600' : 'text-gray-700'}`}>
                Nahraných fotek: {photos.length} / {maxFiles}
            </span>
            {isReorderable && photos.length > 1 && (
                <span className="text-xs text-gray-400 italic">Přetáhněte fotky pro změnu pořadí v kalendáři</span>
            )}
        </div>

        {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {photos.map((photo, index) => (
                    <div 
                        key={photo.url}
                        draggable={isReorderable}
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDropOrder}
                        className={`relative aspect-square rounded-lg overflow-hidden border shadow-sm group
                            ${draggedIndex === index ? 'opacity-40' : ''}
                            ${dropIndex === index && draggedIndex !== index ? 'ring-2 ring-brand-purple ring-offset-2' : ''}
                            ${isReorderable ? 'cursor-move' : ''}
                        `}
                    >
                        <img 
                            src={photo.url.replace('/upload/', '/upload/w_200,c_fill,g_auto/')} 
                            alt={photo.name} 
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

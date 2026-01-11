
import React, { useState, useRef } from 'react';
import { UploadedPhoto } from '../types';

// --- KONFIGURACE CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = 'dvzuwzrpm'; 
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
 * Vlastní komponenta pro nahrávání fotografií a videí
 * - Provádí kompresi na straně klienta pro obrázky
 * - Nahrává přímo do Cloudinary (detekuje typ souboru)
 * - Umožňuje duplikovat jednu položku do více kusů
 */
export const FileUpload: React.FC<FileUploadProps> = ({ maxFiles, onFilesChange, uploadedFilesInfo, isReorderable = false }) => {
  const { photos } = uploadedFilesInfo;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const path = url.split(/[?#]/)[0].toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.gifv'];
    return videoExtensions.some(ext => path.endsWith(ext)) || url.includes('/video/upload/');
  };

  const compressImage = (file: File): Promise<Blob | File> => {
    if (!file.type.startsWith('image/')) return Promise.resolve(file);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
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
          }, 'image/jpeg', 0.90);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    if (photos.length + filesArray.length > maxFiles) {
      alert(`Můžete nahrát maximálně ${maxFiles} souborů.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const newUploadedPhotos: UploadedPhoto[] = [...photos];

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        
        if (!isImage && !isVideo) continue;

        const uploadData = isImage ? await compressImage(file) : file;
        
        const formData = new FormData();
        formData.append('file', uploadData);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'magnetic_memories');

        // Cloudinary vyžaduje jiný endpoint pro videa
        const resourceType = isVideo ? 'video' : 'image';
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
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

      onFilesChange({ photos: newUploadedPhotos, groupId: uploadedFilesInfo.groupId || `local-${Date.now()}` });
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Nahrávání se nezdařilo: ${error.message}.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const duplicatePhoto = (index: number) => {
    if (photos.length >= maxFiles) {
      alert(`Dosáhli jste maximálního počtu ${maxFiles} kusů.`);
      return;
    }
    const newPhotos = [...photos];
    newPhotos.splice(index + 1, 0, { ...photos[index] });
    onFilesChange({ photos: newPhotos, groupId: uploadedFilesInfo.groupId });
  };

  const removeFile = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onFilesChange({ photos: newPhotos, groupId: newPhotos.length === 0 ? null : uploadedFilesInfo.groupId });
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
                accept="image/*,video/*" 
                className="hidden" 
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            
            <div className="flex flex-col items-center">
                {isUploading ? (
                    <div className="w-full">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mx-auto"></div>
                        <p className="mt-4 font-medium text-brand-purple">Zpracování a nahrávání ({uploadProgress}%)</p>
                    </div>
                ) : (
                    <>
                        <svg className="h-12 w-12 text-brand-purple mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-800">Klikněte nebo přetáhněte soubory sem</p>
                        <p className="mt-1 text-xs text-gray-500">Zvolte až {maxFiles} fotek nebo videí najednou.</p>
                    </>
                )}
            </div>
        </div>

        <div className="flex justify-between items-center text-sm">
            <span className={`font-medium ${photos.length === maxFiles ? 'text-green-600' : 'text-gray-700'}`}>
                Položek: {photos.length} / {maxFiles}
            </span>
            <div className="flex flex-col items-end">
                {isReorderable && photos.length > 1 && (
                    <span className="text-xs text-gray-400 italic">Přetáhněte položky pro změnu pořadí</span>
                )}
                <span className="text-xs text-brand-purple font-medium">U položek klikněte na + pro přidání dalšího kusu.</span>
            </div>
        </div>

        {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {photos.map((photo, index) => (
                    <div 
                        key={`${photo.url}-${index}`}
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
                        {isVideoUrl(photo.url) ? (
                            <video 
                                src={photo.url} 
                                className="w-full h-full object-cover bg-black"
                                muted
                                playsInline
                            />
                        ) : (
                            <img 
                                src={photo.url.replace('/upload/', '/upload/w_200,c_fill,g_auto/')} 
                                alt={photo.name} 
                                className="w-full h-full object-cover"
                            />
                        )}
                        
                        {/* Ovládací prvky nad náhledem */}
                        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                title="Přidat další kus"
                                onClick={(e) => { e.stopPropagation(); duplicatePhoto(index); }}
                                className="bg-brand-purple text-white p-1 rounded-full hover:bg-brand-purple/80 shadow-md"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                title="Odstranit"
                                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {isVideoUrl(photo.url) && (
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white p-0.5 rounded text-[10px]">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

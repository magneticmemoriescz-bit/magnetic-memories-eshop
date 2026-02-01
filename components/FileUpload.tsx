import React, { useCallback, useState } from 'react';
import { UploadedPhoto } from '../types';

interface FileUploadProps {
  onUploadComplete: (photos: UploadedPhoto[], groupId: string | null) => void;
  requiredCount: number;
  productName: string;
  onUploadingChange?: (uploading: boolean) => void;
  labelHint?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, requiredCount, productName, onUploadingChange, labelHint }) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const CLOUDINARY_CLOUD_NAME = 'dvzuwzrpm'; 
  const CLOUDINARY_UPLOAD_PRESET = 'magnetic_preset'; 

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (requiredCount > 0 && files.length !== requiredCount && productName.toLowerCase().includes('kalendář')) {
      alert(`Pro kalendář je potřeba vybrat přesně ${requiredCount} fotografií. Vybrali jste ${files.length}.`);
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setProgress(5);

    const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    try {
      const uploadedPhotos: UploadedPhoto[] = [];
      const groupId = `order-${Date.now()}`;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Chyba serveru Cloudinary');
        
        uploadedPhotos.push({ url: data.secure_url, name: file.name });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      onUploadComplete(uploadedPhotos, groupId);
    } catch (error: any) {
      alert(`Chyba při nahrávání: ${error.message}`);
      setPreviews([]);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      setProgress(0);
    }
  }, [onUploadComplete, requiredCount, productName, onUploadingChange]);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">
          {requiredCount > 0 ? `Nahrajte ${requiredCount} ${requiredCount === 1 ? 'fotku' : 'fotek'}` : 'Nahrajte fotku'} 
          {labelHint && <span className="text-brand-purple lowercase font-normal ml-1 italic">{labelHint}</span>}
        </h3>
        {previews.length > 0 && !uploading && (
            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                Hotovo: {previews.length} ks
            </span>
        )}
      </div>

      <label className={`relative flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'bg-gray-50 border-gray-300 cursor-wait' : 'bg-brand-purple/5 border-brand-purple/30 hover:bg-brand-purple/10'}`}>
        <div className="flex flex-col items-center justify-center p-4 w-full text-center">
          {uploading ? (
            <div className="w-full max-w-[200px] mx-auto">
                <div className="w-8 h-8 border-3 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[10px] font-bold text-brand-purple mb-2 tracking-wide">Ukládám... {progress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-brand-purple to-brand-pink h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 mb-2 text-brand-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mb-1 text-[13px] text-gray-800 font-bold">Vyberte nebo přetáhněte fotky</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold tracking-[0.1em]">JPG, PNG nebo WEBP</p>
            </>
          )}
        </div>
        <input type="file" className="hidden" multiple={requiredCount !== 1} accept="image/*" onChange={handleFileChange} disabled={uploading} />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mt-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
          {previews.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

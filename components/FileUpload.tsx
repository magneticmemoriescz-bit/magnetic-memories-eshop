import React, { useCallback, useState } from 'react';
import { UploadedPhoto } from '../types';

interface FileUploadProps {
  onUploadComplete: (photos: UploadedPhoto[], groupId: string | null) => void;
  requiredCount: number;
  productName: string;
  onUploadingChange?: (uploading: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, requiredCount, productName, onUploadingChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // KONFIGURACE CLOUDINARY
  // Pro produkční nasazení doporučuji tyto hodnoty přesunout do env proměnných nebo konstant
  const CLOUDINARY_CLOUD_NAME = 'dpx7l7vxc'; // Nahraďte svým Cloud Name z Cloudinary konzole
  const CLOUDINARY_UPLOAD_PRESET = 'magnetic_preset'; // Vytvořte v Cloudinary: Settings -> Upload -> Upload Presets (Unsigned)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (requiredCount > 0 && files.length !== requiredCount && productName.toLowerCase().includes('kalendář')) {
      alert(`Pro kalendář je potřeba vybrat přesně ${requiredCount} fotografií.`);
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setProgress(5);

    const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    try {
      const uploadedPhotos: UploadedPhoto[] = [];
      const groupId = `cl-group-${Date.now()}`;

      // Nahráváme soubory jeden po druhém (vhodnější pro sledování progresu na mobilu)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `orders/${groupId}`); // Organizace do složek podle ID objednávky/skupiny

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Chyba při nahrávání na Cloudinary');
        }

        const data = await response.json();
        
        uploadedPhotos.push({
          url: data.secure_url,
          name: file.name
        });

        // Aktualizace progresu
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      onUploadComplete(uploadedPhotos, groupId);
    } catch (error) {
      console.error('Chyba při nahrávání:', error);
      alert('Nahrávání se nezdařilo. Zkontrolujte prosím připojení nebo zkuste nahrát méně fotek najednou.');
      setPreviews([]); // Vyčistit náhledy při chybě
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      setProgress(0);
    }
  }, [onUploadComplete, requiredCount, productName, onUploadingChange]);

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          {requiredCount > 0 ? `Nahrajte ${requiredCount} ${requiredCount === 1 ? 'fotku' : 'fotek'}` : 'Nahrajte své fotky'}
        </h3>
        {previews.length > 0 && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                Vybráno: {previews.length} ks
            </span>
        )}
      </div>

      <label className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? 'bg-gray-50 border-gray-300' : 'bg-brand-purple/5 border-brand-purple/30 hover:bg-brand-purple/10'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <div className="text-center w-full px-8">
                <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-bold text-brand-purple mb-2">Nahrávám vzpomínky... {progress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-brand-purple h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 mb-3 text-brand-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="mb-2 text-sm text-gray-700 font-semibold text-center px-4">
                Klikněte pro výběr fotek <br/> nebo je sem přetáhněte
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-tighter">JPG, PNG, WEBP (Až 10MB / soubor)</p>
            </>
          )}
        </div>
        <input 
            type="file" 
            className="hidden" 
            multiple={requiredCount !== 1} 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={uploading}
        />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {previews.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden border bg-gray-50 shadow-sm transform hover:scale-105 transition-transform">
              <img src={url} alt="Náhled" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center space-x-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
            Optimalizovaný přenos
        </div>
        <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/></svg>
            Smazání po výrobě zaručeno
        </div>
      </div>
    </div>
  );
};

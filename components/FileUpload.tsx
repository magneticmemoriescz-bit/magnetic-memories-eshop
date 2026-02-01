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

  // =======================================================================
  // AKTUALIZOVÁNO PODLE VAŠEHO SCREENSHOTU:
  const CLOUDINARY_CLOUD_NAME = 'dvzuwzrpm'; 
  
  // TENTO PRESET MUSÍ BÝT V CLOUDINARY NASTAVEN JAKO "UNSIGNED" !!!
  const CLOUDINARY_UPLOAD_PRESET = 'magnetic_preset'; 
  // =======================================================================

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validace počtu fotek pro kalendář
    if (requiredCount > 0 && files.length !== requiredCount && productName.toLowerCase().includes('kalendář')) {
      alert(`Pro kalendář je potřeba vybrat přesně ${requiredCount} fotografií. Vybrali jste ${files.length}.`);
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setProgress(5);

    // Vygenerování lokálních náhledů pro okamžitou odezvu
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
        
        console.log(`Nahrávám ${i + 1}/${files.length}: ${file.name} na Cloud: ${CLOUDINARY_CLOUD_NAME}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error('Detail chyby z Cloudinary:', data);
          throw new Error(data.error?.message || 'Chyba serveru Cloudinary');
        }
        
        uploadedPhotos.push({
          url: data.secure_url,
          name: file.name
        });

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      console.log('Všechny fotky úspěšně nahrány:', uploadedPhotos);
      onUploadComplete(uploadedPhotos, groupId);
      
    } catch (error: any) {
      console.error('Chyba při nahrávání:', error);
      
      let errorDetail = error.message;
      if (errorDetail.includes('Invalid cloud name')) {
        errorDetail = `Chybné Cloud Name: ${CLOUDINARY_CLOUD_NAME}. Ujistěte se, že v Cloudinary máte tento název správně.`;
      } else if (errorDetail.includes('Unknown upload preset')) {
        errorDetail = `Preset "${CLOUDINARY_UPLOAD_PRESET}" nebyl nalezen. Ujistěte se, že je v Cloudinary vytvořen jako UNSIGNED.`;
      }

      alert(`Chyba při nahrávání fotek:\n\n${errorDetail}\n\nZkuste nahrát jen jednu fotku pro test.`);
      setPreviews([]);
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
        {previews.length > 0 && !uploading && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                Připraveno: {previews.length} ks
            </span>
        )}
      </div>

      <label className={`relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? 'bg-gray-50 border-gray-300 cursor-wait' : 'bg-brand-purple/5 border-brand-purple/30 hover:bg-brand-purple/10'}`}>
        <div className="flex flex-col items-center justify-center p-6 w-full">
          {uploading ? (
            <div className="text-center w-full max-w-xs">
                <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-bold text-brand-purple mb-3">Ukládám vaše vzpomínky... {progress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-brand-purple to-brand-pink h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 mb-4 text-brand-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mb-2 text-base text-gray-800 font-bold text-center px-4">
                Vyberte fotky z mobilu nebo PC
              </p>
              <p className="text-xs text-gray-500 uppercase font-medium tracking-widest bg-white/50 px-3 py-1 rounded-full border border-gray-100">
                JPG, PNG, WEBP (max 10MB)
              </p>
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
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4 p-2 bg-gray-50 rounded-xl border border-gray-100">
          {previews.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform bg-white">
              <img src={url} alt="Náhled" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center space-x-6 text-[10px] text-gray-400 uppercase tracking-widest font-black">
        <div className="flex items-center group">
            <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
            Šifrovaný přenos
        </div>
        <div className="flex items-center group">
            <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/></svg>
            Smazání po výrobě
        </div>
      </div>
    </div>
  );
};

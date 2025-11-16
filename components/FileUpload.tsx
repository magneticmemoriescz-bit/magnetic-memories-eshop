import React from 'react';

// Tell TypeScript that uploadcare widget exists on the window object
declare global {
    interface Window {
        uploadcare: any;
    }
}

interface FileUploadProps {
  maxFiles: number;
  onFilesChange: (files: string[]) => void;
  uploadedFiles: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ maxFiles, onFilesChange, uploadedFiles }) => {

  const handleUpload = () => {
    if (!window.uploadcare) {
        console.error("Uploadcare widget is not available.");
        alert("Služba pro nahrávání souborů není k dispozici. Zkuste prosím obnovit stránku.");
        return;
    }
    // Pass existing files to the widget so the user can manage them.
    const dialog = window.uploadcare.openDialog(uploadedFiles, {
        imagesOnly: true,
        multiple: true,
        multipleMax: maxFiles,
    });
    
    dialog.done((fileGroup: any) => {
        // The fileGroup is a promise-like object that resolves with group info.
        // It also contains an array of file promises.
        // We wait for all file promises to resolve to get their info.
        Promise.all(fileGroup.files()).then(files => {
            const cdnUrls = files.map(file => file.cdnUrl);
            onFilesChange(cdnUrls);
        });
    });
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
        <button 
            type="button" 
            onClick={handleUpload}
            className="w-full relative block border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-colors border-gray-300"
        >
             <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-brand-purple hover:opacity-80">
                    {uploadedFiles.length > 0 ? 'Spravovat fotografie' : 'Klikněte pro nahrání souborů'}
                </span>
                <p className="mt-1 text-xs text-gray-500">Můžete nahrát až {maxFiles} obrázků z počítače, Google Drive, Facebooku a dalších.</p>
            </div>
        </button>
       <p className="text-sm font-medium text-gray-700">Nahráno {uploadedFiles.length} z {maxFiles} fotografií</p>
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {uploadedFiles.map((fileUrl, index) => (
            <div key={index} className="relative group">
              <img src={`${fileUrl}-/preview/200x200/`} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-0 right-0 m-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <span className="sr-only">Odstranit fotografii</span>
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
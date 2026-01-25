
export const isVideo = (url: string | undefined | null): boolean => {
  if (!url) return false;
  // Odstranění query parametrů a hashů pro čistou cestu k souboru
  const path = url.split(/[?#]/)[0].toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.gifv'];
  
  // Detekce podle přípony nebo podle specifické cesty Cloudinary/Imgur
  return (
    videoExtensions.some(ext => path.endsWith(ext)) || 
    url.includes('/video/upload/') ||
    url.includes('i.imgur.com/') && (url.endsWith('.mp4') || url.endsWith('.gifv'))
  );
};

import React, { useState } from 'react';
import html2canvas from 'html2canvas';

interface PregnancyEditorModalProps {
  image: string;
  aspect: number;
  sizeLabel?: string;
  initialCustomText?: { [key: string]: string };
  onConfirm: (finalCustomText: { [key: string]: string }) => void;
  onCancel: () => void;
}

const AVAILABLE_FONTS = [
  { id: 'Great Vibes', label: 'Něžné písmo', fontStyle: "'Great Vibes', cursive", className: 'font-["Great_Vibes"] text-2xl' },
  { id: 'Pinyon Script', label: 'Elegantní kaligrafie', fontStyle: "'Pinyon Script', cursive", className: 'font-["Pinyon_Script"] text-3xl' },
  { id: 'Dancing Script', label: 'Romantické psací', fontStyle: "'Dancing Script', cursive", className: 'font-["Dancing_Script"] text-lg font-bold' },
  { id: 'Alex Brush', label: 'Klasické ozdobné', fontStyle: "'Alex Brush', cursive", className: 'font-["Alex_Brush"] text-2xl' },
  { id: 'Caveat', label: 'Ručně psané', fontStyle: "'Caveat', cursive", className: 'font-["Caveat"] text-xl font-bold' },
  { id: 'Playfair Display', label: 'Luxusní patkové', fontStyle: "'Playfair Display', Georgia, serif", className: 'font-["Playfair_Display"] text-sm font-semibold italic' },
  { id: 'Cinzel', label: 'Tradiční římské', fontStyle: "'Cinzel', serif", className: 'font-["Cinzel"] text-xs font-bold' },
  { id: 'Montserrat', label: 'Moderní čisté', fontStyle: "'Montserrat', sans-serif", className: 'font-["Montserrat"] text-xs font-bold' }
];

// Rich, saturated baby colors for high readability
const AVAILABLE_COLORS = [
  { id: '#191919', label: 'Černá', colorClass: 'bg-neutral-900 border-neutral-800' },
  { id: '#2B82C9', label: 'Baby Blue', colorClass: 'bg-[#2B82C9] border-[#1e6ca9]' },
  { id: '#D84B8E', label: 'Baby Pink', colorClass: 'bg-[#D84B8E] border-[#b83573]' },
  { id: '#E11D48', label: 'Rose Gold', colorClass: 'bg-rose-500 border-rose-400' },
  { id: '#C084FC', label: 'Fialová', colorClass: 'bg-purple-400 border-purple-300' },
  { id: '#1E3A8A', label: 'Modrá', colorClass: 'bg-blue-900 border-blue-800' },
  { id: '#4B5563', label: 'Přírodně šedá', colorClass: 'bg-gray-600 border-gray-500' },
  { id: '#78350F', label: 'Čokoládová', colorClass: 'bg-amber-900 border-amber-800' },
  { id: '#D4AF37', label: 'Zlatá', colorClass: 'bg-[#D4AF37] border-amber-600' }
];

export const PregnancyEditorModal: React.FC<PregnancyEditorModalProps> = ({
  image,
  aspect,
  sizeLabel,
  initialCustomText = {},
  onConfirm,
  onCancel,
}) => {
  const [text1, setText1] = useState(initialCustomText.t1 || 'Budeme tři...');
  const [text2, setText2] = useState(initialCustomText.t2 || 'podzim 2026');
  const [isExporting, setIsExporting] = useState(false);
  const [font, setFont] = useState(initialCustomText.font || 'Great Vibes');
  const [color, setColor] = useState(initialCustomText.color || '#191919');
  const [photoScale, setPhotoScale] = useState(initialCustomText.photoScale || '100');
  const [photoRotate, setPhotoRotate] = useState<number>(parseFloat(initialCustomText.photoRotate || '0'));
  const [photoX, setPhotoX] = useState(initialCustomText.photoX || '0');
  const [photoY, setPhotoY] = useState(initialCustomText.photoY || '0');
  const [photoFit, setPhotoFit] = useState<'cover' | 'contain'>(
    (initialCustomText.photoFit as 'cover' | 'contain') || 'contain'
  );

  // Text offsets (draggable translation values in pixels)
  const [textY, setTextY] = useState<number>(parseFloat(initialCustomText.textY || '-8'));
  const [textX, setTextX] = useState<number>(parseFloat(initialCustomText.textX || '0'));
  
  // Independent crop margins for all 4 directions (0 to 45 percent)
  const [clipLeft, setClipLeft] = useState<number>(
    parseFloat(initialCustomText.clipLeft || initialCustomText.clipLeftRight || '0')
  );
  const [clipRight, setClipRight] = useState<number>(
    parseFloat(initialCustomText.clipRight || initialCustomText.clipLeftRight || '0')
  );
  const [clipTop, setClipTop] = useState<number>(
    parseFloat(initialCustomText.clipTop || initialCustomText.clipTopBottom || '0')
  );
  const [clipBottom, setClipBottom] = useState<number>(
    parseFloat(initialCustomText.clipBottom || initialCustomText.clipTopBottom || '0')
  );

  // Layout orientation: 'portrait' (na výšku) or 'landscape' (na šířku)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    (initialCustomText.orientation as 'portrait' | 'landscape') || 'portrait'
  );

  // Custom text scaling states
  const [textScale, setTextScale] = useState<number>(() => {
    if (initialCustomText.textScale) {
      return parseFloat(initialCustomText.textScale);
    }
    return ((initialCustomText.orientation as 'portrait' | 'landscape') || 'portrait') === 'portrait' ? 150 : 115;
  });

  const changeOrientation = (newOrientation: 'portrait' | 'landscape') => {
    setOrientation(newOrientation);
    if (textScale === 150 && newOrientation === 'landscape') {
      setTextScale(115);
    } else if (textScale === 115 && newOrientation === 'portrait') {
      setTextScale(150);
    }
  };

  // Active dragging states
  const [activeDrag, setActiveDrag] = useState<'none' | 'photo' | 'text' | 'rotate' | 'crop-top' | 'crop-bottom' | 'crop-left' | 'crop-right'>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, photoX: 0, photoY: 0, initialAngle: 0 });

  // Currently selected font options
  const currentFontObj = AVAILABLE_FONTS.find((f) => f.id === font) || AVAILABLE_FONTS[0];

  // Pre-calculate inner relative crop transforms for pure percentage CSS standard rendering
  const safeXDivisor = 100 - clipLeft - clipRight;
  const safeYDivisor = 100 - clipTop - clipBottom;
  
  const scaleXMultiplier = safeXDivisor > 0 ? 100 / safeXDivisor : 1;
  const scaleYMultiplier = safeYDivisor > 0 ? 100 / safeYDivisor : 1;

  const innerWidthPct = 100 * scaleXMultiplier;
  const innerHeightPct = 100 * scaleYMultiplier;
  const innerLeftPct = -clipLeft * scaleXMultiplier;
  const innerTopPct = -clipTop * scaleYMultiplier;

  const handleSave = async () => {
    setIsExporting(true);
    try {
      const cardEl = document.getElementById('pregnancy-preview-card');
      if (!cardEl) {
        throw new Error('Chyba: Náhledová karta nebyla nalezena.');
      }

      // Render the card using html2canvas
      const canvas = await html2canvas(cardEl, {
        useCORS: true,
        allowTaint: false,
        scale: 4, // Super crisp high resolution for prints
        backgroundColor: '#FFFFFF',
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
      });

      if (!blob) {
        throw new Error('Chyba při konverzi do souboru.');
      }

      // Direct upload to Cloudinary preset
      const CLOUDINARY_CLOUD_NAME = 'dvzuwzrpm';
      const CLOUDINARY_UPLOAD_PRESET = 'magnetic_preset';

      const formData = new FormData();
      formData.append('file', blob, `keepsake-design-${Date.now()}.jpg`);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Chyba nahrávání na Cloudinary.');
      }

      const secure_url = data.secure_url;

      onConfirm({
        t1: text1,
        t2: text2,
        font,
        color,
        photoScale,
        photoRotate: String(photoRotate),
        photoX,
        photoY,
        photoFit,
        clipLeft: String(clipLeft),
        clipRight: String(clipRight),
        clipTop: String(clipTop),
        clipBottom: String(clipBottom),
        clipLeftRight: String(Math.round((clipLeft + clipRight) / 2)),
        clipTopBottom: String(Math.round((clipTop + clipBottom) / 2)),
        textScale: String(textScale),
        textX: String(textX),
        textY: String(textY),
        orientation,
        designedImageUrl: secure_url, // URL of the uploaded, beautifully structured design!
      });
    } catch (err: any) {
      console.error('Keepsake export failed, using text fallback:', err);
      alert(`Nepodařilo se nahrát finální obrázek do cloudu (${err.message}). Uložíme pouze texty s ořezem...`);
      // Fallback
      onConfirm({
        t1: text1,
        t2: text2,
        font,
        color,
        photoScale,
        photoRotate: String(photoRotate),
        photoX,
        photoY,
        photoFit,
        clipLeft: String(clipLeft),
        clipRight: String(clipRight),
        clipTop: String(clipTop),
        clipBottom: String(clipBottom),
        clipLeftRight: String(Math.round((clipLeft + clipRight) / 2)),
        clipTopBottom: String(Math.round((clipTop + clipBottom) / 2)),
        textScale: String(textScale),
        textX: String(textX),
        textY: String(textY),
        orientation,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Drag Handlers
  const handlePhotoDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setActiveDrag('photo');
    setDragStart({
      x: clientX,
      y: clientY,
      photoX: parseFloat(photoX || '0'),
      photoY: parseFloat(photoY || '0'),
      initialAngle: 0
    });
  };

  const handleTextDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setActiveDrag('text');
    setDragStart({
      x: clientX,
      y: clientY,
      photoX: textX,
      photoY: textY,
      initialAngle: 0
    });
  };

  const handleRotationStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const photoEl = document.getElementById('ultrasound-photo-container');
    if (!photoEl) return;
    const rect = photoEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    setActiveDrag('rotate');
    setDragStart({
      x: clientX,
      y: clientY,
      photoX: cx,
      photoY: cy,
      initialAngle: photoRotate
    });
  };

  const handleCropStart = (e: React.MouseEvent | React.TouchEvent, side: 'top' | 'bottom' | 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    let startVal = 0;
    if (side === 'left') startVal = clipLeft;
    else if (side === 'right') startVal = clipRight;
    else if (side === 'top') startVal = clipTop;
    else if (side === 'bottom') startVal = clipBottom;

    setActiveDrag(`crop-${side}`);
    setDragStart({
      x: clientX,
      y: clientY,
      photoX: startVal,
      photoY: 0,
      initialAngle: 0
    });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (activeDrag === 'none') return;
    
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;

    if (activeDrag === 'photo') {
      const multiplier = 0.35 / (parseFloat(photoScale || '100') / 100);
      const nextX = dragStart.photoX + dx * multiplier;
      const nextY = dragStart.photoY + dy * multiplier;
      setPhotoX(String(parseFloat(nextX.toFixed(1))));
      setPhotoY(String(parseFloat(nextY.toFixed(1))));
    } else if (activeDrag === 'text') {
      const nextX = dragStart.photoX + dx;
      const nextY = dragStart.photoY + dy;
      setTextX(Math.round(nextX));
      setTextY(Math.round(nextY));
    } else if (activeDrag === 'rotate') {
      const cx = dragStart.photoX; // Center of photo viewport
      const cy = dragStart.photoY;
      const angleRad = Math.atan2(clientY - cy, clientX - cx);
      let angleDeg = (angleRad * 180) / Math.PI + 90; // Top coordinates = 0°
      if (angleDeg < 0) angleDeg += 360;

      // Smart snapping to nearest 45 degree steps if alignment is within 5 degrees
      for (let snap = 0; snap <= 360; snap += 45) {
        if (Math.abs(angleDeg - snap) < 5) {
          angleDeg = snap;
          break;
        }
      }
      setPhotoRotate(Math.round(angleDeg % 360));
    } else if (activeDrag.startsWith('crop-')) {
      const side = activeDrag.split('-')[1];
      const scaleMultiplier = 0.25; // Sensible crop adjusting speed
      if (side === 'left') {
        const nextVal = Math.max(0, Math.min(45, dragStart.photoX + dx * scaleMultiplier));
        setClipLeft(Math.round(nextVal));
      } else if (side === 'right') {
        const nextVal = Math.max(0, Math.min(45, dragStart.photoX - dx * scaleMultiplier));
        setClipRight(Math.round(nextVal));
      } else if (side === 'top') {
        const nextVal = Math.max(0, Math.min(45, dragStart.photoX + dy * scaleMultiplier));
        setClipTop(Math.round(nextVal));
      } else if (side === 'bottom') {
        const nextVal = Math.max(0, Math.min(45, dragStart.photoX - dy * scaleMultiplier));
        setClipBottom(Math.round(nextVal));
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeDrag === 'none') return;
    e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeDrag === 'none' || e.touches.length !== 1) return;
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseUp = () => {
    setActiveDrag('none');
  };

  // Precise base sizing multipliers to completely eliminate pixel density conflicts
  const getBaseFontSize = (part: 't1' | 't2') => {
    if (part === 't1') {
      switch (font) {
        case 'Great Vibes': return 30;
        case 'Pinyon Script': return 26;
        case 'Dancing Script': return 25;
        case 'Alex Brush': return 32;
        case 'Caveat': return 28;
        case 'Playfair Display': return 20;
        case 'Cinzel': return 17;
        case 'Montserrat': return 22;
        default: return 26;
      }
    } else {
      switch (font) {
        case 'Great Vibes': return 16;
        case 'Pinyon Script': return 15;
        case 'Dancing Script': return 15;
        case 'Alex Brush': return 16;
        case 'Caveat': return 15;
        case 'Playfair Display': return 13;
        case 'Cinzel': return 11;
        case 'Montserrat': return 15;
        default: return 14;
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh] lg:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex flex-col">
            <h3 className="font-black text-gray-950 uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-pink animate-pulse"></span>
              Návrh a editor oznámení {sizeLabel && <span className="text-brand-purple">({sizeLabel})</span>}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Klikněte a tahejte fotografii nebo text. Ořezové okraje a otočné táhlo flexibilně lícují s fialovým rámečkem!
            </p>
          </div>
          <button 
            type="button"
            onClick={onCancel} 
            className="p-2 hover:bg-gray-50 rounded-full transition-all group cursor-pointer"
            aria-label="Zavřít editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
            
            {/* LEFT COLUMN: Live Card Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm lg:sticky lg:top-4 z-10">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Živý náhled magnetu ({sizeLabel || '10x15 cm'})
            </span>

            {/* Simulated magnetic card with correct dynamic portrait/landscape ratio */}
            <div 
              id="pregnancy-preview-card"
              className={`w-full max-w-[280px] sm:max-w-[315px] bg-white border border-gray-200 shadow-lg relative flex overflow-hidden select-none rounded-none transition-all ${
                orientation === 'portrait' ? 'flex-col justify-between p-4' : 'flex-row items-center p-3'
              }`}
              style={{ 
                aspectRatio: orientation === 'portrait' ? (aspect || 10/15) : (1 / (aspect || 10/15)),
                border: '1px solid #e5e7eb'
              }}
            >
              
              {/* Photo Area Container with overflow-visible to support handles outside the edges */}
              <div 
                className={`relative overflow-visible bg-white rounded-none border border-transparent ${
                  orientation === 'portrait' ? 'w-full flex-grow min-h-0 mb-3' : 'h-full flex-grow min-w-0 mr-3'
                }`}
              >
                
                {/* Visual crop border (Fialový ořezávací rámeček), moving dynamically with crop values */}
                <div 
                  data-html2canvas-ignore
                  className="absolute border-2 border-brand-purple z-20 pointer-events-none shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                  style={{
                    left: `${clipLeft}%`,
                    right: `${clipRight}%`,
                    top: `${clipTop}%`,
                    bottom: `${clipBottom}%`
                  }}
                />
 
                {/* PowerPoint-style circular rotation handle, centered dynamically above the active crop box */}
                <div 
                  data-html2canvas-ignore
                  className="absolute z-30 cursor-pointer select-none flex flex-col items-center"
                  style={{
                    top: `calc(${clipTop}% - 34px)`,
                    left: `calc(${clipLeft}% + (100% - ${clipRight}% - ${clipLeft}%) / 2)`,
                    transform: 'translateX(-50%)'
                  }}
                  onMouseDown={handleRotationStart}
                  onTouchStart={handleRotationStart}
                  title="Otočit fotografii (táhnutím)"
                >
                  <div className="w-5 h-5 rounded-full bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center hover:bg-brand-purple hover:text-white hover:scale-110 active:scale-95 transition-all text-[11px] font-bold">
                    🔄
                  </div>
                  <div className="w-0.5 h-3 bg-brand-purple"></div>
                </div>
 
                {/* Left crop handle - aligned with the active crop border */}
                <div 
                  data-html2canvas-ignore
                  className="absolute w-2 hover:w-3 bg-brand-purple rounded-full cursor-ew-resize z-30 flex items-center justify-center"
                  style={{
                    left: `calc(${clipLeft}% - 4px)`,
                    top: `calc(${clipTop}% + (100% - ${clipBottom}% - ${clipTop}%) / 2)`,
                    height: '16px',
                    transform: 'translateY(-50%)'
                  }}
                  onMouseDown={(e) => handleCropStart(e, 'left')}
                  onTouchStart={(e) => handleCropStart(e, 'left')}
                  title="Oříznout zleva"
                />
 
                {/* Right crop handle - aligned with the active crop border */}
                <div 
                  data-html2canvas-ignore
                  className="absolute w-2 hover:w-3 bg-brand-purple rounded-full cursor-ew-resize z-30 flex items-center justify-center"
                  style={{
                    right: `calc(${clipRight}% - 4px)`,
                    top: `calc(${clipTop}% + (100% - ${clipBottom}% - ${clipTop}%) / 2)`,
                    height: '16px',
                    transform: 'translateY(-50%)'
                  }}
                  onMouseDown={(e) => handleCropStart(e, 'right')}
                  onTouchStart={(e) => handleCropStart(e, 'right')}
                  title="Oříznout zprava"
                />
 
                {/* Top crop handle - aligned with the active crop border */}
                <div 
                  data-html2canvas-ignore
                  className="absolute h-2 hover:h-3 bg-brand-purple rounded-full cursor-ns-resize z-30 flex items-center justify-center"
                  style={{
                    top: `calc(${clipTop}% - 4px)`,
                    left: `calc(${clipLeft}% + (100% - ${clipRight}% - ${clipLeft}%) / 2)`,
                    width: '16px',
                    transform: 'translateX(-50%)'
                  }}
                  onMouseDown={(e) => handleCropStart(e, 'top')}
                  onTouchStart={(e) => handleCropStart(e, 'top')}
                  title="Oříznout shora"
                />
 
                {/* Bottom crop handle - aligned with the active crop border */}
                <div 
                  data-html2canvas-ignore
                  className="absolute h-2 hover:h-3 bg-brand-purple rounded-full cursor-ns-resize z-30 flex items-center justify-center"
                  style={{
                    bottom: `calc(${clipBottom}% - 4px)`,
                    left: `calc(${clipLeft}% + (100% - ${clipRight}% - ${clipLeft}%) / 2)`,
                    width: '16px',
                    transform: 'translateX(-50%)'
                  }}
                  onMouseDown={(e) => handleCropStart(e, 'bottom')}
                  onTouchStart={(e) => handleCropStart(e, 'bottom')}
                  title="Oříznout zdola"
                />
 
                {/* Interactive Drag Overlay: handles all dragging of the photo */}
                <div 
                  data-html2canvas-ignore
                  className="absolute inset-0 z-10 cursor-move bg-transparent"
                  onMouseDown={handlePhotoDragStart}
                  onTouchStart={handlePhotoDragStart}
                  title="Chytit a táhnout pro posun fotky uvnitř rámečku"
                />
 
                {/* Dimmed background layer showing parts which are cropped out */}
                <img 
                  data-html2canvas-ignore
                  src={image} 
                  crossOrigin="anonymous"
                  alt="" 
                  className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-20 filter brightness-90 object-contain"
                  style={{
                    transform: `scale(${parseFloat(photoScale) / 100}) translate(${photoX}%, ${photoY}%) rotate(${photoRotate}deg)`,
                    transformOrigin: 'center center',
                    transition: activeDrag === 'photo' ? 'none' : 'transform 0.05s ease-out'
                  }}
                />
 
                {/* Fully lit foreground layer clipped perfectly inside the container relative to its static frame coords */}
                <div 
                  id="ultrasound-photo-container"
                  className="absolute overflow-hidden pointer-events-none select-none rounded-none"
                  style={{
                    left: `${clipLeft}%`,
                    right: `${clipRight}%`,
                    top: `${clipTop}%`,
                    bottom: `${clipBottom}%`
                  }}
                >
                  <div
                    className="absolute pointer-events-none select-none"
                    style={{
                      left: `${innerLeftPct}%`,
                      top: `${innerTopPct}%`,
                      width: `${innerWidthPct}%`,
                      height: `${innerHeightPct}%`
                    }}
                  >
                    <img 
                      src={image} 
                      crossOrigin="anonymous"
                      alt="Ultrazvuk" 
                      className="absolute inset-0 w-full h-full pointer-events-none select-none object-contain"
                      style={{
                        transform: `scale(${parseFloat(photoScale) / 100}) translate(${photoX}%, ${photoY}%) rotate(${photoRotate}deg)`,
                        transformOrigin: 'center center',
                        transition: activeDrag === 'photo' ? 'none' : 'transform 0.05s ease-out'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Draggable text area situated below / right side of photo - elegant violet hover border, no speech bubble */}
              <div 
                className={`flex flex-col items-center justify-center text-center cursor-move p-2 border border-dashed border-transparent hover:border-brand-purple hover:bg-brand-purple/[0.03] rounded-xl group transition-all select-none relative shrink-0 ${
                  orientation === 'portrait' ? 'w-full py-2' : 'w-[35%] h-full py-1 px-1 justify-center'
                }`}
                style={{
                  transform: `translate(${textX}px, ${textY}px)`,
                  fontFamily: currentFontObj.fontStyle,
                  color: color,
                  userSelect: 'none',
                  transition: activeDrag === 'text' ? 'none' : 'transform 0.1s ease-out'
                }}
                onMouseDown={handleTextDragStart}
                onTouchStart={handleTextDragStart}
                title="Chytit a přetáhnout text"
              >
                <div 
                  style={{
                    fontSize: `${getBaseFontSize('t1') * (textScale / 100)}px`
                  }}
                  className="font-medium tracking-tight break-words px-1 leading-tight transition-all"
                >
                  {text1 || 'Budeme tři...'}
                </div>
                <div 
                  style={{
                    fontSize: `${getBaseFontSize('t2') * (textScale / 100)}px`
                  }}
                  className="break-words mt-1 opacity-90 leading-tight transition-all"
                >
                  {text2 || 'podzim 2026'}
                </div>
              </div>

            </div>

            <p className="mt-4 text-[10px] font-medium text-gray-400 text-center leading-normal max-w-xs">
              Materiál: Ohebná magnetická fólie s fotopapírem, ručně střižená.
            </p>
          </div>

          {/* RIGHT COLUMN: Settings Form Grid */}
          <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* COLUMN 1: Layout, Text & Font Selectors */}
            <div className="space-y-5">
              
              {/* 0. ORIENTATION SWITCH */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                  Formát oznámení
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => changeOrientation('portrait')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      orientation === 'portrait'
                        ? 'border-brand-purple bg-brand-purple/5 text-brand-purple font-black'
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    ↕ Na výšku
                  </button>
                  <button
                    type="button"
                    onClick={() => changeOrientation('landscape')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      orientation === 'landscape'
                        ? 'border-brand-purple bg-brand-purple/5 text-brand-purple font-black'
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                    title="Oznámení na šířku (přizpůsobeno ultrazvuku o šířce 64%)"
                  >
                    ↔ Na šířku (foto širší)
                  </button>
                </div>
              </div>

              {/* 1. TEXT INPUTS */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                  1. Texty na magnetce
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Hlavní řádek</label>
                    <input 
                      type="text"
                      value={text1}
                      onChange={(e) => setText1(e.target.value)}
                      placeholder="Budeme tři..."
                      className="w-full py-2.5 px-4 bg-gray-50/50 rounded-xl border-2 border-gray-100 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple focus:bg-white outline-none placeholder-gray-400 text-sm transition-all text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Doplňující řádek (datum / měsíc)</label>
                    <input 
                      type="text"
                      value={text2}
                      onChange={(e) => setText2(e.target.value)}
                      placeholder="podzim 2026"
                      className="w-full py-2.5 px-4 bg-gray-50/50 rounded-xl border-2 border-gray-100 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple focus:bg-white outline-none placeholder-gray-400 text-sm transition-all text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* 3. FONTS & TEXT WIDTH */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                  3. Výběr ozdobného písma a velikosti
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFont(f.id)}
                      className={`p-2.5 rounded-xl border-2 transition-all flex flex-row items-center gap-4 cursor-pointer text-left ${
                        font === f.id
                          ? 'bg-brand-purple border-brand-purple text-white shadow-md font-black'
                          : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <span 
                        className={`${f.className} h-14 w-16 flex items-center justify-center text-center leading-none overflow-visible select-none shrink-0 border-r ${font === f.id ? 'border-white/10' : 'border-gray-100'}`}
                      >
                        A
                      </span>
                      <span className={`text-xs font-bold leading-tight ${font === f.id ? 'text-white' : 'text-gray-700'}`}>
                        {f.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Text scale slider & +- controls located directly below the header caption layout, compact and clean */}
                <div className="pt-3 flex flex-col gap-2 border-t border-gray-100 mt-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-500 block">Velikost textu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTextScale(prev => Math.max(50, prev - 5))}
                      className="w-10 h-8 rounded-xl bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center font-extrabold text-base text-gray-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                      title="Zmenšit text"
                    >
                      -
                    </button>
                    <span className="text-[11px] bg-gray-50 border border-gray-200 font-extrabold px-3 py-1.5 rounded-lg text-gray-700 min-w-[60px] text-center">
                      {textScale} %
                    </span>
                    <button
                      type="button"
                      onClick={() => setTextScale(prev => Math.min(220, prev + 5))}
                      className="w-10 h-8 rounded-xl bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center font-extrabold text-base text-gray-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                      title="Zvětšit text"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 2: Photo manipulation and Color scheme */}
            <div className="space-y-5">
              
              {/* 2. POSITION & CROP (Ořez a poloha fotky) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                  2. Poloha, ořez a otočení fotografie
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                  
                  {/* Způsob přizpůsobení fotky */}
                  <div className="pb-1 border-b border-gray-150/50">
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">
                      Způsob přizpůsobení fotky uvnitř rámečku
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFit('contain');
                          setPhotoScale('100');
                          setPhotoX('0');
                          setPhotoY('0');
                        }}
                        className={`py-2 px-3 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          photoFit === 'contain'
                            ? 'border-brand-purple bg-brand-purple/5 text-brand-purple'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                        title="Zobrazit kompletní nezkrácený snímek s postranními černými pruhy"
                      >
                        🔍 Celá fotka
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFit('cover');
                          setPhotoScale('145');
                        }}
                        className={`py-2 px-3 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          photoFit === 'cover'
                            ? 'border-brand-purple bg-brand-purple/5 text-brand-purple'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                        title="Roztáhnout fotku přes celý rámeček (může oříznout okraje)"
                      >
                        📺 Vyplnit rámeček
                      </button>
                    </div>
                  </div>

                  {/* Scale range with +- buttons on the right */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-gray-500 mb-1">
                      <span>MĚŘÍTKO (PŘIBLÍŽENÍ FOTKY)</span>
                      <span className="text-brand-purple font-extrabold">{photoScale} %</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range"
                        min="10"
                        max="400"
                        step="1"
                        value={photoScale}
                        onChange={(e) => setPhotoScale(e.target.value)}
                        className="flex-grow accent-brand-purple bg-gray-200 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPhotoScale(prev => String(Math.max(10, parseFloat(prev) - 5)))}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center font-extrabold text-sm text-gray-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                          title="Zmenšit"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoScale(prev => String(Math.min(400, parseFloat(prev) + 5)))}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center font-extrabold text-sm text-gray-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                          title="Zvětšit"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Photo rotation control */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Otočení fotografie</label>
                      <button
                        type="button"
                        onClick={() => setPhotoRotate((prev) => (prev + 90) % 360)}
                        className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-gray-700 active:scale-95 cursor-pointer shadow-sm"
                      >
                        🔄 Otočit o 90°
                      </button>
                    </div>
                    <div className="flex items-end flex-col justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoX('0');
                          setPhotoY('0');
                          setPhotoScale('100');
                          setPhotoRotate(0);
                          setClipLeft(0);
                          setClipRight(0);
                          setClipTop(0);
                          setClipBottom(0);
                          setTextX(0);
                          setTextY(0);
                        }}
                        className="w-full py-2.5 px-4 border border-dashed border-gray-300 hover:bg-gray-100 rounded-xl font-bold text-[11px] uppercase tracking-wider text-gray-500 transition-all cursor-pointer"
                      >
                        Resetovat pozice fotky i textu
                      </button>
                    </div>
                  </div>

                  {/* Adjusting/cropping margins slider (Ořez stran) */}
                  <div className="pt-2 border-t border-gray-200/60 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-500">Úprava a ořez stran fotky</span>
                      <span className="text-[9px] text-gray-400 font-extrabold">Každá strana samostatně</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                          <span>Ořez zleva</span>
                          <span className="text-brand-purple font-black">{clipLeft}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="45"
                          step="1"
                          value={clipLeft}
                          onChange={(e) => setClipLeft(parseFloat(e.target.value))}
                          className="w-full accent-brand-purple bg-gray-200 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                          <span>Ořez zprava</span>
                          <span className="text-brand-purple font-black">{clipRight}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="45"
                          step="1"
                          value={clipRight}
                          onChange={(e) => setClipRight(parseFloat(e.target.value))}
                          className="w-full accent-brand-purple bg-gray-200 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                          <span>Ořez shora</span>
                          <span className="text-brand-purple font-black">{clipTop}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="45"
                          step="1"
                          value={clipTop}
                          onChange={(e) => setClipTop(parseFloat(e.target.value))}
                          className="w-full accent-brand-purple bg-gray-200 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                          <span>Ořez zdola</span>
                          <span className="text-brand-purple font-black">{clipBottom}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="45"
                          step="1"
                          value={clipBottom}
                          onChange={(e) => setClipBottom(parseFloat(e.target.value))}
                          className="w-full accent-brand-purple bg-gray-200 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-400 font-bold uppercase leading-normal">
                    💡 Tip: Polohu a ořez fotky i textu můžete plně upravit chycením a táhnutím přímo v horním náhledu!
                  </div>
                </div>
              </div>

              {/* 4. COLORS */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                  4. Barva písma
                </h4>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`flex items-center gap-2 py-2 px-3.5 rounded-full border-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        color === c.id
                          ? 'border-brand-purple bg-brand-purple/5 ring-2 ring-brand-purple/10 font-extrabold'
                          : 'border-gray-100 bg-white text-gray-600'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border border-black/10 ${c.colorClass}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 rounded-xl border-2 border-gray-100 font-bold text-gray-400 hover:bg-gray-50 transition-all text-xs uppercase tracking-widest cursor-pointer"
          >
            Zpět
          </button>
          
          <button
            type="button"
            disabled={isExporting}
            onClick={handleSave}
            className={`px-10 py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-purple/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${!isExporting ? 'hover:scale-[1.03] active:scale-95' : ''}`}
          >
            {isExporting ? 'Generuji a ukládám obrázek...' : 'Uložit návrh oznámení'}
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import html2canvas from 'html2canvas';

interface PhotoEditorModalProps {
  image: string;
  aspect: number;
  sizeLabel?: string;
  onConfirm: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

const AVAILABLE_FONTS = [
  { id: 'Great Vibes', label: 'Něžné písmo', fontStyle: "'Great Vibes', cursive", className: 'font-["Great_Vibes"]' },
  { id: 'Pinyon Script', label: 'Kaligrafické', fontStyle: "'Pinyon Script', cursive", className: 'font-["Pinyon_Script"]' },
  { id: 'Dancing Script', label: 'Psací', fontStyle: "'Dancing Script', cursive", className: 'font-["Dancing_Script"] font-bold' },
  { id: 'Alex Brush', label: 'Klasické ozdobné', fontStyle: "'Alex Brush', cursive", className: 'font-["Alex_Brush"]' },
  { id: 'Caveat', label: 'Ručně psané', fontStyle: "'Caveat', cursive", className: 'font-["Caveat"] font-bold' },
  { id: 'Playfair Display', label: 'Luxusní patkové', fontStyle: "'Playfair Display', Georgia, serif", className: 'font-["Playfair_Display"] italic' },
  { id: 'Cinzel', label: 'Tradiční římské', fontStyle: "'Cinzel', serif", className: 'font-["Cinzel"] font-bold' },
  { id: 'Montserrat', label: 'Čisté moderní', fontStyle: "'Montserrat', sans-serif", className: 'font-["Montserrat"] font-extrabold uppercase' }
];

const AVAILABLE_COLORS = [
  { id: '#191919', label: 'Černá', colorClass: 'bg-neutral-900 border-neutral-800' },
  { id: '#FFFFFF', label: 'Bílá', colorClass: 'bg-white border-neutral-300' },
  { id: '#2B82C9', label: 'Modrá', colorClass: 'bg-[#2B82C9] border-[#1e6ca9]' },
  { id: '#D84B8E', label: 'Růžová', colorClass: 'bg-[#D84B8E] border-[#b83573]' },
  { id: '#E11D48', label: 'Rose Gold', colorClass: 'bg-rose-500 border-rose-400' },
  { id: '#C084FC', label: 'Lilková', colorClass: 'bg-purple-400 border-purple-300' },
  { id: '#1E3A8A', label: 'Tmavě modrá', colorClass: 'bg-blue-900 border-blue-800' },
  { id: '#4B5563', label: 'Šedá', colorClass: 'bg-gray-600 border-gray-500' },
  { id: '#78350F', label: 'Hnědá', colorClass: 'bg-amber-900 border-amber-800' },
  { id: '#D4AF37', label: 'Zlatá', colorClass: 'bg-[#D4AF37] border-amber-600' }
];

const FRAME_COLORS = [
  { id: '#FFFFFF', label: 'Sněhově bílá', colorClass: 'bg-white border-gray-300' },
  { id: '#FCFAF6', label: 'Smetanová', colorClass: 'bg-[#FCFAF6] border-amber-100' },
  { id: '#F5F5F0', label: 'Vintage slonová', colorClass: 'bg-[#F5F5F0] border-gray-300' },
  { id: '#FFE4E6', label: 'Pudrově růžová', colorClass: 'bg-[#FFE4E6] border-rose-200' },
  { id: '#E0F2FE', label: 'Ledová modrá', colorClass: 'bg-[#E0F2FE] border-sky-200' },
  { id: '#F0FDF4', label: 'Mátově zelená', colorClass: 'bg-[#F0FDF4] border-emerald-200' },
  { id: '#18181B', label: 'Grafitová', colorClass: 'bg-zinc-900 border-black' }
];

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  image,
  aspect,
  sizeLabel,
  onConfirm,
  onCancel
}) => {
  // Tabs: 'adjust' (Poloha a ořez), 'text' (Nápis a styl), 'frame' (Rámeček)
  const [activeTab, setActiveTab] = useState<'adjust' | 'text' | 'frame'>('adjust');

  // Core modification states
  const [photoScale, setPhotoScale] = useState<number>(100);
  const [photoRotate, setPhotoRotate] = useState<number>(0);
  const [photoX, setPhotoX] = useState<number>(0);
  const [photoY, setPhotoY] = useState<number>(0);
  const [imgNaturalAspect, setImgNaturalAspect] = useState<number | null>(null);

  // Text capabilities
  const [hasText, setHasText] = useState<boolean>(false);
  const [textLine1, setTextLine1] = useState<string>('Krásná vzpomínka');
  const [textLine2, setTextLine2] = useState<string>('');
  const [font, setFont] = useState<string>('Great Vibes');
  const [textColor, setTextColor] = useState<string>('#191919');
  const [textSize, setTextSize] = useState<number>(24);
  const [textY, setTextY] = useState<number>(0); // Vertical adjustment

  // Polaroid frame capabilities
  const [hasPolaroid, setHasPolaroid] = useState<boolean>(false);
  const [frameColor, setFrameColor] = useState<string>('#FFFFFF');

  // Dragging support
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; photoX: number; photoY: number }>({ x: 0, y: 0, photoX: 0, photoY: 0 });
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Selected object properties
  const selectedFontObj = AVAILABLE_FONTS.find((f) => f.id === font) || AVAILABLE_FONTS[0];

  // Drag/Pointer event registration
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag when using pointer inside photo frame area
    const target = e.target as HTMLElement;
    if (target.closest('.photo-drag-viewport')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        photoX: photoX,
        photoY: photoY
      });
      target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const scaleFactor = photoScale / 100;
    // Normalized move mapping client drag offset to styling percentages
    const nextX = dragStart.photoX + (dx / 3.5) / scaleFactor;
    const nextY = dragStart.photoY + (dy / 3.5) / scaleFactor;

    setPhotoX(Math.max(-150, Math.min(150, nextX)));
    setPhotoY(Math.max(-150, Math.min(150, nextY)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      const target = e.target as HTMLElement;
      try {
        target.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handle90Rotate = () => {
    setPhotoRotate((r) => (r + 90) % 360);
  };

  const handleConfirmRender = async () => {
    setIsExporting(true);
    try {
      const renderEl = document.getElementById('magnetic-render-card');
      if (!renderEl) {
        throw new Error('Nepodařilo se najít element pro vykreslení náhledu.');
      }

      // Briefly disable visible border borders if needed, but the card shouldn't have active handles visible
      const canvas = await html2canvas(renderEl, {
        useCORS: true,
        allowTaint: false,
        scale: 4, // Super high detailed crisp rendering for prints
        backgroundColor: '#FCFAF6',
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        logging: false
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
      });

      if (!blob) {
        throw new Error('Chyba při renderu plátna.');
      }

      onConfirm(blob);
    } catch (error: any) {
      console.error(error);
      alert(`Došlo k chybě při přípravě designu: ${error.message || error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-neutral-950/95 backdrop-blur-xl transition-all">
      <div className="bg-white w-full max-w-5xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full max-h-[96vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-neutral-900 uppercase tracking-widest text-[13px] sm:text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-pink animate-pulse"></span>
              Kreativní editor vzpomínek {sizeLabel && <span className="text-brand-purple">[{sizeLabel}]</span>}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ořezávejte, přidávejte texty a barevné rámečky</p>
          </div>
          <button 
            onClick={onCancel} 
            className="p-2 sm:p-2.5 hover:bg-neutral-100 rounded-full transition-all group cursor-pointer"
            aria-label="Cancel editing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body with 2 columns layout on desktop */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* L: Live Design Preview Area */}
          <div className="flex-1 bg-neutral-900/5 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-y-auto select-none">
            
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-3 text-center">
              Tažením po fotce ji posunete • Posun nápisu nastavíte v záložkách
            </div>

            {/* Design Stage framing the magnet mockup */}
            <div className="relative max-w-full flex items-center justify-center p-2">
              
              {/* This element will be screenshotted by html2canvas */}
              <div
                id="magnetic-render-card"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative overflow-hidden transition-shadow photo-drag-viewport cursor-grab active:cursor-grabbing`}
                style={{
                  width: '320px',
                  height: `${Math.round(320 / aspect)}px`,
                  backgroundColor: frameColor,
                  borderRadius: hasPolaroid ? '8px' : '0px',
                  padding: hasPolaroid 
                    ? '4% 4% 18% 4%' // Polaroid Frame Borders: Top/Left/Right are thin, Bottom is wide
                    : '0px',
                  boxShadow: 'none',
                  border: hasPolaroid && frameColor === '#FFFFFF' ? '1px solid rgba(0,0,0,0.06)' : 'none'
                }}
              >
                
                {/* Photo viewport within the Polaroid borders or taking 100% */}
                <div className="w-full h-full relative overflow-hidden pointer-events-none rounded-[2px]" style={{ zIndex: 1 }}>
                  <img
                    src={image}
                    alt="Upravovaný motiv"
                    crossOrigin="anonymous"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      const natAspect = img.naturalWidth / img.naturalHeight;
                      setImgNaturalAspect(natAspect);
                    }}
                    className="absolute pointer-events-none select-none"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: imgNaturalAspect !== null ? (imgNaturalAspect > aspect ? 'auto' : '100%') : '100%',
                      height: imgNaturalAspect !== null ? (imgNaturalAspect > aspect ? '100%' : 'auto') : '100%',
                      transform: `translate(-50%, -50%) scale(${photoScale / 100}) translate(${photoX}%, ${photoY}%) rotate(${photoRotate}deg)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                    }}
                  />
                </div>

                {/* Text layout overlay */}
                {hasText && (
                  <div
                    className="absolute left-0 right-0 text-center pointer-events-none flex flex-col items-center justify-center px-3"
                    style={{
                      zIndex: 2,
                      // If it has a polaroid frame, position it dynamically on the generous bottom margin.
                      // If normal, let it float beautifully over the bottom/center
                      bottom: hasPolaroid ? '2.5%' : '8%',
                      transform: `translateY(${textY}px)`,
                      color: textColor,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: selectedFontObj.fontStyle,
                        fontSize: `${textSize}px`,
                        lineHeight: 1.1,
                        textShadow: !hasPolaroid && textColor.toLowerCase() === '#ffffff' 
                          ? '0 1px 3px rgba(0,0,0,0.5)' 
                          : 'none'
                      }}
                    >
                      {textLine1 || ' '}
                    </p>
                    {textLine2 && (
                      <p
                        className="mt-0.5"
                        style={{
                          fontFamily: selectedFontObj.fontStyle,
                          fontSize: `${textSize * 0.8}px`,
                          lineHeight: 1.1,
                          textShadow: !hasPolaroid && textColor.toLowerCase() === '#ffffff' 
                            ? '0 1px 3px rgba(0,0,0,0.5)' 
                            : 'none'
                        }}
                      >
                        {textLine2}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick helper controls directly below mockup */}
            <div className="flex gap-2.5 mt-4 z-10">
              <button
                type="button"
                onClick={handle90Rotate}
                className="bg-white/80 hover:bg-white text-neutral-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-sm border border-neutral-200 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Otočit o 90°
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoScale(100);
                  setPhotoX(0);
                  setPhotoY(0);
                  setPhotoRotate(0);
                }}
                className="bg-white/80 hover:bg-white text-neutral-500 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-sm border border-neutral-100 transition-all active:scale-95"
              >
                Resetovat polohu
              </button>
            </div>
          </div>

          {/* R: Rich Control Panels & Customizers */}
          <div className="w-full md:w-[420px] border-t md:border-t-0 md:border-l border-neutral-100 flex flex-col bg-white min-h-0">
            
            {/* Tabs Headers */}
            <div className="flex border-b border-gray-100 bg-neutral-50/50 p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'adjust'
                    ? 'bg-white text-brand-purple shadow-sm ring-1 ring-black/5'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
                }`}
              >
                📐 Velikost a ořez
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'text'
                    ? 'bg-white text-brand-purple shadow-sm ring-1 ring-black/5'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
                }`}
              >
                ✍️ Text a písmo
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('frame')}
                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'frame'
                    ? 'bg-white text-brand-purple shadow-sm ring-1 ring-black/5'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
                }`}
              >
                🖼️ Styl a barvy
              </button>
            </div>

            {/* Scrollable controls compartment */}
            <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-6">

              {/* TAB 1: ADJUSTMENTS & CROPPING */}
              {activeTab === 'adjust' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Photo Scale Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                      <span>PŘIBLÍŽENÍ FOTKY (ZOOM)</span>
                      <span className="text-brand-purple font-black">{photoScale}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setPhotoScale((s) => Math.max(50, s - 10))}
                        className="w-8 h-8 rounded-lg border bg-neutral-50 flex items-center justify-center font-bold text-sm text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                      >–</button>
                      <input
                        type="range"
                        min="50"
                        max="400"
                        value={photoScale}
                        onChange={(e) => setPhotoScale(Number(e.target.value))}
                        className="flex-grow accent-brand-purple h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <button 
                        type="button"
                        onClick={() => setPhotoScale((s) => Math.min(400, s + 10))}
                        className="w-8 h-8 rounded-lg border bg-neutral-50 flex items-center justify-center font-bold text-sm text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                      >+</button>
                    </div>
                  </div>

                  {/* Horizontal Fine Tuning */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                      <span>POSUN VLEVO / VPRAVO</span>
                      <span className="text-neutral-400 text-[10px]">{Math.round(photoX)}px</span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      value={photoX}
                      onChange={(e) => setPhotoX(Number(e.target.value))}
                      className="w-full accent-brand-purple h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Vertical Fine Tuning */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                      <span>POSUN NAHORU / DOLŮ</span>
                      <span className="text-neutral-400 text-[10px]">{Math.round(photoY)}px</span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      value={photoY}
                      onChange={(e) => setPhotoY(Number(e.target.value))}
                      className="w-full accent-brand-purple h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                      <span>ROTACE OBRÁZKU</span>
                      <span className="text-brand-purple font-black">{photoRotate}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={photoRotate}
                      onChange={(e) => setPhotoRotate(Number(e.target.value))}
                      className="w-full accent-brand-purple h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100">
                    <h5 className="text-[10px] uppercase font-black tracking-wider text-neutral-700 mb-1">💡 Tip k ovládání</h5>
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">
                      Na mobilních telefonech i stolních počítačích můžete prstem nebo myší jezdit přímo po obrázku a doladit tak jeho vycentrování super rychle a přirozeně!
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: TEXTING CAPABILITIES */}
              {activeTab === 'text' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Enable Text Switcher */}
                  <div className="flex justify-between items-center bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">Přidat vlastní nápis</span>
                      <span className="text-[10px] font-semibold text-gray-400">Přidá k fotce ozdobný nebo čistý text</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasText} 
                        onChange={(e) => setHasText(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-pink"></div>
                    </label>
                  </div>

                  {hasText && (
                    <>
                      {/* Text inputs */}
                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">
                          Text (1. řádek)
                        </label>
                        <input
                          type="text"
                          maxLength={32}
                          value={textLine1}
                          onChange={(e) => setTextLine1(e.target.value)}
                          placeholder="Např. Naše svatba"
                          className="w-full text-xs font-bold border-gray-200 rounded-xl shadow-sm focus:border-brand-purple focus:ring-brand-purple px-3.5 py-3 border"
                        />

                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mt-2">
                          Text (2. řádek - doplňkově)
                        </label>
                        <input
                          type="text"
                          maxLength={38}
                          value={textLine2}
                          onChange={(e) => setTextLine2(e.target.value)}
                          placeholder="Např. 14. září 2026"
                          className="w-full text-xs font-bold border-gray-200 rounded-xl shadow-sm focus:border-brand-purple focus:ring-brand-purple px-3.5 py-3 border"
                        />
                      </div>

                      {/* Font selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">
                          Výběr ozdobného písma
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {AVAILABLE_FONTS.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setFont(f.id)}
                              className={`px-3 py-2 text-[11px] rounded-lg text-left border flex flex-col justify-between transition-all ${
                                font === f.id
                                  ? 'border-brand-purple bg-brand-purple/5 text-brand-purple font-bold'
                                  : 'border-neutral-150 hover:bg-neutral-50 text-neutral-700'
                              }`}
                            >
                              <span className="text-[9px] text-neutral-400 font-bold block mb-0.5 uppercase tracking-wider">{f.label}</span>
                              <span style={{ fontFamily: f.fontStyle }} className="text-sm truncate">Style</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font size & alignment */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                          <span>VELIKOST PÍSMA</span>
                          <span className="text-brand-purple font-black">{textSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="44"
                          value={textSize}
                          onChange={(e) => setTextSize(Number(e.target.value))}
                          className="w-full accent-brand-purple h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Vertical position slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                          <span>UMÍSTĚNÍ (NA VÝŠKU)</span>
                          <span className="text-neutral-400 text-[10px]">{textY > 0 ? `+${textY}` : textY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={textY}
                          onChange={(e) => setTextY(Number(e.target.value))}
                          className="w-full accent-brand-purple h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Color Selector */}
                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">
                          Barva nápisu
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {AVAILABLE_COLORS.map((col) => (
                            <button
                              key={col.id}
                              type="button"
                              onClick={() => setTextColor(col.id)}
                              className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${col.colorClass} ${
                                textColor === col.id ? 'ring-2 ring-brand-purple scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                              }`}
                              title={col.label}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: FRAME STYLE & BG COLORS */}
              {activeTab === 'frame' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Polaroid Frame toggle */}
                  <div className="flex justify-between items-center bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">Styl retro pasparty (Polaroid)</span>
                      <span className="text-[10px] font-semibold text-gray-400">Přidá historický rámeček s širším spodkem</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasPolaroid} 
                        onChange={(e) => {
                          setHasPolaroid(e.target.checked);
                          // Auto trigger text toggle if they select polaroid
                          if (e.target.checked && !hasText) {
                            setHasText(true);
                          }
                        }} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-pink"></div>
                    </label>
                  </div>

                  {/* Frame Background Color */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      Barva pozadí podkladu (Rámečku)
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {FRAME_COLORS.map((fc) => (
                        <button
                          key={fc.id}
                          type="button"
                          onClick={() => {
                            setFrameColor(fc.id);
                            // Auto matching light/dark contrast text
                            if (fc.id === '#18181B') {
                              setTextColor('#FFFFFF');
                            } else if (textColor === '#FFFFFF') {
                              setTextColor('#191919');
                            }
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${fc.colorClass} ${
                            frameColor === fc.id ? 'ring-2 ring-brand-purple scale-110 shadow-lg' : 'hover:scale-105'
                          }`}
                          title={fc.label}
                        />
                      ))}
                    </div>
                  </div>



                  <div className="bg-brand-pink/5 rounded-xl p-3.5 border border-brand-pink/15">
                    <h5 className="text-[10px] uppercase font-black tracking-wider text-brand-pink mb-1">⭐ Skvělá kombinace</h5>
                    <p className="text-[10px] text-neutral-600 leading-relaxed font-semibold">
                      Zkuste zapnout <b className="text-brand-purple">Styl retro pasparty (Polaroid)</b> a podklad změnit na <b className="text-brand-purple">Smetanovou</b> či <b className="text-brand-purple">Vintage slonovou kost</b>. Magnetky pak působí neuvěřitelně luxusním, teplým rodinným dojmem!
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* Panel Actions / Confirming footer */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isExporting}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-250 text-neutral-500 hover:bg-neutral-100 font-extrabold uppercase text-[10px] tracking-wider transition-all disabled:opacity-50"
              >
                Zpět
              </button>
              
              <button
                type="button"
                onClick={handleConfirmRender}
                disabled={isExporting}
                className="flex-[2] py-3 px-4 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-extrabold uppercase text-[10px] tracking-[0.15em] rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Zpracovávám motiv...
                  </>
                ) : (
                  'Uložit a nahrát'
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

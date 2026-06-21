
import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';

export const ExitPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(() => {
    return localStorage.getItem('exit_popup_shown') === 'true';
  });

  const lastScrollY = useRef(0);

  useEffect(() => {
    if (hasDismissed) return;

    // --- DESKTOP: Sledování myši ---
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsVisible(true);
      }
    };

    // --- MOBILE: Sledování prudkého scrollu nahoru ---
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = lastScrollY.current - currentScrollY;

      // Pokud uživatel prudce scrolluje nahoru (více než 150px najednou)
      // Je to silný indikátor, že chce k adresnímu řádku nebo zavřít tab
      if (diff > 150 && currentScrollY > 200) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // --- ZÁLOŽNÍ ČASOVAČ (pro oba světy) ---
    // Pokud uživatel na webu stráví 30 sekund a neodešel, nabídneme mu slevu
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 35000);

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [hasDismissed]);

  const dismiss = () => {
    setIsVisible(false);
    setHasDismissed(true);
    localStorage.setItem('exit_popup_shown', 'true');
  };

  const copyCode = () => {
    navigator.clipboard.writeText('vitejte10');
    alert('Slevový kód vitejte10 byl zkopírován!');
    dismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Dekorativní prvky */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink to-brand-purple"></div>
        
        <button 
          onClick={dismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-auto drop-shadow-sm" />
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">
            Počkejte! <br /> <span className="text-brand-pink">Něco pro vás máme.</span>
          </h2>
          
          <p className="text-gray-600 mb-8 font-medium">
            Nenechte své vzpomínky jen v telefonu. <br />
            Získejte <span className="font-black text-gray-900 text-lg">slevu 10 %</span> na váš první nákup!
          </p>

          <div className="bg-gray-50 border-2 border-dashed border-brand-purple/30 rounded-2xl p-6 mb-8 relative group">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-0.5 text-xs font-black text-brand-purple uppercase tracking-wider border border-brand-purple/20 rounded-full">
              Váš slevový kód
            </span>
            <div className="text-3xl font-black tracking-widest text-brand-purple">vitejte10</div>
          </div>

          <button 
            onClick={copyCode}
            className="w-full bg-brand-pink hover:bg-brand-pink/90 text-white font-black py-4 rounded-xl text-lg uppercase tracking-widest shadow-lg shadow-brand-pink/20 transition-all transform active:scale-95"
          >
            Zkopírovat a nakoupit
          </button>
          
          <button 
            onClick={dismiss}
            className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
          >
            Děkuji, nechci slevu
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
  buttonStyle: {
    gradient: string;
    focusRing: string;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, buttonStyle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageClass = "w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity";

  const isVideo = (url: string) => {
    if (!url) return false;
    const path = url.split(/[?#]/)[0].toLowerCase();
    return path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mov') || path.endsWith('.m4v') || path.endsWith('.ogv');
  };

  useEffect(() => {
    if (videoRef.current && isVideo(product.imageUrl)) {
        // Programmatic muted setting is more reliable for autoplay in many browsers
        videoRef.current.muted = true;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.debug("Autoplay prevented on Card:", err);
            });
        }
    }
  }, [product.imageUrl]);

  return (
    <div className="group relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col w-full">
      <div className="w-full h-72 bg-gray-200 overflow-hidden relative">
        {isVideo(product.imageUrl) ? (
          <video 
            ref={videoRef}
            key={product.imageUrl}
            src={product.imageUrl} 
            className={imageClass} 
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
          />
        ) : (
          <img src={product.imageUrl} alt={product.name} className={imageClass} />
        )}
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">
          <Link to={`/produkty/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.shortDescription}</p>
        <p className="mt-4 text-xl font-bold text-gray-900">od {formatPrice(product.price)} Kč</p>
      </div>
      <div className='p-6 pt-0'>
        <Link 
            to={`/produkty/${product.id}`} 
            className={`text-center block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${buttonStyle.gradient} hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 ${buttonStyle.focusRing}`}
        >
            Vytvoř si magnety
        </Link>
      </div>
    </div>
  );
};


import React from 'react';
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
  const isCalendar = product.id === 'magnetic-calendar';
  const imageClass = isCalendar
    ? "w-full h-full object-center object-contain"
    : "w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity";

  return (
    // FIX: Added w-full to make the card fill its flex container.
    <div className="group relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col w-full">
      <div className="w-full h-72 bg-gray-200 overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className={imageClass} />
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">
          <Link to={`/produkty/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.shortDescription}</p>
        <p className="mt-4 text-xl font-bold text-gray-900">{formatPrice(product.price)} Kč</p>
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

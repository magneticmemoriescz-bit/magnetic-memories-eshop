
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem as CartItemType } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useCart();
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  return (
    <div
      className={`fixed inset-0 overflow-hidden z-50 transition-opacity ${isOpen ? 'ease-in-out duration-500' : 'ease-in-out duration-500 opacity-0 pointer-events-none'}`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
        <div className={`absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className={`transform transition ease-in-out duration-500 sm:duration-700 ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-screen max-w-md`}>
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                    <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-medium text-dark-gray" id="slide-over-title">Nákupní košík</h2>
                            <div className="ml-3 h-7 flex items-center">
                                <button type="button" className="-m-2 p-2 text-gray-400 hover:text-gray-500" onClick={onClose}>
                                    <span className="sr-only">Zavřít panel</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flow-root">
                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                    {state.items.length === 0 ? (
                                        <p className="text-center text-gray-500 py-10">Váš košík je prázdný.</p>
                                    ) : (
                                        state.items.map((item) => (
                                            <li key={item.id} className="py-6 flex">
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                    <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover object-center" />
                                                </div>
                                                <div className="ml-4 flex-1 flex flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-dark-gray">
                                                            <h3>{item.product.name}</h3>
                                                            <p className="ml-4">{item.price} Kč</p>
                                                        </div>
                                                        {item.variant && <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>}
                                                    </div>
                                                    <div className="flex-1 flex items-end justify-between text-sm">
                                                        <p className="text-gray-500">Množství: {item.quantity}</p>
                                                        <div className="flex">
                                                            <button onClick={() => handleRemoveItem(item.id)} type="button" className="font-medium text-brand-purple hover:opacity-80">
                                                                Odstranit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    {state.items.length > 0 && (
                        <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                            <div className="flex justify-between text-base font-medium text-dark-gray">
                                <p>Celkem</p>
                                <p>{totalPrice} Kč</p>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">Doprava a daně budou spočítány v pokladně.</p>
                            <div className="mt-6">
                                <Link 
                                  to="/pokladna"
                                  onClick={onClose}
                                  className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-pink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink"
                                >
                                    Pokladna
                                </Link>
                            </div>
                            <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                                <p>
                                    nebo <button type="button" className="text-brand-purple font-medium hover:opacity-80 focus:outline-none focus:underline" onClick={onClose}>Pokračovat v nákupu<span aria-hidden="true"> &rarr;</span></button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

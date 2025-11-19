import React from 'react';

export const FormInput = ({ name, label, error, value, onChange, ...props }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            id={name} 
            name={name} 
            {...props} 
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm placeholder-gray-500 ${error ? 'border-red-500 bg-red-50' : 'border-brand-purple/20 bg-brand-purple/10'}`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

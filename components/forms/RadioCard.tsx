
import React from 'react';

export const RadioCard = ({ name, value, checked, onChange, title, price }: any) => (
    <label className={`relative flex p-4 border rounded-lg cursor-pointer ${checked ? 'bg-brand-purple/10 border-brand-purple ring-2 ring-brand-purple' : 'border-gray-300'}`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
        <div className="flex-1 flex justify-between">
            <span className="font-medium text-dark-gray">{title}</span>
            <span className="text-gray-600">{price}</span>
        </div>
    </label>
);

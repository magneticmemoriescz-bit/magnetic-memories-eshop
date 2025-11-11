import React from 'react';

const logoUrl = 'https://i.imgur.com/vO65kYj.png';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <img src={logoUrl} alt="Magnetic Memories Logo" className="h-12 w-auto" />
        </div>
    );
};
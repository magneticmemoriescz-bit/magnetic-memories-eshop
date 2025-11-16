import React from 'react';

const logoUrl = 'https://i.imgur.com/gkmFoKx.png';

// The className prop will now directly control the img tag style for better flexibility.
export const Logo: React.FC<{ className?: string }> = ({ className = 'h-12 w-auto' }) => {
    return (
        <div className="flex items-center">
            <img src={logoUrl} alt="Magnetic Memories Logo" className={className} />
        </div>
    );
};

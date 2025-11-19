import React from 'react';

export const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center mb-12">{title}</h1>
            <div className="space-y-6 text-gray-700 leading-relaxed">
                {children}
            </div>
        </div>
    </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold text-dark-gray mt-10 mb-4 border-b pb-2">{children}</h2>;

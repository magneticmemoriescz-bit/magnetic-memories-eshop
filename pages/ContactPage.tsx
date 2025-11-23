
import React, { useState, useRef } from 'react';

const ContactPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        if (!formRef.current) {
            console.error("Form reference is not available.");
            setStatus('error');
            return;
        }

        // Using Gmail service (service_2pkoish) as requested
        window.emailjs.sendForm('service_2pkoish', 'template_ajmxwjd', formRef.current)
            .then(() => {
                setStatus('success');
            }, (error: any) => {
                console.error('FAILED to send contact form:', error);
                setErrorMessage(`Odeslání zprávy se nezdařilo: ${error.text || 'Zkuste to prosím znovu.'}`);
                setStatus('error');
            });
    };

    const inputStyles = "py-3 px-4 block w-full shadow-sm focus:ring-brand-purple focus:border-brand-purple border-brand-purple/20 bg-brand-purple/10 rounded-md placeholder-gray-500";
    
    return (
        <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="relative max-w-xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-dark-gray sm:text-4xl">Kontaktujte nás</h2>
                    <p className="mt-4 text-lg leading-6 text-gray-500">Máte dotaz nebo speciální přání? Neváhejte se na nás obrátit.</p>
                    <div className="mt-4">
                         <p className="text-base text-gray-500">
                            Napsat nám můžete také přímo na email: <br />
                            <a href="mailto:magnetic.memories@magnetify.cz" className="font-medium text-brand-purple hover:text-brand-pink transition-colors">
                                magnetic.memories@magnetify.cz
                            </a>
                        </p>
                    </div>
                </div>
                <div className="mt-12">
                    {status === 'success' ? (
                         <div className="text-center py-10 px-6 bg-green-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-2xl font-semibold text-dark-gray">Děkujeme!</h3>
                            <p className="mt-2 text-gray-600">Vaše zpráva byla odeslána. Ozveme se vám co nejdříve.</p>
                        </div>
                    ) : (
                        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Jméno</label>
                                <div className="mt-1"><input type="text" name="first_name" id="first_name" autoComplete="given-name" className={inputStyles} required /></div>
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Příjmení</label>
                                <div className="mt-1"><input type="text" name="last_name" id="last_name" autoComplete="family-name" className={inputStyles} required /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1"><input id="email" name="email" type="email" autoComplete="email" className={inputStyles} required /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Zpráva</label>
                                <div className="mt-1"><textarea id="message" name="message" rows={4} className={inputStyles} required></textarea></div>
                            </div>
                            <div className="sm:col-span-2">
                                {status === 'error' && <p className="text-red-600 text-sm text-center mb-4">{errorMessage}</p>}
                                <button type="submit" disabled={status === 'sending'} className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-pink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:opacity-50">
                                    {status === 'sending' ? 'Odesílám...' : 'Odeslat zprávu'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;

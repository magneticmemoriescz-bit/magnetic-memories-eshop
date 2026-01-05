
import React, { useState, useRef } from 'react';

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const ContactPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    // ID šablony "Contact Us Magnetic Memories"
    const CONTACT_TEMPLATE_ID = 'template_ajmxwjd';
    const SERVICE_ID = 'service_2pkoish'; // Gmail service

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        if (!formRef.current) {
            console.error("Form reference is not available.");
            setStatus('error');
            return;
        }

        window.emailjs.sendForm(SERVICE_ID, CONTACT_TEMPLATE_ID, formRef.current)
            .then(() => {
                setStatus('success');
            }, (error: any) => {
                console.error('FAILED to send contact form:', error);
                const errorMsg = error.text || 'Neznámá chyba';
                setErrorMessage(`Odeslání zprávy se nezdařilo: ${errorMsg}`);
                setStatus('error');
                
                alert(`CHYBA PŘI ODESÍLÁNÍ KONTAKTNÍHO FORMULÁŘE:\n${errorMsg}\n\nZkontrolujte Public Key a Template ID.`);
            });
    };

    const inputStyles = "py-3 px-4 block w-full shadow-sm focus:ring-brand-purple focus:border-brand-purple border-brand-purple/20 bg-brand-purple/10 rounded-md placeholder-gray-500";
    
    return (
        <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="relative max-w-xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-dark-gray sm:text-4xl">Kontaktujte nás</h2>
                    <p className="mt-4 text-lg leading-6 text-gray-500">Máte dotaz nebo speciální přání? Neváhejte se na nás obrátit.</p>
                    
                    <div className="mt-8 space-y-8">
                        <div>
                            <p className="text-base text-gray-500">
                                Napsat nám můžete přímo na email: <br />
                                <a href="mailto:magnetic.memories.cz@gmail.com" className="font-medium text-brand-purple hover:text-brand-pink transition-colors">
                                    magnetic.memories.cz@gmail.com
                                </a>
                            </p>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Sledujte nás na sociálních sítích</h3>
                            <div className="flex justify-center space-x-8">
                                <a href="https://www.instagram.com/magnetic_memories_cz/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-600 hover:text-brand-pink transition-colors">
                                    <InstagramIcon />
                                    <span className="mt-2 text-xs font-medium">Instagram</span>
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61584044016506#" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-600 hover:text-brand-purple transition-colors">
                                    <FacebookIcon />
                                    <span className="mt-2 text-xs font-medium">Facebook</span>
                                </a>
                            </div>
                        </div>
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
                            <input type="hidden" name="to_email" value="magnetic.memories.cz@gmail.com" />
                            
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Jméno</label>
                                <div className="mt-1"><input type="text" name="first_name" id="first_name" autoComplete="given-name" className={inputStyles} required /></div>
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Příjmení</label>
                                <div className="mt-1"><input type="text" name="last_name" id="last_name" autoComplete="family-name" className={inputStyles} required /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Váš Email</label>
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

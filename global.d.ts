export {};

declare global {
    interface Window {
        Packeta: any;
        uploadcare: any;
        emailjs: any;
        dataLayer: any[];
    }
    
    function gtag(command: string, ...args: any[]): void;
}

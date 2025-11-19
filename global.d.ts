
export {};

declare global {
    interface Window {
        Packeta: any;
        uploadcare: any;
        emailjs: any;
        gtag: (...args: any[]) => void;
    }
}

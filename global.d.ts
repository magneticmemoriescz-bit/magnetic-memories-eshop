
export {};

declare global {
    interface Window {
        Packeta: any;
        BalikovnaWidget: any;
        pplParcelShopWidget: any;
        uploadcare: any;
        emailjs: any;
        gtag: (...args: any[]) => void;
    }
}

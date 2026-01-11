
export {};

declare global {
    interface Window {
        Packeta: {
            Widget: {
                pick: (apiKey: string, callback: (point: any) => void, options?: any) => void;
            };
        };
        BalikovnaWidget: {
            open: (callback: (point: any) => void) => void;
        };
        pplParcelShopWidget: {
            open: (callbackOrConfig: any) => void;
        };
        pplWidget: {
            open: (callbackOrConfig: any) => void;
        };
        PPLWidget: {
            open: (callbackOrConfig: any) => void;
        };
        balikovnaWidget: any;
        uploadcare: any;
        emailjs: any;
        gtag: (...args: any[]) => void;
    }
}

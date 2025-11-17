import 'jspdf';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export {};

declare global {
    interface Window {
        Packeta: any;
        uploadcare: any;
        emailjs: any;
        jspdf: any;
    }
}


import type { AttachmentData } from '../types';

declare const html2canvas: any;
declare const jspdf: any;

export const createAttachmentFromHtml = async (htmlContent: string, format: 'image' | 'pdf', filename: string): Promise<AttachmentData> => {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '800px'; // A reasonable width for rendering
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    const finalFilename = `${filename}.${format === 'image' ? 'png' : 'pdf'}`;

    try {
        const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
        
        if (format === 'image') {
            const base64 = canvas.toDataURL('image/png').split(',')[1];
            return {
                base64,
                mimeType: 'image/png',
                filename: finalFilename
            };
        } else { // pdf
            const { jsPDF } = jspdf;
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            // Using `datauristring` is more reliable for base64 conversion than `btoa(binarystring)`
            const base64 = pdf.output('datauristring').split(',')[1];
            return {
                base64,
                mimeType: 'application/pdf',
                filename: finalFilename
            };
        }
    } finally {
        document.body.removeChild(element);
    }
};
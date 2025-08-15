import type { SendEmailPayload } from '../types';

const createMimeMessage = (payload: SendEmailPayload): string => {
    const { to, subject, body, attachment, placement, fromName, fromEmail } = payload;
    
    const boundary = `----=_Part_${Math.random().toString(36).substr(2, 16)}`;
    const boundaryRelated = `----=_Part_Related_${Math.random().toString(36).substr(2, 16)}`;
    const attachmentId = `attachment_${Math.random().toString(36).substr(2, 9)}`;

    let rawMessage = '';

    // Headers
    rawMessage += `From: =?utf-8?B?${btoa(unescape(encodeURIComponent(fromName)))}?= <${fromEmail}>\r\n`;
    rawMessage += `To: ${to}\r\n`;
    rawMessage += `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=\r\n`;
    rawMessage += `MIME-Version: 1.0\r\n`;
    
    if (!attachment) {
        rawMessage += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
        rawMessage += body;
    } else {
        if (placement === 'inline' && attachment.mimeType.startsWith('image')) {
            rawMessage += `Content-Type: multipart/related; boundary="${boundaryRelated}"\r\n\r\n`;
            
            rawMessage += `--${boundaryRelated}\r\n`;
            rawMessage += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
            rawMessage += `${body}<br/><img src="cid:${attachmentId}">\r\n\r\n`;
            
            rawMessage += `--${boundaryRelated}\r\n`;
            rawMessage += `Content-Type: ${attachment.mimeType}\r\n`;
            rawMessage += `Content-Transfer-Encoding: base64\r\n`;
            rawMessage += `Content-ID: <${attachmentId}>\r\n`;
            rawMessage += `Content-Disposition: inline; filename="${attachment.filename}"\r\n\r\n`;
            rawMessage += `${attachment.base64}\r\n\r\n`;
            
            rawMessage += `--${boundaryRelated}--`;
        } else { // As attachment
            rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
            
            rawMessage += `--${boundary}\r\n`;
            rawMessage += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
            rawMessage += `${body}\r\n\r\n`;
            
            rawMessage += `--${boundary}\r\n`;
            rawMessage += `Content-Type: ${attachment.mimeType}\r\n`;
            rawMessage += `Content-Transfer-Encoding: base64\r\n`;
            rawMessage += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n\r\n`;
            rawMessage += `${attachment.base64}\r\n\r\n`;
            
            rawMessage += `--${boundary}--`;
        }
    }

    return rawMessage;
};


export const sendEmail = async (payload: SendEmailPayload, gapi: any): Promise<void> => {
    const rawMessage = createMimeMessage(payload);
    // Replace non-url-safe chars with url-safe chars
    const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
            raw: encodedMessage
        }
    });
};
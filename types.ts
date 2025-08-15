
// Declarations for Google API scripts loaded in index.html
declare global {
  const google: any;
  interface Window {
    gapi: any;
  }
}

export interface Recipient {
    id: string;
    email: string;
    data: { [key: string]: string }; // Custom data from bulk upload
}

export interface BulkRecipient {
    id: string;
    data: { [key: string]: string };
    sent: boolean;
}

export interface EmailContent {
    name: string;
    subject: string;
    body: string;
    attachmentHtml: string;
}

export interface AttachmentOptions {
    enabled: boolean;
    format: 'image' | 'pdf';
    placement: 'inline' | 'attachment';
    filename: string;
}

export interface NameRotationOptions {
    enabled: boolean;
    interval: number;
}

export type AppState = 'idle' | 'sending';

export interface AttachmentData {
    base64: string;
    mimeType: string;
    filename: string;
}

export interface SendEmailPayload {
    to: string;
    subject: string;
    body: string;
    attachment: AttachmentData | null;
    placement: 'inline' | 'attachment';
    fromName: string;
    fromEmail: string;
}

export interface AuthState {
    isSignedIn: boolean;
    gapi: any | null;
    tokenClient: any | null;
    user: {
        name: string;
        email: string;
        picture: string;
    } | null;
}


import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Composer } from './components/Composer';
import { RecipientManager } from './components/RecipientManager';
import { SenderControls } from './components/SenderControls';
import { TagReference } from './components/TagReference';
import { AuthManager } from './components/AuthManager';
import { Header } from './components/Header';
import { DataViewer } from './components/DataViewer';
import { LoginPage } from './components/LoginPage';
import type { AppState, Recipient, EmailContent, AttachmentOptions, AuthState, BulkRecipient, NameRotationOptions, SendEmailPayload } from './types';
import { replaceTags, generateTagMap, generateRandomName } from './services/tagService';
import { createAttachmentFromHtml } from './services/attachmentService';
import { sendEmail } from './services/gmailService';

// A more robust parser for CSV/TXT files that handles quoted values and plain email lists.
const parseCSV = (text: string): { headers: string[], rows: { [key: string]: string }[] } => {
    // 1. Handle potential BOM at the start of the file
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.substring(1);
    }

    // 2. Normalize line endings and filter out empty lines
    const lines = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    const firstLine = lines[0].trim();
    const delimiterRegex = /[,;\t]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 3. Check if it's a plain list of emails
    // Condition: No delimiters on the first line, and the first line looks like an email.
    if (!delimiterRegex.test(firstLine) && emailRegex.test(firstLine)) {
        const headers = ['email'];
        const rows = lines
            .map(line => line.trim())
            .filter(line => emailRegex.test(line)) // Only include valid-looking emails
            .map(email => ({ email: email }));
            
        return { headers, rows };
    }

    // 4. If not a plain list, parse as a delimited file (CSV/TSV etc.)
    let delimiter = ',';
    if (firstLine.includes(';')) {
        delimiter = ';';
    } else if (firstLine.includes('\t')) {
        delimiter = '\t';
    }

    // Helper to clean values: trim whitespace and remove surrounding quotes.
    const cleanValue = (val: string) => val.trim().replace(/^"|"$/g, '').trim();

    const headers = lines[0].split(delimiter).map(h => cleanValue(h).toLowerCase());
    
    const rows = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(cleanValue);
        const rowObject: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            rowObject[header] = values[index] || '';
        });
        return rowObject;
    });

    return { headers, rows };
};

/**
 * Prepares the complete payload for a single email by replacing tags and generating attachments.
 */
const prepareEmailPayload = async (
    recipient: Recipient, 
    content: EmailContent, 
    attachmentOpts: AttachmentOptions,
    senderName: string,
    fromEmail: string
): Promise<SendEmailPayload> => {
    const tagMap = generateTagMap(recipient);
    
    const finalSenderName = replaceTags(senderName, tagMap);
    const finalSubject = replaceTags(content.subject, tagMap);
    const finalBody = replaceTags(content.body, tagMap);
    
    let attachmentData = null;
    if (attachmentOpts.enabled) {
        const finalAttachmentHtml = replaceTags(content.attachmentHtml, tagMap);
        const finalFilename = replaceTags(attachmentOpts.filename, tagMap);
        attachmentData = await createAttachmentFromHtml(finalAttachmentHtml, attachmentOpts.format, finalFilename);
    }
    
    return {
        to: recipient.email,
        subject: finalSubject,
        body: finalBody,
        attachment: attachmentData,
        placement: attachmentOpts.placement,
        fromName: finalSenderName,
        fromEmail: fromEmail,
    };
};


const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [bulkData, setBulkData] = useState<BulkRecipient[]>([]);
    const [bulkDataHeaders, setBulkDataHeaders] = useState<string[]>([]);
    const [checkerEmails, setCheckerEmails] = useState<string[]>([]);

    const [emailContent, setEmailContent] = useState<EmailContent>({
        name: '',
        subject: '',
        body: '',
        attachmentHtml: '',
    });
    const [attachmentOptions, setAttachmentOptions] = useState<AttachmentOptions>({
        enabled: false,
        format: 'image',
        placement: 'attachment',
        filename: 'attachment'
    });
    const [nameRotationOptions, setNameRotationOptions] = useState<NameRotationOptions>({
        enabled: false,
        interval: 10,
    });
    const [appState, setAppState] = useState<AppState>('idle');
    const [sentCount, setSentCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [auth, setAuth] = useState<AuthState>({
      isSignedIn: false,
      gapi: null,
      tokenClient: null,
      user: null
    });
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);

    const isSendingRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const checkerFileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        // Check for app login session
        const session = localStorage.getItem('app_session');
        if (session) {
            try {
                const { expiry } = JSON.parse(session);
                if (new Date().getTime() < expiry) {
                    setIsLoggedIn(true);
                    setSessionExpiry(expiry);
                } else {
                    localStorage.removeItem('app_session');
                }
            } catch {
                localStorage.removeItem('app_session');
            }
        }

        // Load persisted bulk data
        try {
            const savedData = localStorage.getItem('bulkData');
            const savedHeaders = localStorage.getItem('bulkDataHeaders');
            const savedCheckerEmails = localStorage.getItem('checkerEmails');
            if (savedData) {
                const parsedData: BulkRecipient[] = JSON.parse(savedData);
                setBulkData(parsedData);
            }
            if (savedHeaders) {
                setBulkDataHeaders(JSON.parse(savedHeaders));
            }
            if (savedCheckerEmails) {
                setCheckerEmails(JSON.parse(savedCheckerEmails));
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        }
    }, []);

    const handleLoginSuccess = (expiryTimestamp: number) => {
        localStorage.setItem('app_session', JSON.stringify({ expiry: expiryTimestamp }));
        setIsLoggedIn(true);
        setSessionExpiry(expiryTimestamp);
    };

    const handleLogout = () => {
        localStorage.removeItem('app_session');
        setIsLoggedIn(false);
        setSessionExpiry(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCheckerUploadClick = () => {
        checkerFileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { headers, rows } = parseCSV(text);
            
            if (rows.length === 0 || !headers.includes('email')) {
                alert("Upload failed: The file must be a plain list of emails, or a CSV/TXT file with an 'email' column header.");
                return;
            }

            const newBulkData: BulkRecipient[] = rows.map(row => ({
                id: `${row.email}-${Date.now()}-${Math.random()}`,
                data: row,
                sent: false
            }));

            setBulkData(newBulkData);
            setBulkDataHeaders(headers);
            localStorage.setItem('bulkData', JSON.stringify(newBulkData));
            localStorage.setItem('bulkDataHeaders', JSON.stringify(headers));
        };
        reader.readAsText(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleCheckerFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const emails = text.trim().replace(/\r\n/g, '\n').split('\n').map(line => line.trim()).filter(line => line && emailRegex.test(line));
            
            if (emails.length === 0) {
                alert("Upload failed: The file contains no valid email addresses.");
                return;
            }
            
            setCheckerEmails(emails);
            localStorage.setItem('checkerEmails', JSON.stringify(emails));
            alert(`${emails.length} checker emails loaded successfully.`);
        };
        reader.readAsText(file);
        if (event.target) {
            event.target.value = ''; // Reset file input
        }
    };
    
    const handleLoadRecipients = (count: number) => {
        const unsent = bulkData.filter(item => !item.sent);
        const toLoad = unsent.slice(0, count);

        const newRecipients: Recipient[] = toLoad.map(item => {
             if (!item.data.email) {
                console.warn("Skipping record without email:", item.data);
                return null;
             }
             return {
                id: item.id,
                email: item.data.email,
                data: item.data
             };
        }).filter((r): r is Recipient => r !== null);
        
        setRecipients(newRecipients);
    };

    const handleLoadCheckerEmails = useCallback(() => {
        const bulkDataByEmail = new Map(bulkData.map(b => [b.data.email, b]));

        const checkerRecipients: Recipient[] = checkerEmails.map(email => {
            if (bulkDataByEmail.has(email)) {
                const bulkItem = bulkDataByEmail.get(email)!;
                return {
                    id: bulkItem.id,
                    email: bulkItem.data.email,
                    data: bulkItem.data
                };
            }
            // Create a new recipient if not found in bulk data
            return {
                id: `${email}-${Date.now()}`,
                email: email,
                data: { email }
            };
        });
        setRecipients(checkerRecipients);
    }, [checkerEmails, bulkData]);

    const handleRecipientsChange = useCallback((text: string) => {
        const emailStrings = text.split('\n').map(line => line.trim()).filter(line => line);

        const existingRecipientsByEmail = new Map(recipients.map(r => [r.email, r]));
        const bulkDataByEmail = new Map(bulkData.map(b => [b.data.email, b]));

        const newRecipients: Recipient[] = emailStrings.map(email => {
            // 1. Reuse from current queue if it's there
            if (existingRecipientsByEmail.has(email)) {
                return existingRecipientsByEmail.get(email)!;
            }

            // 2. Create from bulk data if it exists there
            if (bulkDataByEmail.has(email)) {
                const bulkItem = bulkDataByEmail.get(email)!;
                return {
                    id: bulkItem.id,
                    email: bulkItem.data.email,
                    data: bulkItem.data
                };
            }
            
            // 3. Create a new recipient as a last resort for manually added emails
            return {
                id: `${email}-${Date.now()}`,
                email: email,
                data: { email } // Provide minimal data for basic tag replacement
            };
        });
        setRecipients(newRecipients);
    }, [recipients, bulkData]);

    const handleClearBulkData = useCallback(() => {
        if (window.confirm("Are you sure you want to clear all uploaded data? This action cannot be undone.")) {
            setBulkData([]);
            setBulkDataHeaders([]);
            setRecipients([]); // also clear the queue
            localStorage.removeItem('bulkData');
            localStorage.removeItem('bulkDataHeaders');
            setIsDataModalOpen(false); // close modal after clearing
        }
    }, []);


    const handleStop = () => {
        isSendingRef.current = false;
        setAppState('idle');
    };

    const handleSend = useCallback(async () => {
        if (!auth.isSignedIn || !auth.gapi || !auth.user?.email) {
            setError("Authentication failed. Please sign in and grant permissions.");
            return;
        }

        const validRecipients = recipients.filter(r => r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));

        if (validRecipients.length === 0) {
            setError("Recipient list is empty or contains no valid emails.");
            return;
        }
        if (!emailContent.subject.trim() || !emailContent.body.trim()) {
            setError("Subject and Body cannot be empty.");
            return;
        }

        isSendingRef.current = true;
        setAppState('sending');
        setError(null);
        setSentCount(0);
        setTotalCount(validRecipients.length);
        
        const recipientsCopy = [...validRecipients];
        const alreadySentCount = bulkData.filter(item => item.sent).length;
        let currentSenderName = emailContent.name;

        for (const [index, recipient] of recipientsCopy.entries()) {
            if (!isSendingRef.current) {
                console.log("Sending stopped by user.");
                break;
            }

            try {
                // Determine the sender name for this specific email based on rotation rules
                const currentTotalSent = alreadySentCount + index;
                if (nameRotationOptions.enabled && nameRotationOptions.interval > 0 && currentTotalSent > 0 && currentTotalSent % nameRotationOptions.interval === 0) {
                    currentSenderName = generateRandomName('FNAME');
                }
                const senderNameForThisEmail = nameRotationOptions.enabled ? currentSenderName : emailContent.name;
                
                // Prepare the full email payload
                const payload = await prepareEmailPayload(
                    recipient,
                    emailContent,
                    attachmentOptions,
                    senderNameForThisEmail,
                    auth.user.email
                );

                // Send the email
                await sendEmail(payload, auth.gapi);

                // Update UI and state post-send
                setSentCount(prev => prev + 1);
                setRecipients(prev => prev.filter(r => r.id !== recipient.id));
                setBulkData(prev => {
                    const newData = prev.map(item => 
                        item.id === recipient.id ? { ...item, sent: true } : item
                    );
                    localStorage.setItem('bulkData', JSON.stringify(newData));
                    return newData;
                });

                await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay between emails

            } catch (err) {
                console.error(`Failed to send email to ${recipient.email}:`, err);
                setError(`Failed to send to ${recipient.email}. See console for details. Stopping process.`);
                handleStop();
                break;
            }
        }
        isSendingRef.current = false;
        setAppState('idle');

    }, [recipients, emailContent, attachmentOptions, auth, bulkData, nameRotationOptions]);

    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="w-[1200px] h-[800px] bg-gray-900 text-gray-200 font-sans flex flex-col overflow-hidden shadow-2xl rounded-lg border border-gray-700">
            <Header
                onShowTags={() => setIsTagModalOpen(true)}
                onUploadClick={handleUploadClick}
                onCheckerUploadClick={handleCheckerUploadClick}
                onShowData={() => setIsDataModalOpen(true)}
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.txt"
                className="hidden"
                aria-hidden="true"
            />
             <input
                type="file"
                ref={checkerFileInputRef}
                onChange={handleCheckerFileChange}
                accept=".txt"
                className="hidden"
                aria-hidden="true"
            />
            <main className="flex-grow flex flex-col overflow-hidden p-3">
                <AuthManager auth={auth} setAuth={setAuth} onLogout={handleLogout} sessionExpiry={sessionExpiry} />
                
                {error && (
                    <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-md relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                            <svg className="fill-current h-6 w-6 text-white" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow min-h-0">
                    <div className="lg:col-span-8 flex flex-col space-y-3">
                        <Composer
                            emailContent={emailContent}
                            setEmailContent={setEmailContent}
                            attachmentOptions={attachmentOptions}
                            setAttachmentOptions={setAttachmentOptions}
                            nameRotationOptions={nameRotationOptions}
                            setNameRotationOptions={setNameRotationOptions}
                            disabled={appState === 'sending'}
                        />
                        <SenderControls
                            onSend={handleSend}
                            onStop={handleStop}
                            appState={appState}
                            sentCount={sentCount}
                            totalCount={totalCount}
                            recipientsCount={recipients.length}
                            isSignedIn={auth.isSignedIn}
                        />
                    </div>
                    <div className="lg:col-span-4">
                        <RecipientManager
                            recipients={recipients}
                            onRecipientsChange={handleRecipientsChange}
                            disabled={appState === 'sending'}
                            loadRecipients={handleLoadRecipients}
                            onLoadChecker={handleLoadCheckerEmails}
                            unsentCount={bulkData.filter(item => !item.sent).length}
                            checkerCount={checkerEmails.length}
                            clearRecipients={() => setRecipients([])}
                        />
                    </div>
                </div>
            </main>
            <TagReference 
                isOpen={isTagModalOpen} 
                onClose={() => setIsTagModalOpen(false)}
                customTags={bulkDataHeaders}
            />
            <DataViewer
                isOpen={isDataModalOpen}
                onClose={() => setIsDataModalOpen(false)}
                bulkData={bulkData}
                onClearData={handleClearBulkData}
                disabled={appState === 'sending'}
            />
        </div>
    );
};

export default App;

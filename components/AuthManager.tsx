import React, { useState, useEffect, useCallback } from 'react';
import type { AuthState } from '../types';
import { Icon } from './Icon';

const SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

interface AuthManagerProps {
    auth: AuthState;
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
    onLogout: () => void;
    sessionExpiry: number | null;
}

export const AuthManager: React.FC<AuthManagerProps> = ({ auth, setAuth, onLogout, sessionExpiry }) => {
    const [apiKey, setApiKey] = useState('');
    const [clientId, setClientId] = useState('');
    const [credentials, setCredentials] = useState<{apiKey: string, clientId: string} | null>(null);
    const [configError, setConfigError] = useState<string|null>(null);
    const [isEmailCopied, setIsEmailCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    
    useEffect(() => {
        if (!sessionExpiry) {
            setTimeLeft('');
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const distance = sessionExpiry - now;

            if (distance < 0) {
                setTimeLeft('Expired');
                clearInterval(intervalId);
                setTimeout(onLogout, 1500); // Auto logout after expiry
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s left`);
            }
        }, 1000);
        
        return () => clearInterval(intervalId);
    }, [sessionExpiry, onLogout]);

    const handleLoadCredentials = () => {
        if (!apiKey.trim()) {
            setConfigError('API Key is required.');
            return;
        }
        if (!clientId.trim()) {
            setConfigError('Client ID is required.');
            return;
        }

        setCredentials({
            apiKey: apiKey.trim(),
            clientId: clientId.trim()
        });
        setConfigError(null);
    };


    const handleAuthClick = () => {
        if (auth.gapi && auth.tokenClient) {
            if (auth.gapi.client.getToken() === null) {
                auth.tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                auth.tokenClient.requestAccessToken({ prompt: '' });
            }
        }
    };

    const handleSignoutClick = () => {
        if (auth.gapi) {
            const token = auth.gapi.client.getToken();
            if (token !== null) {
                google.accounts.oauth2.revoke(token.access_token, () => {
                    auth.gapi.client.setToken('');
                    setAuth(prev => ({...prev, isSignedIn: false, user: null }));
                });
            }
        }
    };

    const handleCopyEmail = () => {
        if (auth.user?.email) {
            navigator.clipboard.writeText(auth.user.email).then(() => {
                setIsEmailCopied(true);
                setTimeout(() => setIsEmailCopied(false), 2000);
            });
        }
    };
    
    const initClient = useCallback(async () => {
        if (!credentials) return;
        try {
            await window.gapi.client.init({
                apiKey: credentials.apiKey,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
            });
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: credentials.clientId,
                scope: SCOPES,
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        console.error('Token Error:', tokenResponse.error);
                        return;
                    }
                    window.gapi.client.setToken(tokenResponse);
                     try {
                        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: {
                                'Authorization': `Bearer ${tokenResponse.access_token}`
                            }
                        });
                        if (!res.ok) {
                            throw new Error(`Failed to fetch user profile: ${res.statusText}`);
                        }
                        const userProfile = await res.json();
                        setAuth(prev => ({ ...prev, isSignedIn: true, user: userProfile }));
                    } catch (error) {
                        console.error('Failed to fetch user profile:', error);
                    }
                },
            });
            setAuth(prev => ({ ...prev, gapi: window.gapi, tokenClient: tokenClient }));

        } catch (error) {
            console.error("Error initializing gapi client:", error);
        }
    }, [credentials, setAuth]);

    useEffect(() => {
        if (!credentials) return;
        const loadGapi = () => {
           window.gapi.load('client', initClient);
        };
        
        if (window.gapi) {
          loadGapi();
        }
    }, [credentials, initClient]);
    

    const AuthButton = ({ onClick, children, className, disabled }: { onClick: () => void; children: React.ReactNode; className: string; disabled?: boolean; }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-150 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );

    const inputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out";
    
    return (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4 shadow-lg">
            <h2 className="font-semibold text-lg text-teal-400 flex items-center gap-2 mb-4">
                <Icon name="config" />
                Configuration
            </h2>
            {!credentials ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">Google API Key</label>
                            <input type="password" id="apiKey" value={apiKey} onChange={e => setApiKey(e.target.value)} className={inputClasses} />
                        </div>
                         <div>
                            <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-1">Google OAuth 2.0 Client ID</label>
                            <input type="password" id="clientId" value={clientId} onChange={e => setClientId(e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                    {configError && <p className="text-sm text-red-400 text-center">{configError}</p>}
                    <div className="flex justify-center">
                        <button onClick={handleLoadCredentials} className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out">
                            Load Credentials
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {auth.isSignedIn && auth.user ? (
                            <>
                            <div className="text-sm">
                                <p className="text-gray-300 font-medium">{auth.user.name}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-gray-400">{auth.user.email}</p>
                                    <button 
                                        onClick={handleCopyEmail} 
                                        className="text-gray-400 hover:text-white transition-colors duration-150" 
                                        title="Copy email address"
                                        aria-label="Copy email address"
                                    >
                                        {isEmailCopied ? 
                                            <Icon name="check" className="w-4 h-4 text-green-400" /> : 
                                            <Icon name="copy" className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                            </div>
                            {timeLeft && (
                                <div className="flex items-center gap-2 text-sm text-amber-300 font-mono bg-amber-900/50 px-2.5 py-1 rounded-full" title="Session Time Remaining">
                                    <Icon name="hourglass" className="w-4 h-4" />
                                    <span>{timeLeft}</span>
                                </div>
                            )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">Credentials loaded. Please sign in to send emails.</p>
                        )}
                    </div>
                    {auth.isSignedIn ? (
                        <div className="flex items-center gap-2">
                            <img src={auth.user?.picture} alt="user avatar" className="w-10 h-10 rounded-full" />
                             <AuthButton onClick={onLogout} className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500">
                                <Icon name="lock" />
                                Lock App
                            </AuthButton>
                            <AuthButton onClick={handleSignoutClick} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
                                <Icon name="logout" />
                                Sign Out
                            </AuthButton>
                        </div>
                    ) : (
                        <AuthButton onClick={handleAuthClick} disabled={!auth.gapi || !auth.tokenClient} className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                            <Icon name="login" />
                            Sign In with Google
                        </AuthButton>
                    )}
                </div>
            )}
        </div>
    );
};
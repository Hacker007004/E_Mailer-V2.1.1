
import React, { useState } from 'react';
import { Icon } from './Icon';

interface LoginPageProps {
    onLoginSuccess: (expiryTimestamp: number) => void;
}

// In a real application, this user list would come from your backend database.
const MOCK_USERS = [
    { email: "admin@gmail.com", password: "admin" },
    { email: "john.doe@example.com", password: "password123" },
    { email: "test.user@example.com", password: "test" },
    { email: "dev.user@example.com", password: "dev" },
    { email: "guest@example.com", password: "guest" },
    { email: "jane.smith@example.com", password: "password456" },



];

/**
 * Generates a default expiry date string for the datetime-local input.
 * Defaults to 24 hours from the current time.
 * @returns {string} Formatted date string (YYYY-MM-DDTHH:mm)
 */
const getDefaultExpiry = (): string => {
    const now = new Date();
    now.setDate(now.getDate() + 1); // Add 1 day
    // Format to YYYY-MM-DDTHH:mm, which is required by datetime-local input
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [expiryDateTime, setExpiryDateTime] = useState(getDefaultExpiry());
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate that the selected expiry time is in the future.
            const expiryTimestamp = new Date(expiryDateTime).getTime();
            if (isNaN(expiryTimestamp) || expiryTimestamp <= new Date().getTime()) {
                throw new Error('Session expiry must be set to a future time.');
            }

            // --- MOCK BACKEND LOGIC (FOR DEMONSTRATION) ---
            await new Promise(resolve => setTimeout(resolve, 500)); 

            const user = MOCK_USERS.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Pass the precise expiry timestamp to the parent component.
                onLoginSuccess(expiryTimestamp);
            } else {
                throw new Error('Invalid credentials.');
            }
            // --- END OF MOCK LOGIC ---

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-900 placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm transition";

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-200 font-sans p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 rounded-lg shadow-2xl border border-gray-700">
                <div>
                    <h1 className="text-4xl font-bold text-center tracking-tighter">
                        <span className="text-teal-400">E</span>
                        <span className="text-gray-200">_mailer</span>
                    </h1>
                    <h2 className="mt-2 text-center text-lg text-gray-400">
                        Secure Application Login
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${inputClasses} rounded-t-md`}
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClasses}`}
                                placeholder="Password"
                            />
                        </div>
                         
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-400" role="alert">
                            {error}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <Icon name="lock" className={`h-5 w-5 ${isLoading ? 'text-teal-400' : 'text-teal-300 group-hover:text-teal-200'}`} />
                            </span>
                            {isLoading ? 'Authenticating...' : 'Login'}
                        </button>
                    </div>
                </form>
               
            </div>
        </div>
    );
};
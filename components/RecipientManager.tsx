import React, { useState } from 'react';
import type { Recipient } from '../types';
import { Icon } from './Icon';

interface RecipientManagerProps {
    recipients: Recipient[];
    onRecipientsChange: (text: string) => void;
    disabled: boolean;
    loadRecipients: (count: number) => void;
    onLoadChecker: () => void;
    unsentCount: number;
    checkerCount: number;
    clearRecipients: () => void;
}

export const RecipientManager: React.FC<RecipientManagerProps> = ({ 
    recipients, onRecipientsChange, disabled, 
    loadRecipients, onLoadChecker, unsentCount, checkerCount, clearRecipients 
}) => {
    const [loadCount, setLoadCount] = useState(50);
    
    const handleLoadClick = () => {
        loadRecipients(loadCount);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onRecipientsChange(e.target.value);
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 shadow-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                    <Icon name="recipients" />
                    Recipients Queue ({recipients.length})
                </h2>
                 <button 
                    onClick={clearRecipients} 
                    className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled || recipients.length === 0}
                >
                    Clear Queue
                </button>
            </div>
            
            <div className="grid grid-cols-12 gap-2 mb-4">
                <input
                    type="number"
                    value={loadCount}
                    onChange={(e) => setLoadCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="col-span-3 w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition disabled:opacity-50"
                    disabled={disabled}
                    aria-label="Number of recipients to load"
                 />
                 <button
                    onClick={handleLoadClick}
                    disabled={disabled || unsentCount === 0}
                    className="col-span-5 flex-grow bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Load Next ({unsentCount})
                 </button>
                 <button
                    onClick={onLoadChecker}
                    disabled={disabled || checkerCount === 0}
                    className="col-span-4 flex-grow bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                    <Icon name="check-circle" className="w-5 h-5"/>
                    Checker
                 </button>
             </div>

            <textarea
                className="w-full bg-gray-900 rounded-md py-2 px-3 flex-grow border border-gray-600 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 resize-none"
                value={recipients.map(r => r.email).join('\n')}
                onChange={handleTextChange}
                disabled={disabled}
                aria-label="Recipient Email Sending Queue"
            />
        </div>
    );
};
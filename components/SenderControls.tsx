
import React from 'react';
import type { AppState } from '../types';
import { Icon } from './Icon';

interface SenderControlsProps {
    onSend: () => void;
    onStop: () => void;
    appState: AppState;
    sentCount: number;
    totalCount: number;
    recipientsCount: number;
    isSignedIn: boolean;
}

export const SenderControls: React.FC<SenderControlsProps> = ({ onSend, onStop, appState, sentCount, totalCount, recipientsCount, isSignedIn }) => {
    const isSending = appState === 'sending';
    const progress = totalCount > 0 ? (sentCount / totalCount) * 100 : 0;

    const canSend = isSignedIn && recipientsCount > 0 && !isSending;

    return (
        <div className="bg-gray-800/50 rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Status: 
                        <span className={`ml-2 font-bold ${isSending ? 'text-yellow-400' : 'text-green-400'}`}>
                            {isSending ? 'Sending...' : 'Idle'}
                        </span>
                    </h3>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div 
                            className="bg-teal-500 h-4 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-400 text-right">{sentCount} / {totalCount} sent</p>
                </div>

                <div className="flex gap-4">
                    {isSending ? (
                        <button
                            onClick={onStop}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition duration-150"
                        >
                            <Icon name="stop" />
                            Stop
                        </button>
                    ) : (
                        <button
                            onClick={onSend}
                            disabled={!canSend}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition duration-150 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <Icon name="send" />
                            Send Emails
                        </button>
                    )}
                </div>
            </div>
            {!isSignedIn && <p className="text-center text-yellow-400 mt-3 text-sm">You must sign in to enable sending.</p>}
            {isSignedIn && recipientsCount === 0 && <p className="text-center text-yellow-400 mt-3 text-sm">Please upload recipients to enable sending.</p>}
        </div>
    );
};

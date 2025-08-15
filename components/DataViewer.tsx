import React from 'react';
import { Icon } from './Icon';
import type { BulkRecipient } from '../types';

interface DataViewerProps {
    isOpen: boolean;
    onClose: () => void;
    bulkData: BulkRecipient[];
    onClearData: () => void;
    disabled: boolean;
}

export const DataViewer: React.FC<DataViewerProps> = ({ isOpen, onClose, bulkData, onClearData, disabled }) => {
    if (!isOpen) return null;

    const sentCount = bulkData.filter(item => item.sent).length;
    const totalCount = bulkData.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                        <Icon name="database" />
                        Data Source & Status
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                        <Icon name="close" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6 flex-grow">
                    {totalCount > 0 ? (
                         <div className="space-y-4 h-full flex flex-col">
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total: <span className="font-bold text-gray-200">{totalCount}</span></span>
                                <span className="text-green-400">Sent: <span className="font-bold">{sentCount}</span></span>
                                <span className="text-yellow-400">Remaining: <span className="font-bold">{totalCount - sentCount}</span></span>
                             </div>
                             <div className="flex-grow text-xs text-gray-400 min-h-0 overflow-y-auto bg-gray-900/50 p-2 rounded-md border border-gray-700 font-mono">
                                {bulkData.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis py-0.5">
                                        {item.sent ? (
                                            <Icon name="check" className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 flex-shrink-0" />
                                        )}
                                        <span className={item.sent ? 'text-gray-500 line-through' : 'text-gray-300'}>{item.data.email}</span>
                                    </div>
                                ))}
                             </div>
                         </div>
                    ) : (
                         <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg h-full flex flex-col justify-center">
                            <Icon name="upload" className="mx-auto h-12 w-12 text-gray-500" />
                            <h3 className="mt-2 text-sm font-medium text-gray-200">No data loaded</h3>
                            <p className="mt-1 text-sm text-gray-400">Use the 'Upload Data' button to begin.</p>
                         </div>
                    )}
                </div>
                 <div className="p-4 border-t border-gray-700 text-right">
                    <button 
                        onClick={onClearData} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={disabled || totalCount === 0}
                    >
                        Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};
import React from 'react';
import { Icon } from './Icon';
import type { BulkRecipient } from '../types';

interface BulkDataManagerProps {
    bulkData: BulkRecipient[];
    onClearData: () => void;
    disabled: boolean;
}

export const BulkDataManager: React.FC<BulkDataManagerProps> = ({ bulkData, onClearData, disabled }) => {
    const sentCount = bulkData.filter(item => item.sent).length;
    const totalCount = bulkData.length;
    
    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                    <Icon name="database" />
                    Data Source
                </h2>
                <button 
                    onClick={onClearData} 
                    className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled || totalCount === 0}
                >
                    Clear All
                </button>
            </div>
            
            {totalCount > 0 ? (
                 <div className="space-y-4 flex-grow flex flex-col">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total: <span className="font-bold text-gray-200">{totalCount}</span></span>
                        <span className="text-green-400">Sent: <span className="font-bold">{sentCount}</span></span>
                        <span className="text-yellow-400">Remaining: <span className="font-bold">{totalCount - sentCount}</span></span>
                     </div>
                     <div className="flex-grow text-xs text-gray-400 min-h-0 overflow-y-auto bg-gray-900/50 p-2 rounded-md border border-gray-700 font-mono">
                        {bulkData.map(item => (
                            <div key={item.id} className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
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
                 <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg flex-grow flex flex-col justify-center">
                    <Icon name="upload" className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-200">No data loaded</h3>
                    <p className="mt-1 text-sm text-gray-400">Use the 'Upload Data' button in the header to begin.</p>
                 </div>
            )}
        </div>
    );
};
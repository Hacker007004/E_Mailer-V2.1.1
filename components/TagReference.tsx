import React, { useState } from 'react';
import { Icon } from './Icon';

const staticTags = [
    { tag: "#DATE#", desc: "Today's date", example: "18 June, 2024" },
    { tag: "#DATE1#", desc: "Today's date (short)", example: "06/18/2024" },
    { tag: "#DATETIME#", desc: "Date and time", example: "18 June, 2024 14:30:00" },
    { tag: "#NAME#", desc: "Random first name", example: "Robert" },
    { tag: "#FNAME#", desc: "Random full name", example: "Robert Schmidt" },
    { tag: "#UNAME#", desc: "Random full name (initial)", example: "R. Nathan Hahn" },
    { tag: "#EMAIL#", desc: "Recipient's email", example: "alex2024@gmail.com" },
    { tag: "#INV#", desc: "Random invoice number", example: "INV-ABC-12345" },
    { tag: "#SNUM#", desc: "Random 6-digit number", example: "494560" },
    { tag: "#LNUM#", desc: "Random numbers and letters", example: "aK9s2Lp4" },
    { tag: "#SMLETT#", desc: "Random short letters", example: "EVOUAHEM" },
    { tag: "#LMLETT#", desc: "Random long letters", example: "igxnibvmtqksywep" },
    { tag: "#UKEY#", desc: "Unique key (UUID)", example: "1038df95-..." },
    { tag: "#TRX#", desc: "Random wallet address", example: "bc1qxy2k..." },
    { tag: "#ADDRESS#", desc: "Random street address", example: "108 Hemway Center" },
    { tag: "#ADDRESS1#", desc: "Random full address", example: "3356 Leon Keys, VT 88912" },
];

interface TagReferenceProps {
    isOpen: boolean;
    onClose: () => void;
    customTags: string[];
}

export const TagReference: React.FC<TagReferenceProps> = ({ isOpen, onClose, customTags }) => {
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    const handleCopy = (tag: string) => {
        navigator.clipboard.writeText(tag).then(() => {
            setCopiedTag(tag);
            setTimeout(() => setCopiedTag(null), 2000);
        });
    };
    
    if (!isOpen) return null;

    const renderTable = (title: string, tags: {tag: string, desc: string, example?: string}[]) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">{title}</h3>
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-800">
                    <tr>
                        <th className="py-2 font-semibold text-gray-300 w-1/4">Tag</th>
                        <th className="py-2 font-semibold text-gray-300 w-2/4">Description</th>
                        <th className="py-2 font-semibold text-gray-300 w-1/4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {tags.map(({ tag, desc, example }) => (
                        <tr key={tag}>
                            <td className="py-3 font-mono text-teal-400">{tag}</td>
                            <td className="py-3 text-gray-400">
                                {desc}
                                {example && <><br/><em className="text-gray-500">e.g., {example}</em></>}
                            </td>
                            <td className="py-3 text-center">
                                <button 
                                    onClick={() => handleCopy(tag)}
                                    className={`w-24 text-xs font-bold py-1 px-2 rounded transition duration-200 flex items-center justify-center gap-1 ${copiedTag === tag ? 'bg-green-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                                >
                                    <Icon name={copiedTag === tag ? 'check' : 'copy'} className="w-4 h-4" />
                                    {copiedTag === tag ? 'Copied!' : 'Copy'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const customTagData = customTags.map(header => ({
        tag: `#${header.toUpperCase()}#`,
        desc: `Data from the '${header}' column of your uploaded file.`
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                        <Icon name="tags" />
                        Tag Reference
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                        <Icon name="close" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6">
                    {customTags.length > 0 && renderTable('Custom Tags (from your data)', customTagData)}
                    {renderTable('Standard Tags (randomly generated)', staticTags)}
                </div>
            </div>
        </div>
    );
};

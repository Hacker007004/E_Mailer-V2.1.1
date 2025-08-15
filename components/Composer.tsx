
import React from 'react';
import type { EmailContent, AttachmentOptions, NameRotationOptions } from '../types';
import { generateRandomName } from '../services/tagService';
import { Icon } from './Icon';

interface ComposerProps {
    emailContent: EmailContent;
    setEmailContent: React.Dispatch<React.SetStateAction<EmailContent>>;
    attachmentOptions: AttachmentOptions;
    setAttachmentOptions: React.Dispatch<React.SetStateAction<AttachmentOptions>>;
    nameRotationOptions: NameRotationOptions;
    setNameRotationOptions: React.Dispatch<React.SetStateAction<NameRotationOptions>>;
    disabled: boolean;
}

export const Composer: React.FC<ComposerProps> = ({ 
    emailContent, setEmailContent, 
    attachmentOptions, setAttachmentOptions, 
    nameRotationOptions, setNameRotationOptions,
    disabled 
}) => {
    
    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEmailContent(prev => ({ ...prev, [name]: value }));
    };

    const handleAttachmentOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setAttachmentOptions(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            setNameRotationOptions(prev => ({ ...prev, enabled: target.checked }));
        } else if (type === 'number') {
            setNameRotationOptions(prev => ({ ...prev, [name]: Math.max(1, parseInt(value, 10) || 1) }));
        } else {
            setNameRotationOptions(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGenerateName = () => {
        setEmailContent(prev => ({ ...prev, name: generateRandomName('FNAME') }));
    };

    const inputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out disabled:opacity-50";
    const textareaClasses = "bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out disabled:opacity-50 font-mono text-sm resize-none";
    const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
    const attachmentDisabled = disabled || !attachmentOptions.enabled;

    return (
        <div className="bg-gray-800/50 rounded-lg p-3 shadow-lg space-y-3 flex flex-col flex-grow">
            <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2 flex-shrink-0"><Icon name="compose" />Email Composer</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
                <div>
                    <label htmlFor="name" className={labelClasses}>Sender Name</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={emailContent.name}
                            onChange={handleContentChange}
                            className={inputClasses}
                            disabled={disabled || nameRotationOptions.enabled}
                        />
                         <button onClick={handleGenerateName} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 px-3 rounded-md flex-shrink-0 transition disabled:opacity-50" disabled={disabled}>Generate</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="subject" className={labelClasses}>Subject</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={emailContent.subject}
                        onChange={handleContentChange}
                        className={inputClasses}
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between bg-gray-900/40 rounded-md p-2 flex-shrink-0">
                {/* Rotation controls */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <input
                            id="enableNameRotation"
                            name="enabled"
                            type="checkbox"
                            checked={nameRotationOptions.enabled}
                            onChange={handleRotationChange}
                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                            disabled={disabled}
                        />
                        <label htmlFor="enableNameRotation" className="ml-2 block text-sm font-medium text-gray-300">
                            Rotate Sender Name
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="interval" className="text-sm text-gray-400">every</label>
                        <input
                            type="number"
                            id="interval"
                            name="interval"
                            value={nameRotationOptions.interval}
                            onChange={handleRotationChange}
                            className={`${inputClasses} w-20 text-center !py-1`}
                            disabled={disabled || !nameRotationOptions.enabled}
                            min="1"
                        />
                         <span className="text-sm text-gray-400">sent emails.</span>
                    </div>
                </div>
                 {/* Attachment enable */}
                <div className="flex items-center">
                    <input
                        id="enableAttachment"
                        name="enabled"
                        type="checkbox"
                        checked={attachmentOptions.enabled}
                        onChange={handleAttachmentOptionChange}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                        disabled={disabled}
                    />
                    <label htmlFor="enableAttachment" className="ml-2 block text-sm font-medium text-teal-400">
                        Add Attachment
                    </label>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-grow min-h-0">
                {/* Col 1: Body */}
                <div className="flex flex-col">
                    <label htmlFor="body" className={labelClasses}>Body (HTML Supported)</label>
                    <textarea
                        id="body"
                        name="body"
                        value={emailContent.body}
                        onChange={handleContentChange}
                        className={`${textareaClasses} flex-grow`}
                        disabled={disabled}
                    />
                </div>

                {/* Col 2: Attachments */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="attachmentHtml" className={labelClasses}>Attachment HTML (Tags Supported)</label>
                    <textarea
                        id="attachmentHtml"
                        name="attachmentHtml"
                        value={emailContent.attachmentHtml}
                        onChange={handleContentChange}
                        className={`${textareaClasses} flex-grow`}
                        disabled={attachmentDisabled}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-shrink-0">
                        <div>
                            <label htmlFor="filename" className={`${labelClasses} !text-xs`}>Filename</label>
                            <input
                                type="text"
                                id="filename"
                                name="filename"
                                value={attachmentOptions.filename}
                                onChange={handleAttachmentOptionChange}
                                className={`${inputClasses} !py-1`}
                                disabled={attachmentDisabled}
                            />
                        </div>
                        <div>
                            <span className={`${labelClasses} !text-xs`}>Format</span>
                            <div className="flex items-center space-x-2 mt-1">
                                <label className="flex items-center"><input type="radio" name="format" value="image" checked={attachmentOptions.format === 'image'} onChange={handleAttachmentOptionChange} className="form-radio h-4 w-4 text-teal-600 bg-gray-700 border-gray-500" disabled={attachmentDisabled} /> <span className="ml-1 text-sm">Image</span></label>
                                <label className="flex items-center"><input type="radio" name="format" value="pdf" checked={attachmentOptions.format === 'pdf'} onChange={handleAttachmentOptionChange} className="form-radio h-4 w-4 text-teal-600 bg-gray-700 border-gray-500" disabled={attachmentDisabled} /> <span className="ml-1 text-sm">PDF</span></label>
                            </div>
                        </div>
                        <div>
                            <span className={`${labelClasses} !text-xs`}>Placement</span>
                            <div className="flex items-center space-x-2 mt-1">
                                <label className="flex items-center"><input type="radio" name="placement" value="attachment" checked={attachmentOptions.placement === 'attachment'} onChange={handleAttachmentOptionChange} className="form-radio h-4 w-4 text-teal-600 bg-gray-700 border-gray-500" disabled={attachmentDisabled} /> <span className="ml-1 text-sm">Attach</span></label>
                                <label className="flex items-center"><input type="radio" name="placement" value="inline" checked={attachmentOptions.placement === 'inline'} onChange={handleAttachmentOptionChange} className="form-radio h-4 w-4 text-teal-600 bg-gray-700 border-gray-500" disabled={attachmentDisabled || attachmentOptions.format === 'pdf'} title={attachmentOptions.format === 'pdf' ? "PDFs can only be attachments" : ""}/> <span className={`ml-1 text-sm ${attachmentOptions.format === 'pdf' ? 'text-gray-500' : ''}`}>Inline</span></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

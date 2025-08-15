
import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
    onShowTags: () => void;
    onUploadClick: () => void;
    onCheckerUploadClick: () => void;
    onShowData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowTags, onUploadClick, onCheckerUploadClick, onShowData }) => {
    return (
        <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-3xl font-bold tracking-tighter">
                        <span className="text-teal-400">E</span>
                        <span className="text-gray-200">_mailer</span>
                    </h1>
                     <div className="flex items-center gap-2">
                        <button 
                            onClick={onUploadClick}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition duration-150 ease-in-out"
                        >
                            <Icon name="upload" className="w-5 h-5" />
                            Upload Data
                        </button>
                         <button 
                            onClick={onCheckerUploadClick}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition duration-150 ease-in-out"
                        >
                            <Icon name="check-circle" className="w-5 h-5" />
                            Check Data
                        </button>
                        <button 
                            onClick={onShowData}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition duration-150 ease-in-out"
                        >
                            <Icon name="database" className="w-5 h-5" />
                            Show Data
                        </button>
                        <button 
                            onClick={onShowTags}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition duration-150 ease-in-out"
                        >
                            <Icon name="tags" className="w-5 h-5" />
                            Tag Reference
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
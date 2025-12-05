import React from 'react';

interface LoadingModalProps {
    title: string;
    message: string;
}

export const LoadingModal = ({ title, message }: LoadingModalProps) => {
    
    return (
        React.createElement('div', { 
            className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
        },
            React.createElement('div', { 
                className: "bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-xs border border-slate-700 flex flex-col items-center gap-4"
            },
                React.createElement('div', { className: "w-10 h-10 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin" }),
                React.createElement('div', { className: "text-center" },
                    React.createElement('h3', { className: "text-lg font-bold text-white mb-1" }, title),
                    React.createElement('p', { className: "text-slate-300 text-sm" }, message)
                )
            )
        )
    );
};
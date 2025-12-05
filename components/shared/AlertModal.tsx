import React from 'react';

interface AlertModalProps {
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const AlertModal = ({ 
    title, 
    message, 
    onClose, 
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel" 
}: AlertModalProps) => {

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };
    
    // FIX: Refactored button rendering to avoid complex ternary operator inside React.createElement,
    // which can sometimes cause TypeScript type inference issues.
    // Creating the button array outside and spreading it is a more stable pattern.
    const buttons = [];
    if (onConfirm) {
        buttons.push(React.createElement('button', {
            key: 'cancel',
            onClick: onClose,
            className: "bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
        }, cancelText));
        buttons.push(React.createElement('button', {
            key: 'confirm',
            onClick: handleConfirm,
            className: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
        }, confirmText));
    } else {
        buttons.push(React.createElement('button', {
            key: 'close',
            onClick: onClose,
            className: "w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
        }, "Close"));
    }
    
    return (
        React.createElement('div', { 
            className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50",
            onClick: onClose 
        },
            React.createElement('div', { 
                className: "bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-slate-700",
                onClick: (e: React.MouseEvent) => e.stopPropagation() // Prevent closing when clicking inside the modal
            },
                React.createElement('h3', { className: "text-lg font-bold text-white mb-2" }, title),
                React.createElement('p', { className: "text-slate-300 mb-6" }, message),
                React.createElement('div', { className: "flex justify-end gap-3" },
                    ...buttons
                )
            )
        )
    );
};

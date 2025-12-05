import React, { useState } from 'react';

export const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const CopyIcon = () => React.createElement('svg', { className: "w-5 h-5", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.467-7.48-8.467s-7.48 3.907-7.48 8.467v7.5c0 .621.504 1.125 1.125 1.125h3.375m9.375-3.375H15.75m0-3.375v3.375m0-3.375l-3.375 3.375M15.75 12l3.375 3.375" })
    );

    const CheckIcon = () => React.createElement('svg', { className: "w-5 h-5 text-green-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" })
    );

    return React.createElement('button', {
        type: "button",
        className: "flex-shrink-0 p-1 text-slate-400 hover:text-white rounded-md transition-colors disabled:opacity-50",
        title: isCopied ? "Copied!" : "Copy prompt",
        onClick: handleCopy,
        disabled: isCopied
    }, isCopied ? React.createElement(CheckIcon) : React.createElement(CopyIcon));
};

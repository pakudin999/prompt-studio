import React, { useState, useEffect, useRef } from 'react';

export const InfoButton = ({ title, children }: { title: string, children?: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        React.createElement('div', { className: "relative inline-block", ref: popoverRef },
            React.createElement('button', {
                type: "button",
                onClick: () => setIsOpen(!isOpen),
                className: "flex-shrink-0 w-6 h-6 bg-slate-700 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500",
                'aria-label': "More info"
            },
                React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
                )
            ),
            isOpen && React.createElement('div', {
                className: "absolute bottom-full right-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-lg p-4 z-10"
            },
                React.createElement('h4', { className: "text-md font-bold text-purple-400 mb-2" }, title),
                React.createElement('div', { className: "text-sm text-slate-300 space-y-2 prose prose-sm prose-invert" }, children)
            )
        )
    );
};

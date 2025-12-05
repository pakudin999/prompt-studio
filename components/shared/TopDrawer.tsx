
import React, { useState } from 'react';
import { IconChevronDown, IconChevronUp, IconExternalLink } from '../icons';

export const TopDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);

    return React.createElement('div', {
        className: `fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : '-translate-y-full'}`
    },
        React.createElement('div', { className: "relative bg-slate-800/95 backdrop-blur-md border-b border-slate-600 shadow-2xl" },
            React.createElement('div', { className: "container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4" },
                React.createElement('div', { className: "flex items-center space-x-3" },
                     React.createElement('div', { className: "bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg" },
                        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "w-6 h-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" })
                        )
                     ),
                     React.createElement('div', null,
                        React.createElement('h3', { className: "font-bold text-white text-lg" }, "Google Flow AI Tools"),
                        React.createElement('p', { className: "text-slate-400 text-sm" }, "Official tools for advanced video effects & creative flows.")
                     )
                ),
                React.createElement('a', {
                    href: "https://labs.google/fx/tools/flow",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center space-x-2 bg-white text-slate-900 hover:bg-slate-200 font-bold py-2 px-5 rounded-full transition-all shadow-lg transform hover:scale-105"
                },
                    React.createElement('span', null, "Visit Website"),
                    React.createElement(IconExternalLink, { className: "w-5 h-5" })
                )
            ),
            /* Pull Tab Button - Always visible at the bottom of the drawer */
            React.createElement('div', {
                className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
            },
                React.createElement('button', {
                    onClick: () => setIsOpen(!isOpen),
                    className: "flex items-center justify-center w-16 h-8 bg-slate-800/95 hover:bg-purple-600 text-slate-400 hover:text-white border-b border-x border-slate-600 rounded-b-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:h-10 group",
                    'aria-label': isOpen ? "Close drawer" : "Open drawer"
                },
                    isOpen 
                        ? React.createElement(IconChevronUp, { className: "w-6 h-6 transition-transform duration-200 group-hover:-translate-y-0.5" }) 
                        : React.createElement(IconChevronDown, { className: "w-6 h-6 transition-transform duration-200 group-hover:translate-y-0.5" })
                )
            )
        )
    );
};

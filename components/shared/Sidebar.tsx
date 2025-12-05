import React from 'react';
import { IconChevronRight, IconCloudDatabase, IconVideoCamera, IconBrandWhatsapp } from '../icons';

const products = [
    {
        icon: IconCloudDatabase,
        title: 'Flow Account (28 Hari)',
        description: 'Pakej 1000 Kredit & Storan Google Drive 2TB.',
        price: 'RM5',
        whatsappLink: `https://wa.me/60103602036?text=${encodeURIComponent('ACCOUNT FLOW 28DAY (1000CREDIT) + 2TB GOOGLE DRIVE ada stock?')}`
    },
    {
        icon: IconVideoCamera,
        title: 'Capcut Pro (28 Hari)',
        description: 'Akaun persendirian (private) untuk akses penuh ciri Pro.',
        price: 'RM5',
        whatsappLink: `https://wa.me/60103602036?text=${encodeURIComponent('capcut pro 28day (privite) ada stock?')}`
    }
];

const ProductCard = ({ product }: { product: typeof products[0] }) => {
    return React.createElement('div', { className: "bg-slate-700 rounded-lg p-4 border border-slate-600" },
        React.createElement('div', { className: "flex items-start space-x-4 mb-4" },
            React.createElement('div', { className: "bg-slate-800 p-3 rounded-lg flex-shrink-0" },
                React.createElement(product.icon, { className: "w-8 h-8 text-cyan-400" })
            ),
            React.createElement('div', null,
                React.createElement('h4', { className: "font-bold text-white text-lg" }, product.title),
                React.createElement('p', { className: "text-sm text-slate-300 mt-1" }, product.description)
            )
        ),
        React.createElement('div', { className: "mb-4" },
            React.createElement('div', { className: "px-4 py-2 bg-green-500/20 text-green-300 text-center text-xl font-bold inline-block rounded-lg w-full" },
                `Harga: ${product.price}`
            )
        ),
        React.createElement('a', {
            href: product.whatsappLink,
            className: "flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out space-x-2",
            target: "_blank",
            rel: "noopener noreferrer"
        },
            React.createElement(IconBrandWhatsapp, { className: "w-6 h-6" }),
            React.createElement('span', null, 'Beli Sekarang di WhatsApp')
        )
    );
};

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    return React.createElement('div', {
        className: `fixed top-0 right-0 h-full bg-slate-800/95 backdrop-blur-sm border-l border-slate-700 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`,
        style: { width: '320px' }
    },
        React.createElement('div', { className: "flex flex-col h-full" },
            React.createElement('div', { className: "flex items-center justify-between p-4 border-b border-slate-700" },
                React.createElement('h2', { className: "text-lg font-semibold text-white" }, "Tawaran Istimewa"),
                React.createElement('button', {
                    onClick: onClose,
                    className: "p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors",
                    'aria-label': "Close sidebar"
                },
                    React.createElement(IconChevronRight, { className: "w-6 h-6" })
                )
            ),
            React.createElement('div', { className: "flex-grow p-4 overflow-y-auto" },
                 React.createElement('div', { className: "space-y-4" },
                    products.map((product, index) => React.createElement(ProductCard, { key: index, product: product }))
                 )
            ),
             React.createElement('div', { className: "p-4 border-t border-slate-700 text-center text-xs text-slate-500" },
                 `© ${new Date().getFullYear()} @konten_beban`
            )
        )
    );
};
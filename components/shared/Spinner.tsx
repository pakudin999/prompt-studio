import React from 'react';

export const Spinner = () => {
    return (
        React.createElement('div', {
            className: "loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6",
            style: { borderTopColor: '#a855f7' }
        }, React.createElement('style', null, `
            @keyframes spin { to { transform: rotate(360deg); } }
            .loader { animation: spin 1s linear infinite; }
        `))
    );
};

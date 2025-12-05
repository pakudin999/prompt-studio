import React from 'react';
import { COLOR_PALETTES, COLOR_COMBINATIONS } from '../../constants/colors';
import { CopyButton } from '../shared/CopyButton';
import { InfoButton } from '../shared/InfoButton';

const ColorSwatch = ({ color }: { color: { name: string, hex: string } }) => (
    React.createElement('div', { className: "flex items-center space-x-3 bg-slate-800 p-2 rounded-md" },
        React.createElement('div', {
            className: "w-8 h-8 rounded-md border-2 border-slate-600",
            style: { backgroundColor: color.hex }
        }),
        React.createElement('div', { className: "flex-1" },
            React.createElement('div', { className: "font-medium text-white" }, color.name),
            React.createElement('div', { className: "text-sm text-slate-400 font-mono" }, color.hex)
        ),
        React.createElement(CopyButton, { textToCopy: color.hex })
    )
);

export const ColorPaletteTab = React.memo(() => {
    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1" }, "Color Palette Utility"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Color Palettes" },
                    React.createElement('p', null, "A utility for browsing curated color palettes and combinations."),
                    React.createElement('p', { className: "mt-2" }, "Use these colors to inspire your designs or copy the hex codes directly for use in your projects.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Explore professionally curated color palettes and combinations for your creative projects."),
        
        React.createElement('div', { className: "mb-12" },
            React.createElement('h2', { className: "text-xl font-bold mb-4 text-purple-400 border-b-2 border-slate-700 pb-2" }, "Color Palettes"),
            React.createElement('div', { className: "space-y-6" },
                COLOR_PALETTES.map(palette => (
                    React.createElement('div', { key: palette.category },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-3" }, palette.category),
                        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" },
                            palette.colors.map(color => React.createElement(ColorSwatch, { key: color.hex, color: color }))
                        )
                    )
                ))
            )
        ),

        React.createElement('div', null,
            React.createElement('h2', { className: "text-xl font-bold mb-4 text-purple-400 border-b-2 border-slate-700 pb-2" }, "Color Combinations"),
            React.createElement('div', { className: "space-y-6" },
                COLOR_COMBINATIONS.map(combo => (
                    React.createElement('div', { key: combo.name, className: "bg-slate-700 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-3" }, combo.name),
                        React.createElement('div', { className: "flex flex-wrap gap-4" },
                            combo.colors.map(color => (
                                React.createElement('div', { key: color.hex, className: "flex-1 min-w-[180px]" },
                                     React.createElement(ColorSwatch, { color: color })
                                )
                            ))
                        )
                    )
                ))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
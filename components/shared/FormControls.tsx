import React, { useState, useEffect, useRef } from 'react';

export const SelectInput = React.memo(({ label, name, value, onChange, options, placeholder, className = "" }: { label: any, name: any, value: any, onChange: any, options: any[], placeholder: any, className?: string }) => (
    React.createElement('div', { className: className },
        React.createElement('label', { htmlFor: name, className: "block text-sm font-medium mb-1 text-slate-300" }, label),
        React.createElement('select', { id: name, name: name, value: value, onChange: onChange, className: "form-select w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" },
            React.createElement('option', { value: "" }, placeholder),
            options.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label))
        )
    )
));

export const ColorSelectInput = React.memo(({ label, name, value, onChange, options, placeholder }: { label: any, name: any, value: any, onChange: any, options: any[], placeholder: any }) => (
    React.createElement('div', null,
        React.createElement('label', { htmlFor: name, className: "block text-sm font-medium mb-1 text-slate-300" }, label),
        React.createElement('div', { className: "relative" },
            React.createElement('select', { id: name, name: name, value: value, onChange: onChange, className: "form-select appearance-none w-full bg-slate-700 rounded-lg p-2.5 pl-10 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" },
                React.createElement('option', { value: "" }, placeholder),
                options.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label))
            ),
            React.createElement('span', { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border border-slate-500 pointer-events-none", style: { backgroundColor: value || 'transparent' } }),
            React.createElement('div', { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400" },
                React.createElement('svg', { className: "fill-current h-4 w-4", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" }, React.createElement('path', { d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" }))
            )
        )
    )
));

const useDebouncedInput = (initialValue: string, name: string, onChange: (e: any) => void, delay: number = 3000) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const debounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const currentValue = e.target.value;
        setInputValue(currentValue);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = window.setTimeout(() => {
            onChange({ target: { name, value: currentValue } });
        }, delay);
    };

    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    return { inputValue, handleChange };
};

export const TextInput = React.memo(({ label, name, value, onChange, placeholder, className = "" }: { label: any, name: any, value: any, onChange: any, placeholder: any, className?: string }) => {
    const { inputValue, handleChange } = useDebouncedInput(value, name, onChange);
    
    return (
        React.createElement('div', { className: className },
            React.createElement('label', { htmlFor: name, className: "block text-sm font-medium mb-1 text-slate-300" }, label),
            React.createElement('input', { type: "text", id: name, name: name, value: inputValue, onChange: handleChange, className: "form-input w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500", placeholder: placeholder })
        )
    );
});

export const TextAreaInput = React.memo(({ label, name, value, onChange, placeholder, rows = 3, className = "" }: { label: any, name: any, value: any, onChange: any, placeholder: any, rows?: number, className?: string }) => {
    const { inputValue, handleChange } = useDebouncedInput(value, name, onChange);

    return (
        React.createElement('div', { className: className },
            React.createElement('label', { htmlFor: name, className: "block text-sm font-medium mb-1 text-slate-300" }, label),
            React.createElement('textarea', {
                id: name,
                name: name,
                value: inputValue,
                onChange: handleChange,
                rows: rows,
                className: "form-textarea w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                placeholder: placeholder
            })
        )
    );
});


export const NeonCheckbox = React.memo(({ id, name, checked, onChange, children }: { id: string, name: string, checked: boolean, onChange: (e: any) => void, children: React.ReactNode }) => (
    React.createElement('div', { className: "flex items-center" },
        React.createElement('label', { className: "neon-checkbox", htmlFor: id },
            React.createElement('input', { type: "checkbox", id, name, checked, onChange }),
            React.createElement('div', { className: "neon-checkbox__frame" },
                React.createElement('div', { className: "neon-checkbox__box" },
                    React.createElement('div', { className: "neon-checkbox__check-container" },
                        React.createElement('svg', { viewBox: "0 0 24 24", className: "neon-checkbox__check" },
                            React.createElement('path', { d: "M3,12.5l7,7L21,5" })
                        )
                    ),
                    React.createElement('div', { className: "neon-checkbox__glow" }),
                    React.createElement('div', { className: "neon-checkbox__borders" },
                        React.createElement('span'), React.createElement('span'), React.createElement('span'), React.createElement('span')
                    )
                ),
                React.createElement('div', { className: "neon-checkbox__effects" },
                    React.createElement('div', { className: "neon-checkbox__particles" },
                        ...Array(12).fill(null).map((_, i) => React.createElement('span', { key: i }))
                    ),
                    React.createElement('div', { className: "neon-checkbox__rings" },
                        React.createElement('div', { className: "ring" }), React.createElement('div', { className: "ring" }), React.createElement('div', { className: "ring" })
                    ),
                    React.createElement('div', { className: "neon-checkbox__sparks" },
                        ...Array(4).fill(null).map((_, i) => React.createElement('span', { key: i }))
                    )
                )
            )
        ),
        React.createElement('label', { className: "ml-4 text-slate-200 cursor-pointer", htmlFor: id }, children)
    )
));
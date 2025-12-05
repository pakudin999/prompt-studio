
import React, { useState, useCallback } from 'react';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';
import { TextAreaInput, TextInput } from '../shared/FormControls';
import { processWhiskBatch } from '../../services/whiskService';

export const WhiskImageTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const { apiKey, prompts, results } = formData;
    const [progress, setProgress] = useState<{ completed: number, total: number } | null>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    }, [setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!apiKey.trim()) {
            showModal('Missing Token', 'Please enter your Whisk/Google Bearer token.');
            return;
        }

        if (!prompts.trim()) {
            showModal('Missing Prompts', 'Please enter at least one prompt.');
            return;
        }

        // Clean token before sending (remove Bearer prefix if present to ensure no double Bearer)
        const cleanApiKey = apiKey.replace(/^Bearer\s+/i, '').trim();

        const totalPrompts = prompts.split('\n').filter((l: string) => l.trim() !== '').length;
        if (totalPrompts === 0) return;

        showLoadingModal('Generating Images', `Starting batch generation for ${totalPrompts} images...`);
        setProgress({ completed: 0, total: totalPrompts });
        setFormData((prev: any) => ({ ...prev, results: [] }));

        try {
            const batchResults = await processWhiskBatch(
                prompts, 
                cleanApiKey, 
                (completed, total) => {
                    setProgress({ completed, total });
                }
            );
            setFormData((prev: any) => ({ ...prev, results: batchResults }));
        } catch (error) {
            showModal('Batch Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
            setProgress(null);
        }
    };

    const downloadImage = (dataUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `whisk_gen_${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-600" }, "Whisk Image Batch"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Whisk Batch" },
                    React.createElement('p', null, "Generate images in batch using your Google Bearer token."),
                    React.createElement('p', { className: "mt-2" }, "1. Paste your **Bearer Token**."),
                    React.createElement('p', { className: "mt-1" }, "2. Paste prompts (one per line)."),
                    React.createElement('p', { className: "mt-1" }, "3. Generate.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Generate multiple images at once using your specific API token."),
        
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
            
            /* Token Input */
            React.createElement('div', { className: "bg-slate-800 p-4 rounded-xl border border-slate-700" },
                React.createElement('h3', { className: "text-lg font-semibold text-pink-400 mb-4" }, "Access Configuration"),
                React.createElement('div', { className: "space-y-4" },
                    React.createElement('div', null,
                        React.createElement('label', { htmlFor: "apiKey", className: "block text-sm font-medium mb-1 text-slate-300" }, "Bearer Token"),
                        React.createElement('input', {
                            type: "text",
                            id: "apiKey",
                            name: "apiKey",
                            value: apiKey,
                            onChange: handleChange,
                            placeholder: "ya29.a0...",
                            className: "form-input w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono text-sm"
                        }),
                        React.createElement('p', { className: "text-xs text-slate-500 mt-1" }, "Paste your full token starting with 'ya29...'")
                    )
                )
            ),

            /* Prompt Input */
            React.createElement('div', { className: "bg-slate-800 p-4 rounded-xl border border-slate-700" },
                 React.createElement('h3', { className: "text-lg font-semibold text-pink-400 mb-4" }, "Batch Prompts"),
                 React.createElement(TextAreaInput, {
                    label: "Enter Prompts (One per line)",
                    name: "prompts",
                    value: prompts,
                    onChange: handleChange,
                    rows: 10,
                    placeholder: "A futuristic city in neon lights\n\nA golden ring on a black marble table\n\nA cute cat wearing a spacesuit"
                 })
            ),

            /* Progress Bar (Visible only when processing) */
            progress && React.createElement('div', { className: "w-full bg-slate-700 rounded-full h-4 dark:bg-slate-700" },
                React.createElement('div', { 
                    className: "bg-pink-600 h-4 rounded-full transition-all duration-300", 
                    style: { width: `${(progress.completed / progress.total) * 100}%` } 
                }),
                React.createElement('p', { className: "text-center text-xs text-white mt-1" }, `Processing ${progress.completed} of ${progress.total}`)
            ),

            /* Actions */
            React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { fillRule: "evenodd", d: "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" , clipRule: "evenodd" })),
                    React.createElement('span', null, 'Generate Batch Images')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        
        results && results.length > 0 && React.createElement('div', { className: "mt-10 animate-fade-in" },
            React.createElement('h2', { className: "text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2" }, `Generated Results (${results.length})`),
            
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
                results.map((result: any, index: number) => React.createElement('div', { key: index, className: "bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg flex flex-col" },
                    
                    /* Image Area */
                    React.createElement('div', { className: "relative aspect-square bg-slate-900 flex items-center justify-center" },
                        result.imageUrl ? (
                            React.createElement('img', { src: result.imageUrl, alt: `Generated ${index}`, className: "w-full h-full object-cover" })
                        ) : (
                            React.createElement('div', { className: "text-red-400 p-4 text-center text-sm" }, result.error || "Generation Failed")
                        ),
                        result.imageUrl && React.createElement('button', {
                            onClick: () => downloadImage(result.imageUrl, index),
                            className: "absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors",
                            title: "Download Image"
                        },
                            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }))
                        )
                    ),

                    /* Prompt Area */
                    React.createElement('div', { className: "p-4 flex-1 flex flex-col" },
                        React.createElement('div', { className: "flex justify-between items-start mb-2" },
                            React.createElement('span', { className: "text-xs font-bold text-pink-500 uppercase" }, `Prompt #${index + 1}`),
                            React.createElement(CopyButton, { textToCopy: result.prompt })
                        ),
                        React.createElement('p', { className: "text-slate-300 text-sm leading-relaxed line-clamp-3" }, result.prompt)
                    )
                ))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});

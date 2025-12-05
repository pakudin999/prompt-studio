import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../../utils/fileUtils';
import { generateStyleTransferPrompt } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';

export const StyleTransferTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const { productFile, styleFile, generatedPrompt } = formData;
    const [isDraggingProduct, setIsDraggingProduct] = useState(false);
    const [isDraggingStyle, setIsDraggingStyle] = useState(false);

    const handleFile = useCallback((file: File, type: 'product' | 'style') => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showModal('Invalid File Type', 'Please upload a valid JPG or PNG image.');
            return;
        }
        
        setFormData((prev: any) => {
            const prevFile = type === 'product' ? prev.productFile : prev.styleFile;
            if (prevFile) URL.revokeObjectURL(prevFile.previewUrl);
            
            return {
                ...prev,
                [`${type}File`]: { file, previewUrl: URL.createObjectURL(file) },
                generatedPrompt: ''
            };
        });
    }, [showModal, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productFile || !styleFile) {
            showModal('Missing Images', 'Please upload BOTH a product image and a style reference image.');
            return;
        }
        showLoadingModal('Synthesizing Style', 'Applying the style of Image 2 to the Product of Image 1...');
        
        try {
            const productBase64 = await fileToBase64(productFile.file);
            const styleBase64 = await fileToBase64(styleFile.file);
            
            const prompt = await generateStyleTransferPrompt(
                productBase64, 
                productFile.file.type,
                styleBase64,
                styleFile.file.type
            );
            
            setFormData((prev: any) => ({ ...prev, generatedPrompt: prompt }));
        } catch (error) {
            showModal('Generation Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600" }, "Gold Style Transfer"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Style Transfer" },
                    React.createElement('p', null, "This tool applies the aesthetic of a reference image to your product."),
                    React.createElement('p', { className: "mt-2" }, "Upload your **Gold Product** (Image 1) and a **Style Reference** (Image 2). The AI will generate a prompt to render your specific product with the exact lighting, mood, and background of the style image.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Copy the look and feel of any image and apply it to your product."),
        
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-8" },
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
                /* Product Image Upload */
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('h3', { className: "text-center text-amber-400 font-bold" }, "1. Your Gold Product"),
                    React.createElement('div', {
                        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingProduct(true); },
                        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingProduct(false); },
                        onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingProduct(false); handleFile(e.dataTransfer.files[0], 'product'); },
                        className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[200px] flex items-center justify-center ${isDraggingProduct ? 'border-amber-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                    } as any,
                        productFile ? React.createElement(React.Fragment, null,
                            React.createElement('img', { src: productFile.previewUrl, alt: "Product preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                            React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, productFile: null, generatedPrompt: ''})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                        ) : React.createElement('div', null,
                            React.createElement('label', { htmlFor: "st-product-upload", className: "cursor-pointer text-sm text-amber-400 hover:text-amber-300 font-medium" }, "Click to upload Product"),
                            React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop")
                        ),
                        React.createElement('input', { type: "file", id: "st-product-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0], 'product') } as any)
                    )
                ),
                /* Style Image Upload */
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('h3', { className: "text-center text-blue-400 font-bold" }, "2. Style to Copy"),
                    React.createElement('div', {
                        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingStyle(true); },
                        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingStyle(false); },
                        onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingStyle(false); handleFile(e.dataTransfer.files[0], 'style'); },
                        className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[200px] flex items-center justify-center ${isDraggingStyle ? 'border-blue-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                    } as any,
                        styleFile ? React.createElement(React.Fragment, null,
                            React.createElement('img', { src: styleFile.previewUrl, alt: "Style preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                            React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, styleFile: null, generatedPrompt: ''})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                        ) : React.createElement('div', null,
                            React.createElement('label', { htmlFor: "st-style-upload", className: "cursor-pointer text-sm text-blue-400 hover:text-blue-300 font-medium" }, "Click to upload Reference"),
                            React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop")
                        ),
                        React.createElement('input', { type: "file", id: "st-style-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0], 'style') } as any)
                    )
                )
            ),
            
            React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { fillRule: "evenodd", d: "M13.5 4.938a7 7 0 11-9.006 1.737c.202-.257.596-.218.797.061l.957 1.327a1 1 0 01-1.618 1.166l-.956-1.327a1 1 0 01-.19-.481 9.002 9.002 0 1012.37-2.355l-1.326.957a1 1 0 01-1.167-1.618l1.327-.957a1 1 0 01.481-.19z", clipRule: "evenodd" })),
                    React.createElement('span', null, 'Generate Style Transfer Prompt')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        
        generatedPrompt && React.createElement('div', { className: "mt-10 animate-fade-in" },
            React.createElement('h2', { className: "text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2" }, "Synthesized Prompt"),
            
            React.createElement('div', { className: "bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg" },
                React.createElement('div', { className: "flex items-center justify-between mb-3" },
                    React.createElement('h3', { className: "text-lg font-bold text-amber-400" }, "Product + Style"),
                    React.createElement(CopyButton, { textToCopy: generatedPrompt })
                ),
                React.createElement('textarea', { value: generatedPrompt, className: "w-full bg-transparent border-0 text-slate-300 focus:ring-0 resize-none italic text-sm leading-relaxed", rows: 6, readOnly: true })
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../../utils/fileUtils';
import { generateGoogleFlowCompositePrompts } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';

export const GoogleFlowTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const { contextFile, productFile, results } = formData;
    const [isDraggingContext, setIsDraggingContext] = useState(false);
    const [isDraggingProduct, setIsDraggingProduct] = useState(false);

    const handleFile = useCallback((file: File, type: 'context' | 'product') => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showModal('Invalid File Type', 'Please upload a valid JPG or PNG image.');
            return;
        }
        
        setFormData((prev: any) => {
            const prevFile = type === 'context' ? prev.contextFile : prev.productFile;
            if (prevFile) URL.revokeObjectURL(prevFile.previewUrl);
            
            return {
                ...prev,
                [`${type}File`]: { file, previewUrl: URL.createObjectURL(file) },
                results: null 
            };
        });
    }, [showModal, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contextFile || !productFile) {
            showModal('Missing Images', 'Please upload BOTH a context/model image and a product image.');
            return;
        }
        showLoadingModal('Analyzing Composition', 'The AI is studying both images to create seamless video composites...');
        
        try {
            const contextBase64 = await fileToBase64(contextFile.file);
            const productBase64 = await fileToBase64(productFile.file);
            
            const promptResults = await generateGoogleFlowCompositePrompts(
                contextBase64, 
                productBase64, 
                contextFile.file.type,
                productFile.file.type
            );
            
            setFormData((prev: any) => ({ ...prev, results: promptResults }));
        } catch (error) {
            showModal('Generation Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500" }, "Google Flow: Material to Video"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Google Flow Video Tool" },
                    React.createElement('p', null, "This tool generates professional video prompts for composite AI workflows (like Veo or Google Flow)."),
                    React.createElement('p', { className: "mt-2" }, "Upload a **Context Image** (Background/Model) and a **Product Image**. The AI will analyze both to generate prompts that blend the product seamlessly into the context.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Create prompts to transform static assets into dynamic composite videos."),
        
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-8" },
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
                /* Context Image Upload */
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('h3', { className: "text-center text-slate-300 font-semibold" }, "1. Context / Model / Background"),
                    React.createElement('div', {
                        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingContext(true); },
                        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingContext(false); },
                        onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingContext(false); handleFile(e.dataTransfer.files[0], 'context'); },
                        className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[200px] flex items-center justify-center ${isDraggingContext ? 'border-blue-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                    } as any,
                        contextFile ? React.createElement(React.Fragment, null,
                            React.createElement('img', { src: contextFile.previewUrl, alt: "Context preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                            React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, contextFile: null, results: null})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                        ) : React.createElement('div', null,
                            React.createElement('label', { htmlFor: "context-upload", className: "cursor-pointer text-sm text-blue-400 hover:text-blue-300 font-medium" }, "Click to upload Context"),
                            React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop")
                        ),
                        React.createElement('input', { type: "file", id: "context-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0], 'context') } as any)
                    )
                ),
                /* Product Image Upload */
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('h3', { className: "text-center text-slate-300 font-semibold" }, "2. Product Image"),
                    React.createElement('div', {
                        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingProduct(true); },
                        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingProduct(false); },
                        onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingProduct(false); handleFile(e.dataTransfer.files[0], 'product'); },
                        className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[200px] flex items-center justify-center ${isDraggingProduct ? 'border-purple-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                    } as any,
                        productFile ? React.createElement(React.Fragment, null,
                            React.createElement('img', { src: productFile.previewUrl, alt: "Product preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                            React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, productFile: null, results: null})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                        ) : React.createElement('div', null,
                            React.createElement('label', { htmlFor: "product-upload", className: "cursor-pointer text-sm text-purple-400 hover:text-purple-300 font-medium" }, "Click to upload Product"),
                            React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop")
                        ),
                        React.createElement('input', { type: "file", id: "product-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0], 'product') } as any)
                    )
                )
            ),
            
            React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, 'Analyze & Generate Composite Prompts')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        
        results && React.createElement('div', { className: "mt-10 space-y-6 animate-fade-in" },
            React.createElement('h2', { className: "text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2" }, "Generated Video Compositing Prompts"),
            
            /* Realistic Blend */
            React.createElement('div', { className: "bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg" },
                React.createElement('div', { className: "flex items-center justify-between mb-3" },
                    React.createElement('h3', { className: "text-lg font-bold text-blue-400" }, "1. Realistic Blend"),
                    React.createElement(CopyButton, { textToCopy: results.realistic_blend })
                ),
                React.createElement('p', { className: "text-slate-300 italic text-sm leading-relaxed" }, `"${results.realistic_blend}"`)
            ),
            
            /* Luxury Commercial */
            React.createElement('div', { className: "bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg" },
                React.createElement('div', { className: "flex items-center justify-between mb-3" },
                    React.createElement('h3', { className: "text-lg font-bold text-purple-400" }, "2. Luxury Commercial"),
                    React.createElement(CopyButton, { textToCopy: results.luxury_commercial })
                ),
                React.createElement('p', { className: "text-slate-300 italic text-sm leading-relaxed" }, `"${results.luxury_commercial}"`)
            ),
            
            /* Creative Transformation */
            React.createElement('div', { className: "bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg" },
                React.createElement('div', { className: "flex items-center justify-between mb-3" },
                    React.createElement('h3', { className: "text-lg font-bold text-pink-400" }, "3. Creative Transformation"),
                    React.createElement(CopyButton, { textToCopy: results.creative_transformation })
                ),
                React.createElement('p', { className: "text-slate-300 italic text-sm leading-relaxed" }, `"${results.creative_transformation}"`)
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
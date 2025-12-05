import React, { useState, useCallback } from 'react';
import { PRODUCT_BACKGROUND_STYLES } from '../../constants/options';
import { fileToBase64 } from '../../utils/fileUtils';
import { generateProductBackgroundPrompt } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';
import { TextAreaInput } from '../shared/FormControls';

export const ProductBackgroundPromptTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const [isDragging, setIsDragging] = useState(false);

    const { uploadedFile, style, keywords, generatedPrompt } = formData;

    const handleFile = useCallback((file: File) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showModal('Invalid File Type', 'Please upload a valid JPG or PNG image.');
            return;
        }
        if (uploadedFile) URL.revokeObjectURL(uploadedFile.previewUrl);
        setFormData((prev: any) => ({...prev, uploadedFile: { file, previewUrl: URL.createObjectURL(file) }}));
    }, [showModal, uploadedFile, setFormData]);

    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }, [handleFile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedFile) {
            showModal('No Image', 'Please upload a product image.');
            return;
        }
        showLoadingModal('Generating Background', 'The AI set designer is building your scene...');
        setFormData((prev: any) => ({...prev, generatedPrompt: ''}));
        try {
            const base64ImageData = await fileToBase64(uploadedFile.file);
            const prompt = await generateProductBackgroundPrompt(base64ImageData, uploadedFile.file.type, style, keywords);
            setFormData((prev: any) => ({...prev, generatedPrompt: prompt}));
        } catch (error) {
            showModal('Generation Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold text-center flex-1" }, "Product Background Prompt Generator"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Background Prompts" },
                    React.createElement('p', null, "This tool designs a creative background scene for your product."),
                    React.createElement('p', { className: "mt-2" }, "Upload a product image, choose a style, and add optional keywords. The AI will generate a prompt describing a beautiful setting, complete with props and lighting, but will ignore the product itself. This allows you to generate a background and composite your product onto it later.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Generate professional backgrounds and settings for your product photography."),
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-start" },
                 React.createElement('div', {
                    onDragOver: onDragOver,
                    onDragLeave: onDragLeave,
                    onDrop: onDrop,
                    className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[180px] flex items-center justify-center ${isDragging ? 'border-purple-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                },
                    uploadedFile ? React.createElement(React.Fragment, null,
                        React.createElement('img', { src: uploadedFile.previewUrl, alt: "Product preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                        React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, uploadedFile: null})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                    ) : React.createElement('div', null,
                        React.createElement('label', { htmlFor: "bg-product-image-upload", className: "cursor-pointer text-sm text-purple-400 hover:text-purple-300 font-medium" }, "Click to upload"),
                        React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop product image")
                    ),
                    React.createElement('input', { type: "file", id: "bg-product-image-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0]) } as any)
                ),
                React.createElement('div', { className: "space-y-4" },
                    React.createElement('div', null,
                        React.createElement('label', { htmlFor: "style", className: "block text-sm font-medium mb-1 text-slate-300" }, "Background Style"),
                        React.createElement('select', {
                            id: "style",
                            name: "style",
                            value: style,
                            onChange: (e: any) => setFormData((prev: any) => ({...prev, style: e.target.value})),
                            className: "form-select w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        } as any,
                            PRODUCT_BACKGROUND_STYLES.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label))
                        )
                    ),
                    React.createElement(TextAreaInput, {
                        label: "Optional Keywords / Props to Include",
                        name: "keywords",
                        value: keywords,
                        onChange: (e: any) => setFormData((prev: any) => ({...prev, keywords: e.target.value})),
                        rows: 4,
                        placeholder: "e.g., black rose, water ripples, silk fabric"
                    })
                )
            ),
             React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, 'Generate Background Prompt')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        generatedPrompt && React.createElement('div', { className: "mt-8" },
            React.createElement('h2', { className: "text-lg font-semibold mb-3 text-slate-200" }, "Generated Background Prompt"),
            React.createElement('div', { className: "relative bg-slate-900 rounded-lg p-4 border border-slate-700" },
                React.createElement('textarea', { value: generatedPrompt, className: "w-full bg-transparent border-0 text-slate-300 focus:ring-0 resize-none pr-10", rows: 5, readOnly: true }),
                React.createElement('div', { className: "absolute top-3 right-3" }, React.createElement(CopyButton, { textToCopy: generatedPrompt }))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
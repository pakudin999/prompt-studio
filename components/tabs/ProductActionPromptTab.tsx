import React, { useState, useCallback } from 'react';
import { PRODUCT_ACTION_OPTIONS, PRODUCT_ACTION_STYLES, PRODUCT_ANGLE_OPTIONS } from '../../constants/options';
import { processBatchProductActionPrompts } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';
import { TextAreaInput } from '../shared/FormControls';

export const ProductActionPromptTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const [isDragging, setIsDragging] = useState(false);

    const { uploadedFiles, actionDescription, customActionDescription, style, angle, results } = formData;

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        const imageFiles = Array.from(files).filter((file: File) => ['image/jpeg', 'image/png'].includes(file.type));
        
        if (imageFiles.length === 0) {
            showModal('Invalid File Type', 'Please upload valid JPG or PNG images.');
            return;
        }

        const newSelectedFiles = imageFiles.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));

        setFormData((prev: any) => {
            // Revoke old URLs to prevent memory leaks if replacing
             // (Optional logic: append or replace? Replace feels cleaner for batch reset)
             if (prev.uploadedFiles) {
                 prev.uploadedFiles.forEach((f: any) => URL.revokeObjectURL(f.previewUrl));
             }
             return { ...prev, uploadedFiles: newSelectedFiles, results: [] };
        });
    }, [showModal, setFormData]);

    const handleClearFiles = useCallback(() => {
        if (uploadedFiles) {
            uploadedFiles.forEach((f: any) => URL.revokeObjectURL(f.previewUrl));
        }
        setFormData((prev: any) => ({ ...prev, uploadedFiles: [], results: [] }));
    }, [uploadedFiles, setFormData]);

    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }, [handleFiles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalAction = customActionDescription.trim() || actionDescription;
        if (!uploadedFiles || uploadedFiles.length === 0) {
            showModal('No Images', 'Please upload at least one product image.');
            return;
        }
        if (!finalAction) {
            showModal('Action Required', 'Please select an action or write your own for the product.');
            return;
        }
        
        showLoadingModal('Generating Prompts', `The creative director is crafting prompts for ${uploadedFiles.length} image(s)...`);
        setFormData((prev: any) => ({...prev, results: []}));
        
        try {
            const promptResults = await processBatchProductActionPrompts(uploadedFiles, finalAction, style, angle);
            setFormData((prev: any) => ({...prev, results: promptResults}));
        } catch (error) {
            showModal('Generation Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1" }, "Product Action Prompt Generator (Batch)"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Batch Action Prompts" },
                    React.createElement('p', null, "This tool creates professional image prompts for multiple products at once."),
                    React.createElement('p', { className: "mt-2" }, "Upload a batch of images, select one action/style configuration, and the AI will generate a unique, tailored prompt for each individual image.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Generate consistent yet unique professional image prompts for a whole batch of product images."),
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-start" },
                 React.createElement('div', {
                    onDragOver: onDragOver,
                    onDragLeave: onDragLeave,
                    onDrop: onDrop,
                    className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[250px] flex flex-col items-center justify-center ${isDragging ? 'border-purple-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                },
                    uploadedFiles && uploadedFiles.length > 0 ? React.createElement(React.Fragment, null,
                        React.createElement('div', { className: "grid grid-cols-3 gap-2 w-full mb-2 max-h-60 overflow-y-auto custom-scrollbar p-2" },
                             uploadedFiles.map((fileData: any, index: number) => 
                                React.createElement('img', { key: index, src: fileData.previewUrl, alt: `Preview ${index}`, className: "h-20 w-full object-cover rounded-md border border-slate-500" })
                             )
                        ),
                        React.createElement('p', { className: "text-sm text-white font-medium mb-2" }, `${uploadedFiles.length} image(s) selected`),
                        React.createElement('div', { className: "flex gap-2" },
                             React.createElement('label', { htmlFor: "batch-action-upload", className: "cursor-pointer bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-3 rounded transition-colors" }, "Add More"),
                             React.createElement('button', { type: "button", onClick: handleClearFiles, className: "bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded transition-colors" }, "Clear All")
                        )
                    ) : React.createElement('div', null,
                        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-slate-500 mx-auto mb-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })),
                        React.createElement('label', { htmlFor: "batch-action-upload", className: "cursor-pointer text-lg text-purple-400 hover:text-purple-300 font-bold block" }, "Click to upload images"),
                        React.createElement('p', { className: "text-sm text-slate-400 mt-1" }, "or drag & drop multiple files")
                    ),
                    React.createElement('input', { type: "file", id: "batch-action-upload", className: "hidden", accept: "image/jpeg,image/png", multiple: true, onChange: (e: any) => handleFiles(e.target.files) } as any)
                ),
                React.createElement('div', { className: "space-y-4" },
                    React.createElement('div', null,
                        React.createElement('label', { htmlFor: "actionDescription", className: "block text-sm font-medium mb-1 text-slate-300" }, "Select Product Action (Suggested)"),
                        React.createElement('select', {
                            id: "actionDescription",
                            name: "actionDescription",
                            value: actionDescription,
                            onChange: (e: any) => setFormData((prev: any) => ({...prev, actionDescription: e.target.value, customActionDescription: ''})) ,
                            className: "form-select w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        } as any,
                            PRODUCT_ACTION_OPTIONS.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label))
                        )
                    ),
                    React.createElement(TextAreaInput, {
                        label: "Or Write Your Own Action (AI will elaborate)",
                        name: "customActionDescription",
                        value: customActionDescription,
                        onChange: (e: any) => setFormData((prev: any) => ({...prev, customActionDescription: e.target.value})),
                        rows: 3,
                        placeholder: "e.g., held in hand"
                    }),
                    React.createElement('div', null,
                        React.createElement('label', { htmlFor: "style", className: "block text-sm font-medium mb-1 text-slate-300" }, "Photographic Style"),
                        React.createElement('select', { id: "style", name: "style", value: style, onChange: (e: any) => setFormData((prev: any) => ({...prev, style: e.target.value})), className: "form-select w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" } as any,
                            PRODUCT_ACTION_STYLES.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label))
                        )
                    ),
                    React.createElement('div', null,
                        React.createElement('label', { htmlFor: "angle", className: "block text-sm font-medium mb-1 text-slate-300" }, "Camera Angle"),
                        React.createElement('select', { id: "angle", name: "angle", value: angle, onChange: (e: any) => setFormData((prev: any) => ({...prev, angle: e.target.value})), className: "form-select w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" },
                            PRODUCT_ANGLE_OPTIONS.map(opt => React.createElement('option', { key: opt.value, value: opt.value }, opt.label))
                        )
                    )
                )
            ),
             React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, 'Generate Batch Prompts')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        results && results.length > 0 && React.createElement('div', { className: "mt-8" },
            React.createElement('h2', { className: "text-lg font-semibold mb-3 text-slate-200" }, `Generated Image Prompts (${results.length})`),
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
                results.map((result: any, index: number) => React.createElement('div', { key: index, className: `bg-slate-700 rounded-lg overflow-hidden shadow-lg border ${result.error ? 'border-red-500' : 'border-slate-600'}` },
                    React.createElement('div', { className: "h-48 w-full bg-slate-800 flex items-center justify-center overflow-hidden" },
                        React.createElement('img', { src: result.previewUrl, alt: `Result ${index}`, className: "w-full h-full object-cover" })
                    ),
                    React.createElement('div', { className: "p-4" },
                        React.createElement('div', { className: "flex justify-between items-start mb-2" },
                            React.createElement('h3', { className: "font-semibold text-white text-sm truncate w-3/4", title: result.fileName }, result.fileName),
                            result.prompt && React.createElement(CopyButton, { textToCopy: result.prompt })
                        ),
                        result.prompt ? 
                            React.createElement('div', { className: "max-h-40 overflow-y-auto custom-scrollbar pr-1" },
                                React.createElement('p', { className: "text-slate-300 text-sm italic leading-relaxed" }, `"${result.prompt}"`)
                            )
                        : React.createElement('p', { className: "text-red-400 text-xs" }, result.error || "Failed to generate prompt.")
                    )
                ))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
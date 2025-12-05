import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../../utils/fileUtils';
import { generateViralBatchPrompts } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';

export const BatchViralPromptTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const [isDragging, setIsDragging] = useState(false);

    const { uploadedFile, promptCount, results } = formData;

    const handleFile = useCallback((file: File) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showModal('Invalid File Type', 'Please upload a valid JPG or PNG image.');
            return;
        }
        if (uploadedFile) URL.revokeObjectURL(uploadedFile.previewUrl);
        setFormData((prev: any) => ({...prev, uploadedFile: { file, previewUrl: URL.createObjectURL(file) }, results: null }));
    }, [showModal, uploadedFile, setFormData]);

    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }, [handleFile]);
    
    const copyAllPrompts = useCallback(() => {
        if (results && results.length > 0) {
            const allPromptsText = results.join('\n\n');
            navigator.clipboard.writeText(allPromptsText);
            showModal("Copied!", "All prompts have been copied to your clipboard.");
        }
    }, [results, showModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedFile) {
            showModal('No Image', 'Please upload a product image.');
            return;
        }
        showLoadingModal('Generating Ideas', `The AI is brainstorming ${promptCount} viral video concepts...`);
        setFormData((prev: any) => ({...prev, results: null}));
        try {
            const base64ImageData = await fileToBase64(uploadedFile.file);
            const prompts = await generateViralBatchPrompts(base64ImageData, uploadedFile.file.type, promptCount);
            setFormData((prev: any) => ({...prev, results: prompts}));
        } catch (error) {
            showModal('Generation Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold text-center flex-1" }, "Batch Viral Prompt Generator"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Batch Viral Prompts" },
                    React.createElement('p', null, "This tool generates multiple creative, viral video concepts for your product from a single image."),
                    React.createElement('p', { className: "mt-2" }, "Upload your product, specify how many ideas you want, and the AI will brainstorm short-form video prompts tailored for platforms like TikTok and Instagram.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Generate multiple viral short-form video ideas from a single product image."),
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
                        React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, uploadedFile: null, results: null })), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                    ) : React.createElement('div', null,
                        React.createElement('label', { htmlFor: "batch-image-upload", className: "cursor-pointer text-sm text-purple-400 hover:text-purple-300 font-medium" }, "Click to upload"),
                        React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop product image")
                    ),
                    React.createElement('input', { type: "file", id: "batch-image-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0]) } as any)
                ),
                React.createElement('div', { className: "space-y-4" },
                    React.createElement('div', null,
                        React.createElement('label', { htmlFor: "promptCount", className: "block text-sm font-medium mb-1 text-slate-300" }, "Number of Prompts to Generate"),
                        React.createElement('input', {
                            id: "promptCount",
                            type: "number",
                            min: "1",
                            value: promptCount,
                            onChange: (e: any) => setFormData((prev: any) => ({...prev, promptCount: parseInt(e.target.value) || 1 })),
                            className: "form-input w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        })
                    )
                )
            ),
             React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, 'Generate Viral Ideas')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        results && results.length > 0 && React.createElement('div', { className: "mt-8" },
             React.createElement('div', { className: "flex justify-between items-center mb-3" },
                React.createElement('h2', { className: "text-lg font-semibold text-slate-200" }, `Generated Viral Ideas (${results.length})`),
                React.createElement('button', { onClick: copyAllPrompts, className: "flex items-center space-x-2 bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" },
                        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.467-7.48-8.467s-7.48 3.907-7.48 8.467v7.5c0 .621.504 1.125 1.125 1.125h3.375m9.375-3.375H15.75m0-3.375v3.375m0-3.375l-3.375 3.375M15.75 12l3.375 3.375" })
                    ),
                    React.createElement('span', null, "Copy All Prompts")
                )
            ),
            React.createElement('div', { className: "space-y-3" },
                results.map((prompt: string, index: number) => React.createElement('div', { key: index, className: "bg-slate-700 rounded-lg p-3 flex justify-between items-center" },
                    React.createElement('p', { className: "text-slate-300 text-sm italic" }, `"${prompt}"`),
                    React.createElement(CopyButton, { textToCopy: prompt })
                ))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
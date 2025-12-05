
import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../../utils/fileUtils';
import { generatePosterPrompt } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';
import { TextAreaInput } from '../shared/FormControls';
import { RetroToggleSwitch } from '../shared/RetroToggleSwitch';

export const PosterGeneratorTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const { uploadedFile, personFile, posterDescription, generatedPrompt, isProMode } = formData;
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingPerson, setIsDraggingPerson] = useState(false);

    const handleFile = useCallback((file: File, type: 'style' | 'person') => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showModal('Invalid File Type', 'Please upload a valid JPG or PNG image.');
            return;
        }
        
        setFormData((prev: any) => {
            const targetFile = type === 'style' ? prev.uploadedFile : prev.personFile;
            if (targetFile) URL.revokeObjectURL(targetFile.previewUrl);
            
            return {
                ...prev,
                [type === 'style' ? 'uploadedFile' : 'personFile']: { file, previewUrl: URL.createObjectURL(file) },
                generatedPrompt: ''
            };
        });
    }, [showModal, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedFile) {
            showModal('Missing Style Image', 'Please upload a Style Reference image.');
            return;
        }
        if (isProMode && !personFile) {
            showModal('Missing Person Image', 'Pro Mode is ON. Please upload an image of the person you want to composite.');
            return;
        }
        if (!posterDescription.trim()) {
            showModal('Missing Description', 'Please enter a description for your poster.');
            return;
        }

        const modeText = isProMode ? 'Pro Mode: Compositing Person into Poster...' : 'Designing Poster Prompt...';
        showLoadingModal('Generating Prompt', modeText);
        
        try {
            const styleBase64 = await fileToBase64(uploadedFile.file);
            let personBase64 = null;
            if (isProMode && personFile) {
                personBase64 = await fileToBase64(personFile.file);
            }
            
            const prompt = await generatePosterPrompt(
                styleBase64,
                uploadedFile.file.type,
                posterDescription,
                personBase64,
                personFile?.file.type
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
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500" }, "Poster Prompt Generator"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Poster Generator" },
                    React.createElement('p', null, "This tool generates prompts for posters by combining your text content with the visual style of a reference image."),
                    React.createElement('p', { className: "mt-2" }, "1. Upload a **Style Reference** (for layout/colors).\n2. Describe your **Poster Content**.\n3. Get a prompt that applies the style to your topic."),
                     React.createElement('p', { className: "mt-2 font-bold text-orange-400" }, "Pro Mode: Upload a specific person to be composited into the poster style.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Create professional poster prompts by analyzing the style of a reference image."),
        
        React.createElement('div', { className: "mb-6 flex justify-center" },
             React.createElement('div', { className: "flex items-center bg-slate-800 p-3 rounded-full border border-slate-700 shadow-md" },
                React.createElement(RetroToggleSwitch, {
                    id: "poster-pro-mode",
                    checked: isProMode || false,
                    onChange: () => setFormData((prev: any) => ({ ...prev, isProMode: !prev.isProMode }))
                }),
                React.createElement('label', { htmlFor: "poster-pro-mode", className: "ml-4 cursor-pointer mr-2" },
                    React.createElement('div', { className: "text-sm font-bold text-white uppercase tracking-wider" }, "Pro Mode: Composite Person"),
                )
             )
        ),
        
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-8" },
            React.createElement('div', { className: `grid grid-cols-1 ${isProMode ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 transition-all duration-500 ease-in-out` },
                /* Style Reference Upload */
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('h3', { className: "text-center text-orange-400 font-bold" }, "1. Style Reference Image"),
                    React.createElement('div', {
                        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
                        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); },
                        onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0], 'style'); },
                        className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[200px] flex items-center justify-center ${isDragging ? 'border-orange-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                    } as any,
                        uploadedFile ? React.createElement(React.Fragment, null,
                            React.createElement('img', { src: uploadedFile.previewUrl, alt: "Style preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                            React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, uploadedFile: null, generatedPrompt: ''})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                        ) : React.createElement('div', null,
                            React.createElement('label', { htmlFor: "poster-upload", className: "cursor-pointer text-sm text-orange-400 hover:text-orange-300 font-medium" }, "Click to upload Reference"),
                            React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop")
                        ),
                        React.createElement('input', { type: "file", id: "poster-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0], 'style') } as any)
                    )
                ),
                
                 /* Person Image Upload (Pro Mode Only) */
                 isProMode && React.createElement('div', { className: "space-y-2 animate-fade-in" },
                    React.createElement('h3', { className: "text-center text-green-400 font-bold" }, "2. Person to Composite"),
                    React.createElement('div', {
                        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingPerson(true); },
                        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingPerson(false); },
                        onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDraggingPerson(false); handleFile(e.dataTransfer.files[0], 'person'); },
                        className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[200px] flex items-center justify-center ${isDraggingPerson ? 'border-green-500 border-dashed bg-slate-600' : 'border-slate-600'}`
                    } as any,
                        personFile ? React.createElement(React.Fragment, null,
                            React.createElement('img', { src: personFile.previewUrl, alt: "Person preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                            React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, personFile: null, generatedPrompt: ''})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                        ) : React.createElement('div', null,
                            React.createElement('label', { htmlFor: "person-upload", className: "cursor-pointer text-sm text-green-400 hover:text-green-300 font-medium" }, "Click to upload Person"),
                            React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop")
                        ),
                        React.createElement('input', { type: "file", id: "person-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0], 'person') } as any)
                    )
                ),

                /* Content Description */
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('h3', { className: "text-center text-slate-200 font-bold" }, isProMode ? "3. Poster Content" : "2. Poster Content"),
                    React.createElement(TextAreaInput, {
                        label: "Describe your poster topic:",
                        name: "posterDescription",
                        value: posterDescription,
                        onChange: (e: any) => setFormData((prev: any) => ({...prev, posterDescription: e.target.value})),
                        rows: 8,
                        placeholder: "e.g., A vintage travel poster for Mars. Feature a red landscape, a retro rocket ship, and bold typography saying 'Visit Mars'."
                    })
                )
            ),
            
            React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { fillRule: "evenodd", d: "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" , clipRule: "evenodd" })),
                    React.createElement('span', null, 'Generate Poster Prompt')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        
        generatedPrompt && React.createElement('div', { className: "mt-10 animate-fade-in" },
            React.createElement('h2', { className: "text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2" }, "Generated Poster Prompt"),
            
            React.createElement('div', { className: "bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg" },
                React.createElement('div', { className: "flex items-center justify-between mb-3" },
                    React.createElement('h3', { className: "text-lg font-bold text-orange-400" }, isProMode ? "Content + Style + Composited Person" : "Content + Style"),
                    React.createElement(CopyButton, { textToCopy: generatedPrompt })
                ),
                React.createElement('textarea', { value: generatedPrompt, className: "w-full bg-transparent border-0 text-slate-300 focus:ring-0 resize-none italic text-sm leading-relaxed", rows: 6, readOnly: true })
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});

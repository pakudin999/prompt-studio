import React, { useState, useCallback } from 'react';
import { InfoButton } from '../shared/InfoButton';
import { RetroToggleSwitch } from '../shared/RetroToggleSwitch';
import { CopyButton } from '../shared/CopyButton';
import { processFilesForPrompts, processFilesForAdvancedPrompts } from '../../services/geminiService';

export const MovementPromptTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: (title: string, message: string) => void, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: (data: any) => void, onReset: () => void }) => {
    const { selectedFiles, results } = formData;
    const [isDragging, setIsDragging] = useState(false);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [includeLightMovement, setIncludeLightMovement] = useState(false);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        const imageFiles = Array.from(files).filter((file: File) => ['image/jpeg', 'image/png'].includes(file.type));
        if (imageFiles.length === 0) {
            showModal('Invalid File Type', 'Please upload valid JPG or PNG images.');
            return;
        }
        const newSelectedFiles = imageFiles.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
        setFormData((prev: any) => {
            prev.selectedFiles.forEach((f: any) => URL.revokeObjectURL(f.previewUrl));
            return { ...prev, selectedFiles: newSelectedFiles, results: [] };
        });
    }, [showModal, setFormData]);

    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }, [handleFiles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            showModal('No Images', 'Please upload at least one reference image to analyze.');
            return;
        }
        
        const analysisType = isAdvancedMode ? "Advanced Analysis" : "Analysis";
        const promptCount = isAdvancedMode ? 3 : 1;
        showLoadingModal(
            `Running ${analysisType}`, 
            `Generating ${promptCount * selectedFiles.length} prompt(s) for ${selectedFiles.length} image(s)...`
        );
        setFormData((prev: any) => ({ ...prev, results: [] }));

        try {
            const promptResults = isAdvancedMode
                ? await processFilesForAdvancedPrompts(selectedFiles, includeLightMovement)
                : await processFilesForPrompts(selectedFiles, includeLightMovement);
            
            setFormData((prev: any) => ({ ...prev, results: promptResults }));
        } catch (error) {
            showModal('Analysis Failed', 'An unexpected error occurred during prompt generation.');
        } finally {
            hideLoadingModal();
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1" }, "Per-Image Video Prompt Generator"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Video Prompt Generator" },
                    React.createElement('p', null, "This tool analyzes your uploaded images and generates professional camera movement prompts for each one, perfect for creating dynamic video scenes."),
                    React.createElement('ul', { className: "list-disc list-inside mt-2" },
                        React.createElement('li', null, React.createElement('strong', null, "Standard Mode:"), " Generates one high-quality prompt per image."),
                        React.createElement('li', null, React.createElement('strong', null, "Advanced Mode:"), " Provides three distinct, creative prompt options for each image."),
                        React.createElement('li', null, React.createElement('strong', null, "Sparkle Mode:"), " Adds a subtle light glint effect to the prompt.")
                    )
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Upload images to get unique, AI-generated professional camera movement prompts for each one."),
        React.createElement('div', { className: "mb-8" },
            React.createElement('h2', { className: "text-lg font-semibold mb-3 text-slate-200" }, "Reference Images"),
            React.createElement('div', { onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop, className: `bg-slate-700 rounded-lg p-6 text-center border-2 transition-all duration-300 ${isDragging ? 'border-purple-500 border-dashed bg-slate-600' : 'border-transparent'}` },
                React.createElement('p', { className: "font-medium text-slate-300 mb-2" }, selectedFiles.length > 0 ? `${selectedFiles.length} images selected.` : 'No images selected'),
                React.createElement('label', { htmlFor: "image-upload", className: "cursor-pointer text-sm text-purple-400 hover:text-purple-300" }, "Click to upload or drag & drop images here"),
                React.createElement('input', { type: "file", id: "image-upload", className: "hidden", accept: "image/jpeg,image/png", multiple: true, onChange: (e) => handleFiles(e.target.files) })
            )
        ),
        React.createElement('div', { className: "my-6 space-y-4" },
            React.createElement('div', { className: "flex items-center bg-slate-700 p-3 rounded-lg hover:bg-slate-600/50 transition-colors" },
                React.createElement(RetroToggleSwitch, {
                    id: "advanced-toggle",
                    checked: isAdvancedMode,
                    onChange: () => setIsAdvancedMode(!isAdvancedMode)
                }),
                React.createElement('label', { htmlFor: "advanced-toggle", className: "ml-8 cursor-pointer" },
                    React.createElement('div', { className: "text-base font-bold text-slate-100" }, "Advanced Analysis Mode"),
                    React.createElement('div', { className: "text-xs text-slate-400" }, "1000x deeper analysis to generate 3 professional-grade prompt options.")
                )
            ),
            React.createElement('div', { className: "flex items-center bg-slate-700 p-3 rounded-lg hover:bg-slate-600/50 transition-colors" },
                React.createElement(RetroToggleSwitch, {
                    id: "light-movement-toggle",
                    checked: includeLightMovement,
                    onChange: () => setIncludeLightMovement(!includeLightMovement)
                }),
                React.createElement('label', { htmlFor: "light-movement-toggle", className: "ml-8 cursor-pointer" },
                    React.createElement('div', { className: "text-base font-bold text-slate-100" }, "Basic Sparkle Mode"),
                    React.createElement('div', { className: "text-xs text-slate-400" }, "The AI will add a simple and suitable 'sparkle' or light glint effect to highlight the gold product.")
                )
            )
        ),
        React.createElement('form', { onSubmit: handleSubmit },
             React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, isAdvancedMode ? 'Run Advanced Analysis' : 'Analyze & Generate Prompts')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        results.length > 0 && React.createElement('div', { id: "result-section", className: "mt-8" },
            React.createElement('h2', { className: "text-lg font-semibold mb-3 text-slate-200" }, "Generated Prompts"),
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" },
                results.map((result: any, index: number) => React.createElement('div', { key: index, className: `bg-slate-700 rounded-lg overflow-hidden shadow-lg ${result.error ? 'border border-red-500' : ''}` },
                    React.createElement('img', { src: result.previewUrl, alt: `Preview of ${result.fileName}`, className: "w-full h-48 object-cover" }),
                    React.createElement('div', { className: "p-4" },
                        React.createElement('h3', { className: `font-semibold mb-3 text-sm truncate ${result.error ? 'text-red-400' : 'text-white'}`, title: result.fileName }, result.fileName),
                        result.prompt && React.createElement('div', { className: "flex justify-between items-start space-x-3" },
                            React.createElement('p', { className: "text-slate-300 italic text-sm" }, `"${result.prompt}"`),
                            React.createElement(CopyButton, { textToCopy: result.prompt })
                        ),
                        result.prompts && React.createElement('div', { className: "space-y-4" },
                            React.createElement('div', null,
                                React.createElement('h4', { className: "text-xs font-bold uppercase text-purple-400 mb-1" }, "Cinematic Reveal"),
                                React.createElement('div', { className: "flex justify-between items-start space-x-3" },
                                    React.createElement('p', { className: "text-slate-300 italic text-sm" }, `"${result.prompts.cinematic_reveal}"`),
                                    React.createElement(CopyButton, { textToCopy: result.prompts.cinematic_reveal })
                                )
                            ),
                             React.createElement('div', null,
                                React.createElement('h4', { className: "text-xs font-bold uppercase text-purple-400 mb-1" }, "Intricate Detail"),
                                React.createElement('div', { className: "flex justify-between items-start space-x-3" },
                                    React.createElement('p', { className: "text-slate-300 italic text-sm" }, `"${result.prompts.intricate_detail}"`),
                                    React.createElement(CopyButton, { textToCopy: result.prompts.intricate_detail })
                                )
                            ),
                             React.createElement('div', null,
                                React.createElement('h4', { className: "text-xs font-bold uppercase text-purple-400 mb-1" }, "Dynamic Energy"),
                                React.createElement('div', { className: "flex justify-between items-start space-x-3" },
                                    React.createElement('p', { className: "text-slate-300 italic text-sm" }, `"${result.prompts.dynamic_energy}"`),
                                    React.createElement(CopyButton, { textToCopy: result.prompts.dynamic_energy })
                                )
                            )
                        ),
                        result.error && React.createElement('p', { className: "text-xs text-red-400" }, result.error)
                    )
                ))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
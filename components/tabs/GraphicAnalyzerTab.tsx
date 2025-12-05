import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../../utils/fileUtils';
import { analyzeGraphicImage } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';

export const GraphicAnalyzerTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const [isDragging, setIsDragging] = useState(false);

    const { uploadedFile, analysisResult } = formData;

    const handleFile = useCallback((file: File) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showModal('Invalid File Type', 'Please upload a valid JPG or PNG image of a graphic.');
            return;
        }
        if (uploadedFile) URL.revokeObjectURL(uploadedFile.previewUrl);
        setFormData((prev: any) => ({ ...prev, uploadedFile: { file, previewUrl: URL.createObjectURL(file) }, analysisResult: null }));
    }, [showModal, uploadedFile, setFormData]);

    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }, [handleFile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedFile) {
            showModal('No Image', 'Please upload a graphic to analyze.');
            return;
        }
        showLoadingModal('Analyzing Graphic', 'The AI data analyst is interpreting the graphic...');
        setFormData((prev: any) => ({ ...prev, analysisResult: null }));
        try {
            const base64ImageData = await fileToBase64(uploadedFile.file);
            const result = await analyzeGraphicImage(base64ImageData, uploadedFile.file.type);
            setFormData((prev: any) => ({ ...prev, analysisResult: result }));
        } catch (error) {
            showModal('Analysis Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold text-center flex-1" }, "Chart & Graphic Analyzer"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Graphic Analyzer" },
                    React.createElement('p', null, "This tool deconstructs charts, graphs, and infographics."),
                    React.createElement('p', { className: "mt-2" }, "It extracts data points, identifies the graphic type, summarizes key insights, and generates a new text-to-image prompt to recreate a similar visual.")
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Extract data and insights from any chart or infographic."),
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
             React.createElement('div', {
                onDragOver: onDragOver,
                onDragLeave: onDragLeave,
                onDrop: onDrop,
                className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 transition-all duration-300 min-h-[180px] flex items-center justify-center ${isDragging ? 'border-purple-500 border-dashed bg-slate-600' : 'border-slate-600'}`
            },
                uploadedFile ? React.createElement(React.Fragment, null,
                    React.createElement('img', { src: uploadedFile.previewUrl, alt: "Graphic preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                    React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, uploadedFile: null, analysisResult: null })), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                ) : React.createElement('div', null,
                    React.createElement('label', { htmlFor: "graphic-image-upload", className: "cursor-pointer text-sm text-purple-400 hover:text-purple-300 font-medium" }, "Click to upload"),
                    React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop a chart to analyze")
                ),
                React.createElement('input', { type: "file", id: "graphic-image-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e: any) => handleFile(e.target.files[0]) } as any)
            ),
             React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, 'Analyze Graphic')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        analysisResult && React.createElement('div', { className: "mt-8" },
            React.createElement('h2', { className: "text-lg font-semibold mb-3 text-slate-200" }, `Analysis for: "${analysisResult.title}"`),
            React.createElement('div', { className: "bg-slate-700 rounded-lg p-4 space-y-4" },
                React.createElement('div', { className: "flex justify-between" },
                    React.createElement('p', null, React.createElement('strong', { className: "text-purple-400" }, "Graphic Type: "), React.createElement('span', { className: "text-slate-300" }, analysisResult.graphicType)),
                    React.createElement('p', null, React.createElement('strong', { className: "text-purple-400" }, "Summary: "), React.createElement('span', { className: "text-slate-300" }, analysisResult.summary))
                ),
                React.createElement('div', null,
                    React.createElement('h3', { className: "text-purple-400 font-bold mb-2" }, "Data Points"),
                    React.createElement('div', { className: "overflow-x-auto" },
                        React.createElement('table', { className: "min-w-full text-sm text-left text-slate-300" },
                            React.createElement('thead', { className: "text-xs text-purple-300 uppercase bg-slate-800" },
                                React.createElement('tr', null,
                                    React.createElement('th', { scope: "col", className: "px-4 py-2" }, "Label"),
                                    React.createElement('th', { scope: "col", className: "px-4 py-2" }, "Value"),
                                    analysisResult.dataPoints[0]?.category && React.createElement('th', { scope: "col", className: "px-4 py-2" }, "Category")
                                )
                            ),
                            React.createElement('tbody', null,
                                analysisResult.dataPoints.map((dp: any, i: number) => React.createElement('tr', { key: i, className: "border-b border-slate-600" },
                                    React.createElement('td', { className: "px-4 py-2" }, dp.label),
                                    React.createElement('td', { className: "px-4 py-2" }, dp.value),
                                    dp.category && React.createElement('td', { className: "px-4 py-2" }, dp.category)
                                ))
                            )
                        )
                    )
                ),
                React.createElement('div', null,
                    React.createElement('h3', { className: "text-purple-400 font-bold mb-2" }, "Key Takeaways"),
                    React.createElement('ul', { className: "list-disc list-inside space-y-1 text-slate-300" },
                        analysisResult.keyTakeaways.map((item: string, i: number) => React.createElement('li', { key: i }, item))
                    )
                ),
                React.createElement('div', { className: "relative bg-slate-900 rounded-lg p-4 border border-slate-700" },
                    React.createElement('h3', { className: "text-purple-400 font-bold mb-2" }, "Regenerate Prompt"),
                    React.createElement('textarea', { value: analysisResult.regeneratePrompt, className: "w-full bg-transparent border-0 text-slate-300 focus:ring-0 resize-none pr-10", rows: 4, readOnly: true }),
                    React.createElement('div', { className: "absolute top-3 right-3" }, React.createElement(CopyButton, { textToCopy: analysisResult.regeneratePrompt }))
                )
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
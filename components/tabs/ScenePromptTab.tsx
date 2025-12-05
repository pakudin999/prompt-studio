import React, { useState, useCallback } from 'react';
import { VISUAL_STYLE_OPTIONS, GENRE_OPTIONS } from '../../constants/options';
import { generateScenePrompt } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';
import { SelectInput, NeonCheckbox, TextAreaInput } from '../shared/FormControls';

export const ScenePromptTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const { generatedScenes } = formData;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number';
        const checkedValue = (e.target as HTMLInputElement).checked;

        let finalValue: string | number | boolean = value;
        if (isCheckbox) {
            finalValue = checkedValue;
        } else if (isNumber) {
            finalValue = parseInt(value, 10) || 1;
        }

        setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
    }, [setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.sceneDescription) {
            showModal('Description Required', 'Please provide a story or scene description.');
            return;
        }
        showLoadingModal('Generating Scenes', `Drafting ${formData.numScenes} detailed scene(s)...`);
        setFormData((prev: any) => ({ ...prev, generatedScenes: null }));
        try {
            const scenes = await generateScenePrompt(
                formData.sceneDescription,
                formData.numScenes,
                formData.visualStyle,
                formData.narrativeMode,
                formData.includeTransitions,
                formData.genre,
                formData.isTikTokFormat,
                formData.disableTextOverlay
            );
            setFormData((prev: any) => ({ ...prev, generatedScenes: Array.isArray(scenes) ? scenes : [scenes] }));
        } catch (error) {
            showModal('Generation Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };
    
    const copyAllScenes = useCallback(() => {
        if (generatedScenes && generatedScenes.length > 0) {
            const allScenesText = JSON.stringify(generatedScenes, null, 2);
            navigator.clipboard.writeText(allScenesText);
            showModal("Copied!", "All scenes have been copied to your clipboard as a JSON array.");
        }
    }, [generatedScenes, showModal]);

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1" }, "Scene / Storyboard Generator"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                 React.createElement(InfoButton, { title: "About Scene Generator" },
                    React.createElement('p', null, "This tool breaks down a story description into multiple, detailed scene prompts in a structured JSON format."),
                    React.createElement('ul', { className: "list-disc list-inside mt-2" },
                        React.createElement('li', null, React.createElement('strong', null, "Narrative Mode:"), " Creates a continuous, logical story."),
                        React.createElement('li', null, React.createElement('strong', null, "TikTok Format:"), " Optimizes scenes for short-form video engagement."),
                        React.createElement('li', null, React.createElement('strong', null, "Genre & Style:"), " Infuses scenes with your chosen mood and visual aesthetic.")
                    )
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Turn your story ideas into a sequence of detailed, structured scene descriptions for animation or storyboarding."),
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
            React.createElement(TextAreaInput, {
                label: "Story / Scene Description",
                name: "sceneDescription",
                value: formData.sceneDescription,
                onChange: handleChange,
                rows: 5,
                placeholder: "e.g., A futuristic detective investigates a mysterious signal in a neon-lit city."
            }),
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                 React.createElement('div', { className: "space-y-4 bg-slate-700 p-4 rounded-lg" },
                     React.createElement('h3', { className: "text-base font-semibold text-slate-200" }, "Generation Options"),
                    React.createElement('div', null,
                        React.createElement('label', { htmlFor: "numScenes", className: "block text-sm font-medium mb-1 text-slate-300" }, "Number of Scenes"),
                        React.createElement('input', {
                            id: "numScenes",
                            name: "numScenes",
                            type: "number",
                            min: "1",
                            value: formData.numScenes,
                            onChange: handleChange,
                            className: "form-input w-full bg-slate-700 rounded-lg p-2.5 text-white border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        })
                    ),
                     React.createElement(SelectInput, { label: "Visual Style", name: "visualStyle", value: formData.visualStyle, onChange: handleChange, options: VISUAL_STYLE_OPTIONS, placeholder: "Select style" }),
                    React.createElement(SelectInput, { label: "Genre", name: "genre", value: formData.genre, onChange: handleChange, options: GENRE_OPTIONS, placeholder: "Optional genre" }),

                ),
                 React.createElement('div', { className: "space-y-4 bg-slate-700 p-4 rounded-lg" },
                    React.createElement('h3', { className: "text-base font-semibold text-slate-200" }, "Narrative Control"),
                    React.createElement(NeonCheckbox, { id: "narrativeMode", name: "narrativeMode", checked: formData.narrativeMode, onChange: handleChange, children: "Continuous Narrative Mode" }),
                    formData.narrativeMode && React.createElement(NeonCheckbox, { id: "includeTransitions", name: "includeTransitions", checked: formData.includeTransitions, onChange: handleChange, children: "Include Transition Scenes" })
                ),
                 React.createElement('div', { className: "space-y-4 bg-slate-700 p-4 rounded-lg" },
                    React.createElement('h3', { className: "text-base font-semibold text-slate-200" }, "Platform Formatting"),
                    React.createElement(NeonCheckbox, { id: "isTikTokFormat", name: "isTikTokFormat", checked: formData.isTikTokFormat, onChange: handleChange, children: "Optimize for TikTok" }),
                    formData.isTikTokFormat && React.createElement(NeonCheckbox, { id: "disableTextOverlay", name: "disableTextOverlay", checked: formData.disableTextOverlay, onChange: handleChange, children: "Disable Text Overlay" })
                )
            ),
             React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, 'Generate Scenes')
                ),
                React.createElement('button', { type: "button", onClick: onReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out", title: "Reset Tab" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        generatedScenes && React.createElement('div', { className: "mt-8" },
            React.createElement('div', { className: "flex justify-between items-center mb-3" },
                React.createElement('h2', { className: "text-lg font-semibold text-slate-200" }, `Generated Scenes (${generatedScenes.length})`),
                React.createElement('button', { onClick: copyAllScenes, className: "flex items-center space-x-2 bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" },
                        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.467-7.48-8.467s-7.48 3.907-7.48 8.467v7.5c0 .621.504 1.125 1.125 1.125h3.375m9.375-3.375H15.75m0-3.375v3.375m0-3.375l-3.375 3.375M15.75 12l3.375 3.375" })
                    ),
                    React.createElement('span', null, "Copy All Scenes (JSON)")
                )
            ),
            React.createElement('div', { className: "space-y-4" },
                generatedScenes.map((scene: any, index: number) => React.createElement('div', { key: scene.scene_id || index, className: "bg-slate-700 rounded-lg p-3" },
                     React.createElement('div', { className: "flex justify-between items-center" },
                         React.createElement('h3', { className: "font-bold text-purple-400" }, `Scene ${scene.scene_id || index + 1}`),
                        React.createElement(CopyButton, { textToCopy: JSON.stringify(scene, null, 2) })
                    ),
                    React.createElement('pre', { className: "mt-2 text-xs text-slate-300 bg-slate-800 p-2 rounded custom-scrollbar overflow-x-auto" },
                        JSON.stringify(scene, null, 2)
                    )
                ))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
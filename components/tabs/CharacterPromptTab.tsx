import React, { useState, useCallback } from 'react';
import {
    GENDER_OPTIONS, ETHNICITY_OPTIONS, SKIN_TONE_OPTIONS, HEIGHT_OPTIONS, BODY_BUILD_OPTIONS,
    FACE_SHAPE_OPTIONS, EYE_SHAPE_OPTIONS, EYE_COLOR_OPTIONS, EYEBROW_OPTIONS, NOSE_SHAPE_OPTIONS,
    LIP_SHAPE_OPTIONS, HAIR_STYLE_OPTIONS, HAIR_TYPE_OPTIONS, HAIR_LENGTH_OPTIONS, HIJAB_STYLE_DETAIL_OPTIONS,
    VOICE_PITCH_OPTIONS, VOICE_TONE_OPTIONS, SPEAKING_STYLE_OPTIONS, LANGUAGE_OPTIONS,
    CLOTHING_CASUAL_OPTIONS, CLOTHING_ISLAMIK_OPTIONS, CLOTHING_CULTURAL_OPTIONS, CLOTHING_STYLO_OPTIONS,
    CLOTHING_TRENDING_OPTIONS, CLOTHING_BOTTOM_OPTIONS, COLOR_OPTIONS, PERSONALITY_OPTIONS,
    POSE_OPTIONS, SETTING_OPTIONS, PHOTO_STYLE_OPTIONS
} from '../../constants/options';
import { fileToBase64 } from '../../utils/fileUtils';
import { buildCharacterPrompt } from '../../utils/promptUtils';
import { analyzeCharacterImage } from '../../services/geminiService';
import { InfoButton } from '../shared/InfoButton';
import { CopyButton } from '../shared/CopyButton';
import { TextInput, SelectInput, ColorSelectInput } from '../shared/FormControls';

export const CharacterPromptTab = React.memo(({ showModal, showLoadingModal, hideLoadingModal, formData, setFormData, onReset }: { showModal: any, showLoadingModal: any, hideLoadingModal: any, formData: any, setFormData: any, onReset: any }) => {
    const { uploadedFile } = formData;
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    const handleFile = useCallback((file: File) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showModal('Invalid File Type', 'Please upload a valid JPG or PNG image.');
            return;
        }
        if (uploadedFile) URL.revokeObjectURL(uploadedFile.previewUrl);
        setFormData((prev: any) => ({...prev, uploadedFile: { file, previewUrl: URL.createObjectURL(file) }}));
    }, [showModal, uploadedFile, setFormData]);
    
    const handleAnalyze = async () => {
        if (!uploadedFile) {
            showModal('No Image', 'Please upload a character image to analyze.');
            return;
        }
        showLoadingModal('Analyzing Image', 'The AI is extracting character details...');
        try {
            const base64ImageData = await fileToBase64(uploadedFile.file);
            const analysisResult = await analyzeCharacterImage(base64ImageData, uploadedFile.file.type);
            setFormData((prev: any) => ({ ...prev, ...analysisResult }));
        } catch (error) {
            showModal('Analysis Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            hideLoadingModal();
        }
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    }, [setFormData]);

    const handleClothingChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const clothingFields = ['clothingCasual', 'clothingIslamik', 'clothingCultural', 'clothingStylo', 'clothingTrending'];
        setFormData((prev: any) => {
            const newFormData = { ...prev };
            clothingFields.forEach(field => {
                newFormData[field] = field === name ? value : '';
            });
            return newFormData;
        });
    }, [setFormData]);
    
    const confirmReset = () => {
        showModal(
            'Confirm Reset',
            'Are you sure you want to reset all fields in this tab? This action cannot be undone.',
            () => {
                onReset();
                setGeneratedPrompt('');
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showLoadingModal('Generating Prompt', 'Building your character description...');
        // The process is fast, so a small timeout makes the modal visible.
        setTimeout(() => {
            setGeneratedPrompt(buildCharacterPrompt(formData));
            hideLoadingModal();
        }, 500);
    };

    return React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between items-center text-center mb-4" },
            React.createElement('div', { className: "flex-1" }),
            React.createElement('h1', { className: "text-2xl md:text-3xl font-bold flex-1" }, "Consistent Character Prompt"),
            React.createElement('div', { className: "flex-1 flex justify-end" },
                React.createElement(InfoButton, { title: "About Character Prompts" },
                    React.createElement('p', null, "This tool helps you build highly detailed and consistent character prompts."),
                    React.createElement('ul', { className: "list-disc list-inside mt-2" },
                        React.createElement('li', null, "Fill out the form manually for full creative control."),
                        React.createElement('li', null, "Or, upload a reference image and click 'Analyze Image' to have the AI auto-fill the form for you."),
                        React.createElement('li', null, "Add a dialogue topic to generate a monologue that matches your character's personality.")
                    )
                )
            )
        ),
        React.createElement('p', { className: "text-center text-slate-400 mb-8" }, "Use the form to build a detailed character, or upload an image to auto-fill."),
        React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
            React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" },
                React.createElement('div', { className: "lg:col-span-1 space-y-4" },
                    React.createElement('div', { className: "bg-slate-700/50 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-4" }, "Reference Image (Optional)"),
                        React.createElement('div', {
                            className: `relative group bg-slate-700 rounded-lg p-4 text-center border-2 border-slate-600 min-h-[180px] flex items-center justify-center`
                        },
                            uploadedFile ? React.createElement(React.Fragment, null,
                                React.createElement('img', { src: uploadedFile.previewUrl, alt: "Character preview", className: "max-h-48 w-auto object-contain rounded-md" }),
                                React.createElement('button', { type: "button", onClick: () => setFormData((prev: any) => ({...prev, uploadedFile: null})), className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity", title: "Remove image" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))
                            ) : React.createElement('div', null,
                                React.createElement('label', { htmlFor: "char-image-upload", className: "cursor-pointer text-sm text-purple-400 hover:text-purple-300 font-medium" }, "Click to upload"),
                                React.createElement('p', { className: "text-xs text-slate-400 mt-1" }, "or drag & drop image")
                            ),
                            React.createElement('input', { type: "file", id: "char-image-upload", className: "hidden", accept: "image/jpeg,image/png", onChange: (e) => handleFile(e.target.files[0]) } as any)
                        )
                    ),
                    React.createElement('button', { type: "button", onClick: handleAnalyze, disabled: !uploadedFile, className: "w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2" }, 
                       React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth:"1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.456-2.456L11.25 18l1.938-.648a3.375 3.375 0 002.456-2.456L16.25 13.5l.648 1.938a3.375 3.375 0 002.456 2.456L21 18l-1.938.648a3.375 3.375 0 00-2.456 2.456z" })),
                       React.createElement('span', null, "Analyze Image to Auto-Fill Form")
                    )
                ),
                React.createElement('div', { className: "lg:col-span-2 space-y-6" },
                    React.createElement('div', { className: "bg-slate-700/50 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-4" }, "Core Attributes"),
                        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                            React.createElement(TextInput, { label: "Character Name", name: "name", value: formData.name, onChange: handleChange, placeholder: "e.g., Alex" }),
                            React.createElement(TextInput, { label: "Age", name: "age", value: formData.age, onChange: handleChange, placeholder: "e.g., 28 years old" }),
                            React.createElement(SelectInput, { label: "Gender/Appearance", name: "gender", value: formData.gender, onChange: handleChange, options: GENDER_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Ethnicity", name: "ethnicity", value: formData.ethnicity, onChange: handleChange, options: ETHNICITY_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Skin Tone", name: "skinTone", value: formData.skinTone, onChange: handleChange, options: SKIN_TONE_OPTIONS, placeholder: "Select..." })
                        )
                    ),
                    React.createElement('div', { className: "bg-slate-700/50 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-4" }, "Physical Build"),
                        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                            React.createElement(SelectInput, { label: "Height", name: "height", value: formData.height, onChange: handleChange, options: HEIGHT_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Body Build", name: "build", value: formData.build, onChange: handleChange, options: BODY_BUILD_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Face Shape", name: "faceShape", value: formData.faceShape, onChange: handleChange, options: FACE_SHAPE_OPTIONS, placeholder: "Select..." })
                        )
                    ),
                     React.createElement('div', { className: "bg-slate-700/50 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-4" }, "Hair / Headwear"),
                        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                            React.createElement(SelectInput, { label: "Style", name: "hairStyle", value: formData.hairStyle, onChange: handleChange, options: HAIR_STYLE_OPTIONS, placeholder: "Select..." }),
                            formData.hairStyle === 'freehair' && React.createElement(React.Fragment, null,
                                React.createElement(SelectInput, { label: "Hair Type", name: "hairType", value: formData.hairType, onChange: handleChange, options: HAIR_TYPE_OPTIONS, placeholder: "Select..." }),
                                React.createElement(SelectInput, { label: "Hair Length", name: "hairLength", value: formData.hairLength, onChange: handleChange, options: HAIR_LENGTH_OPTIONS, placeholder: "Select..." }),
                                React.createElement(TextInput, { label: "Hair Color", name: "hairColor", value: formData.hairColor, onChange: handleChange, placeholder: "e.g., natural black" }),
                            ),
                            (formData.hairStyle === 'hijab' || formData.hairStyle === 'turban') && React.createElement(React.Fragment, null,
                                React.createElement(SelectInput, { label: "Hijab/Turban Style", name: "hijabStyleDetail", value: formData.hijabStyleDetail, onChange: handleChange, options: HIJAB_STYLE_DETAIL_OPTIONS, placeholder: "Select..." }),
                                React.createElement(TextInput, { label: "Hijab/Turban Color", name: "hijabColor", value: formData.hijabColor, onChange: handleChange, placeholder: "e.g., soft beige" }),
                            )
                        )
                    ),
                    React.createElement('div', { className: "bg-slate-700/50 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-4" }, "Clothing"),
                        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                            React.createElement(SelectInput, { label: "Top (Casual)", name: "clothingCasual", value: formData.clothingCasual, onChange: handleClothingChange, options: CLOTHING_CASUAL_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Top (Islamik)", name: "clothingIslamik", value: formData.clothingIslamik, onChange: handleClothingChange, options: CLOTHING_ISLAMIK_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Top (Cultural)", name: "clothingCultural", value: formData.clothingCultural, onChange: handleClothingChange, options: CLOTHING_CULTURAL_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Top (Stylo)", name: "clothingStylo", value: formData.clothingStylo, onChange: handleClothingChange, options: CLOTHING_STYLO_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Top (Trending)", name: "clothingTrending", value: formData.clothingTrending, onChange: handleClothingChange, options: CLOTHING_TRENDING_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Bottom", name: "clothingBottom", value: formData.clothingBottom, onChange: handleChange, options: CLOTHING_BOTTOM_OPTIONS, placeholder: "Select..." }),
                            React.createElement(ColorSelectInput, { label: "Top Color", name: "topColor", value: formData.topColor, onChange: handleChange, options: COLOR_OPTIONS, placeholder: "Select..." }),
                            React.createElement(ColorSelectInput, { label: "Bottom Color", name: "bottomColor", value: formData.bottomColor, onChange: handleChange, options: COLOR_OPTIONS, placeholder: "Select..." }),
                            React.createElement(TextInput, { className: "md:col-span-3", label: "Accessories", name: "accessories", value: formData.accessories, onChange: handleChange, placeholder: "e.g., glasses, silver watch" })
                        )
                    ),
                     React.createElement('div', { className: "bg-slate-700/50 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-4" }, "Persona & Scene"),
                        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                            React.createElement(SelectInput, { label: "Personality/Expression", name: "personality", value: formData.personality, onChange: handleChange, options: PERSONALITY_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Pose", name: "pose", value: formData.pose, onChange: handleChange, options: POSE_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { label: "Setting/Background", name: "setting", value: formData.setting, onChange: handleChange, options: SETTING_OPTIONS, placeholder: "Select..." }),
                            React.createElement(SelectInput, { className: "md:col-span-3", label: "Photographic Style", name: "photoStyle", value: formData.photoStyle, onChange: handleChange, options: PHOTO_STYLE_OPTIONS, placeholder: "Select..." })
                        )
                    ),
                    React.createElement('div', { className: "bg-slate-700/50 p-4 rounded-lg" },
                        React.createElement('h3', { className: "text-lg font-semibold text-slate-200 mb-4" }, "Dialogue (Optional)"),
                        React.createElement(TextInput, { label: "Topic for a short monologue", name: "dialogueTopic", value: formData.dialogueTopic, onChange: handleChange, placeholder: "e.g., their favorite childhood memory" })
                    )
                )
            ),
            React.createElement('div', { className: "flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700" },
                React.createElement('button', { type: "submit", className: "flex-1 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2" },
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" })),
                    React.createElement('span', null, "Generate Character Prompt")
                ),
                React.createElement('button', { type: "button", onClick: confirmReset, className: "bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg transition-colors", title: "Reset Tab" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" }))
                )
            )
        ),
        generatedPrompt && React.createElement('div', { className: "mt-8" },
            React.createElement('h2', { className: "text-lg font-semibold mb-3 text-slate-200" }, "Generated Character Prompt"),
            React.createElement('div', { className: "relative bg-slate-900 rounded-lg p-4 border border-slate-700" },
                React.createElement('textarea', { value: generatedPrompt, className: "w-full bg-transparent border-0 text-slate-300 focus:ring-0 resize-none pr-10", rows: 8, readOnly: true }),
                React.createElement('div', { className: "absolute top-3 right-3" }, React.createElement(CopyButton, { textToCopy: generatedPrompt }))
            )
        ),
        React.createElement('div', { className: "text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700" }, `© ${new Date().getFullYear()} @konten_beban`)
    );
});
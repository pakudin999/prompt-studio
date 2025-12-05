
import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

import { CharacterPromptTab } from './components/tabs/CharacterPromptTab';
import { ScenePromptTab } from './components/tabs/ScenePromptTab';
import { MovementPromptTab } from './components/tabs/MovementPromptTab';
import { ProductActionPromptTab } from './components/tabs/ProductActionPromptTab';
import { ProductBackgroundPromptTab } from './components/tabs/ProductBackgroundPromptTab';
import { BatchViralPromptTab } from './components/tabs/BatchViralPromptTab';
import { CollagePromptTab } from './components/tabs/CollagePromptTab';
import { StyleAnalyzerTab } from './components/tabs/StyleAnalyzerTab';
import { InfoExtractorTab } from './components/tabs/InfoExtractorTab';
import { GraphicAnalyzerTab } from './components/tabs/GraphicAnalyzerTab';
import { ColorPaletteTab } from './components/tabs/ColorPaletteTab';
import { GoogleFlowTab } from './components/tabs/GoogleFlowTab';
import { BackgroundAnalyzerTab } from './components/tabs/BackgroundAnalyzerTab';
import { StyleTransferTab } from './components/tabs/StyleTransferTab';
import { PosterGeneratorTab } from './components/tabs/PosterGeneratorTab';
import { AlertModal } from './components/shared/AlertModal';
import { LoadingModal } from './components/shared/LoadingModal';
import { MalayVariantPromptTab } from './components/tabs/MalayVariantPromptTab';
import { Sidebar } from './components/shared/Sidebar';
import { AssistantSidebar } from './components/shared/AssistantSidebar';
import { TopDrawer } from './components/shared/TopDrawer';
import {
    initialCharacterFormData,
    initialSceneFormData,
    initialMovementPromptState,
    initialProductActionFormData,
    initialProductBackgroundFormData,
    initialBatchViralFormData,
    initialCollageFormData,
    initialStyleAnalyzerFormData,
    initialInfoExtractorFormData,
    initialGraphicAnalyzerFormData,
    initialMalayVariantFormData,
    initialGoogleFlowFormData,
    initialBackgroundAnalyzerFormData,
    initialStyleTransferFormData,
    initialPosterGeneratorFormData
} from './constants/initialStates';

import {
    IconScene, IconVideoMovement, IconBatchViral, IconLayout,
    IconCharacter, IconProductAction, IconProductBackground, IconStyleAnalyzer,
    IconInfoExtractor, IconGraphicAnalyzer, IconColor, IconMalayVariant, IconChevronLeft, IconChevronRight, IconGoogleFlow, IconBackgroundScan, IconMagicWand, IconPoster
} from './components/icons';


const App = () => {
    const [activeTab, setActiveTab] = useState('character');
    const [modal, setModal] = useState<{ title: string; message: string; onConfirm?: () => void; } | null>(null);
    const [loadingModal, setLoadingModal] = useState<{ title: string; message: string; } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAssistantSidebarOpen, setIsAssistantSidebarOpen] = useState(false);


    const [allFormData, setAllFormData] = useState({
        character: initialCharacterFormData,
        scene: initialSceneFormData,
        movement: initialMovementPromptState,
        productAction: initialProductActionFormData,
        productBackground: initialProductBackgroundFormData,
        batchViral: initialBatchViralFormData,
        collagePrompt: initialCollageFormData,
        styleAnalyzer: initialStyleAnalyzerFormData,
        infoExtractor: initialInfoExtractorFormData,
        graphicAnalyzer: initialGraphicAnalyzerFormData,
        malayVariant: initialMalayVariantFormData,
        googleFlow: initialGoogleFlowFormData,
        backgroundAnalyzer: initialBackgroundAnalyzerFormData,
        styleTransfer: initialStyleTransferFormData,
        posterGenerator: initialPosterGeneratorFormData
    });
    
    const showModal = (title: string, message: string, onConfirm?: () => void) => {
        setModal({ title, message, onConfirm });
    };

    const showLoadingModal = useCallback((title: string, message: string) => {
        setLoadingModal({ title, message });
    }, []);

    const hideLoadingModal = useCallback(() => {
        setLoadingModal(null);
    }, []);


    const handleSetFormData = useCallback((tab: string, data: any) => {
        setAllFormData(prev => {
            const currentTabData = prev[tab as keyof typeof prev];
            const newTabData = typeof data === 'function' ? data(currentTabData) : data;
            return {
                ...prev,
                [tab]: newTabData
            };
        });
    }, []);
    
    const handleReset = useCallback((tab: string) => {
        const initialStates: { [key: string]: any } = {
            character: initialCharacterFormData,
            scene: initialSceneFormData,
            movement: initialMovementPromptState,
            productAction: initialProductActionFormData,
            productBackground: initialProductBackgroundFormData,
            batchViral: initialBatchViralFormData,
            collagePrompt: initialCollageFormData,
            styleAnalyzer: initialStyleAnalyzerFormData,
            infoExtractor: initialInfoExtractorFormData,
            graphicAnalyzer: initialGraphicAnalyzerFormData,
            malayVariant: initialMalayVariantFormData,
            googleFlow: initialGoogleFlowFormData,
            backgroundAnalyzer: initialBackgroundAnalyzerFormData,
            styleTransfer: initialStyleTransferFormData,
            posterGenerator: initialPosterGeneratorFormData
        };
        handleSetFormData(tab, initialStates[tab]);
    }, [handleSetFormData]);

    const setTabData = useCallback((data: any) => {
        handleSetFormData(activeTab, data);
    }, [activeTab, handleSetFormData]);

    const resetTabData = useCallback(() => {
        handleReset(activeTab);
    }, [activeTab, handleReset]);

    const tabsConfig = [
        {
            group: 'Video Production',
            items: [
                { id: 'scene', label: 'Scene/Storyboard', icon: IconScene, hint: 'Video', hintColor: 'text-green-400' },
                { id: 'movement', label: 'Video Movement', icon: IconVideoMovement, hint: 'Video', hintColor: 'text-green-400' },
                { id: 'batchViral', label: 'Batch Viral Ideas', icon: IconBatchViral, hint: 'Video', hintColor: 'text-green-400' },
                { id: 'googleFlow', label: 'Material to Video', icon: IconGoogleFlow, hint: 'Google Flow', hintColor: 'text-purple-400' },
            ]
        },
        {
            group: 'Creative & Visuals',
            items: [
                { id: 'character', label: 'Character', icon: IconCharacter, hint: 'Image', hintColor: 'text-cyan-400' },
                { id: 'malayVariant', label: 'Malay Variator', icon: IconMalayVariant, hint: 'Image', hintColor: 'text-cyan-400' },
                { id: 'collagePrompt', label: 'Lifestyle Collage', icon: IconLayout, hint: 'Image', hintColor: 'text-cyan-400' },
                { id: 'productAction', label: 'Product Action', icon: IconProductAction, hint: 'Image', hintColor: 'text-cyan-400' },
                { id: 'styleTransfer', label: 'Gold Style Transfer', icon: IconMagicWand, hint: 'Image', hintColor: 'text-cyan-400' },
                { id: 'posterGenerator', label: 'Poster Generator', icon: IconPoster, hint: 'Image', hintColor: 'text-cyan-400' },
                { id: 'productBackground', label: 'Product Background', icon: IconProductBackground, hint: 'Design', hintColor: 'text-blue-400' },
                { id: 'styleAnalyzer', label: 'Style Analyzer', icon: IconStyleAnalyzer, hint: 'Design', hintColor: 'text-blue-400' },
                { id: 'backgroundAnalyzer', label: 'BG Concept Analyzer', icon: IconBackgroundScan, hint: 'New', hintColor: 'text-teal-400' },
            ]
        },
        {
            group: 'Data & Utilities',
            items: [
                 { id: 'infoExtractor', label: 'Info Extractor', icon: IconInfoExtractor, hint: 'Data', hintColor: 'text-yellow-400' },
                { id: 'graphicAnalyzer', label: 'Graphic Analyzer', icon: IconGraphicAnalyzer, hint: 'Data', hintColor: 'text-yellow-400' },
                { id: 'color', label: 'Color Palettes', icon: IconColor, hint: 'Utility', hintColor: 'text-slate-400' },
            ]
        }
    ];

    const TabContent = () => {
        const props = {
            showModal,
            showLoadingModal,
            hideLoadingModal,
            formData: allFormData[activeTab as keyof typeof allFormData],
            setFormData: setTabData,
            onReset: resetTabData
        };

        switch (activeTab) {
            case 'character': return React.createElement(CharacterPromptTab, props);
            case 'scene': return React.createElement(ScenePromptTab, props);
            case 'movement': return React.createElement(MovementPromptTab, props);
            case 'productAction': return React.createElement(ProductActionPromptTab, props);
            case 'productBackground': return React.createElement(ProductBackgroundPromptTab, props);
            case 'batchViral': return React.createElement(BatchViralPromptTab, props);
            case 'collagePrompt': return React.createElement(CollagePromptTab, props);
            case 'styleAnalyzer': return React.createElement(StyleAnalyzerTab, props);
            case 'backgroundAnalyzer': return React.createElement(BackgroundAnalyzerTab, props);
            case 'infoExtractor': return React.createElement(InfoExtractorTab, props);
            case 'graphicAnalyzer': return React.createElement(GraphicAnalyzerTab, props);
            case 'malayVariant': return React.createElement(MalayVariantPromptTab, props);
            case 'googleFlow': return React.createElement(GoogleFlowTab, props);
            case 'styleTransfer': return React.createElement(StyleTransferTab, props);
            case 'posterGenerator': return React.createElement(PosterGeneratorTab, props);
            case 'color': return React.createElement(ColorPaletteTab);
            default: return React.createElement('div', null, 'Select a tab');
        }
    };

    return React.createElement('div', { className: "min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8" },
        React.createElement(TopDrawer),
        React.createElement('main', { className: "max-w-7xl mx-auto pt-8" },
            React.createElement('div', { className: "text-center mb-6" },
                React.createElement('h1', { className: "text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" }, "AI Prompt Generator Studio"),
                React.createElement('p', { className: "mt-2 text-lg text-slate-400" }, "Your Central Hub for Crafting Powerful, Professional AI Prompts")
            ),
            React.createElement('div', { className: "mb-8" },
                tabsConfig.map(group => (
                    React.createElement('div', { key: group.group, className: "mb-4" },
                        React.createElement('h2', { className: "text-xs font-bold uppercase text-slate-500 mb-2 px-2" }, group.group),
                        React.createElement('div', { className: "flex flex-wrap gap-2" },
                            group.items.map(tab => (
                                React.createElement('button', {
                                    key: tab.id,
                                    onClick: () => setActiveTab(tab.id),
                                    className: `group relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${tab.id === 'googleFlow' ? 'ml-auto' : ''}
                                        ${activeTab === tab.id
                                            ? 'bg-slate-700 text-white shadow-lg'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }`
                                },
                                    React.createElement(tab.icon, { className: "w-5 h-5" }),
                                    tab.label,
                                    React.createElement('span', { className: `absolute -top-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${tab.hintColor} bg-slate-900 border border-slate-700` }, tab.hint),
                                    activeTab === tab.id && React.createElement('div', { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-purple-500 rounded-full" })
                                )
                            ))
                        )
                    )
                ))
            ),
            React.createElement('div', { className: "bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-slate-700" },
                React.createElement(TabContent, null)
            )
        ),
        React.createElement(Sidebar, {
            isOpen: isSidebarOpen,
            onClose: () => setIsSidebarOpen(false)
        }),
        !isSidebarOpen && React.createElement('button', {
            onClick: () => setIsSidebarOpen(true),
            className: "fixed top-1/2 -translate-y-1/2 right-0 z-30 p-2 bg-slate-700 hover:bg-purple-600 text-white rounded-l-full shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500",
            'aria-label': "Open sidebar"
        },
            React.createElement(IconChevronLeft, { className: "w-6 h-6" })
        ),
        React.createElement(AssistantSidebar, {
            isOpen: isAssistantSidebarOpen,
            onClose: () => setIsAssistantSidebarOpen(false)
        }),
        !isAssistantSidebarOpen && React.createElement('button', {
            onClick: () => setIsAssistantSidebarOpen(true),
            className: "fixed top-1/2 -translate-y-1/2 left-0 z-30 p-2 bg-slate-700 hover:bg-purple-600 text-white rounded-r-full shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500",
            'aria-label': "Open AI assistant"
        },
            React.createElement(IconChevronRight, { className: "w-6 h-6" })
        ),
        modal && React.createElement(AlertModal, {
            title: modal.title,
            message: modal.message,
            onClose: () => setModal(null),
            onConfirm: modal.onConfirm,
        }),
        loadingModal && React.createElement(LoadingModal, {
            title: loadingModal.title,
            message: loadingModal.message,
        })
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(React.createElement(React.StrictMode, null, React.createElement(App)));

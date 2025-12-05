
import { VISUAL_STYLE_OPTIONS, PRODUCT_ACTION_OPTIONS, PRODUCT_ACTION_STYLES, PRODUCT_ANGLE_OPTIONS, PRODUCT_BACKGROUND_STYLES } from "./options";

export const initialCharacterFormData = {
    id: undefined, name: '', gender: '', age: '', ethnicity: '', skinTone: '',
    height: '', build: '', faceShape: '', eyeShape: '', eyeColor: '',
    eyebrows: '', noseShape: '', lipsShape: '', features: '',
    hairStyle: 'freehair', hairType: '', hairLength: '', hairColor: 'natural black',
    hijabStyle: 'hijab', hijabColor: '', hijabStyleDetail: '',
    voicePitch: '', voiceTone: '', speakingStyle: '', language: '',
    clothingCasual: '', clothingIslamik: '', clothingCultural: '',
    clothingStylo: '', clothingTrending: '', clothingBottom: '',
    topColor: '', bottomColor: '', accessories: '',
    personality: '', pose: '', setting: '', photoStyle: '',
    dialogueTopic: '',
    uploadedFile: null,
};

export const initialSceneFormData = {
    sceneDescription: '',
    numScenes: 3,
    visualStyle: VISUAL_STYLE_OPTIONS[0].value,
    narrativeMode: true,
    includeTransitions: false,
    genre: '',
    isTikTokFormat: false,
    disableTextOverlay: false,
    generatedScenes: null
};

export const initialProductActionFormData = {
    uploadedFiles: [],
    actionDescription: PRODUCT_ACTION_OPTIONS[0].value,
    style: PRODUCT_ACTION_STYLES[0].value,
    angle: PRODUCT_ANGLE_OPTIONS[0].value,
    results: [],
    customActionDescription: '',
};

export const initialProductBackgroundFormData = {
    uploadedFile: null,
    style: PRODUCT_BACKGROUND_STYLES[0].value,
    keywords: '',
    generatedPrompt: '',
};

export const initialBatchViralFormData = {
    uploadedFile: null,
    promptCount: 5,
    results: null,
};

export const initialCollageFormData = {
    uploadedFile: null,
    collageCount: 3, // Default to 3 cuts
    generatedPrompt: '',
};

export const initialStyleAnalyzerFormData = {
    uploadedFile: null,
    generatedPrompt: '',
};

export const initialMovementPromptState = {
    selectedFiles: [],
    results: [],
};

export const initialInfoExtractorFormData = {
    uploadedFile: null,
    analysisResult: null,
};

export const initialGraphicAnalyzerFormData = {
    uploadedFile: null,
    analysisResult: null,
};

export const initialMalayVariantFormData = {
    concept: '',
    quantity: 3,
    useOutdoorVibrance: false,
    results: null,
};

export const initialGoogleFlowFormData = {
    contextFile: null,
    productFile: null,
    results: null,
};

export const initialBackgroundAnalyzerFormData = {
    uploadedFile: null,
    analysisResult: null,
};

export const initialStyleTransferFormData = {
    productFile: null,
    styleFile: null,
    generatedPrompt: '',
};

export const initialPosterGeneratorFormData = {
    uploadedFile: null, // This is the Style Reference
    personFile: null,   // New: The Person/Subject to composite
    isProMode: false,   // New: Toggle state
    posterDescription: '',
    generatedPrompt: '',
};

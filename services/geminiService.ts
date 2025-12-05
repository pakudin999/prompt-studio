
import { GoogleGenAI, Type } from "@google/genai";
import {
    GENDER_OPTIONS, ETHNICITY_OPTIONS, SKIN_TONE_OPTIONS, HEIGHT_OPTIONS, BODY_BUILD_OPTIONS,
    FACE_SHAPE_OPTIONS, EYE_SHAPE_OPTIONS, EYE_COLOR_OPTIONS, EYEBROW_OPTIONS, NOSE_SHAPE_OPTIONS,
    LIP_SHAPE_OPTIONS, HAIR_STYLE_OPTIONS, HAIR_TYPE_OPTIONS, HAIR_LENGTH_OPTIONS, HIJAB_STYLE_DETAIL_OPTIONS,
    CLOTHING_CASUAL_OPTIONS, CLOTHING_ISLAMIK_OPTIONS, CLOTHING_CULTURAL_OPTIONS, CLOTHING_STYLO_OPTIONS,
    CLOTHING_TRENDING_OPTIONS, CLOTHING_BOTTOM_OPTIONS, COLOR_OPTIONS, PERSONALITY_OPTIONS, POSE_OPTIONS,
    SETTING_OPTIONS, PHOTO_STYLE_OPTIONS
} from '../constants/options';
import { fileToBase64 } from "../utils/fileUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatOptionsForPrompt = (options: {value: string}[]) => {
    return options.map(o => `'${o.value}'`).join(', ');
};

export const analyzeCharacterImage = async (base64ImageData: string, mimeType: string) => {
    const systemInstruction = `You are a meticulous character analyst for film pre-production. Your task is to analyze the provided image and extract a comprehensive set of character attributes. Your output MUST be a single, valid JSON object matching the provided schema. For fields with predefined options, you MUST return one of the exact string values provided in the schema description. For colors, return the closest matching hex code from the options. Infer attributes like personality and age based on visual cues. Be extremely detailed in your analysis.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            gender: { type: Type.STRING, description: `Infer the character's gender/appearance. Choose one of: ${formatOptionsForPrompt(GENDER_OPTIONS)}` },
            age: { type: Type.STRING, description: "Estimate the character's age. Format as 'XX years old'. Example: '28 years old'." },
            ethnicity: { type: Type.STRING, description: `Infer ethnicity. Choose one of: ${formatOptionsForPrompt(ETHNICITY_OPTIONS)}` },
            skinTone: { type: Type.STRING, description: `Describe skin tone. Choose one of: ${formatOptionsForPrompt(SKIN_TONE_OPTIONS)}` },
            height: { type: Type.STRING, description: `Estimate height from their visible proportions. Choose one of: ${formatOptionsForPrompt(HEIGHT_OPTIONS)}` },
            build: { type: Type.STRING, description: `Describe body build. Choose one of: ${formatOptionsForPrompt(BODY_BUILD_OPTIONS)}` },
            faceShape: { type: Type.STRING, description: `Identify face shape. Choose one of: ${formatOptionsForPrompt(FACE_SHAPE_OPTIONS)}` },
            eyeShape: { type: Type.STRING, description: `Identify eye shape. Choose one of: ${formatOptionsForPrompt(EYE_SHAPE_OPTIONS)}` },
            eyeColor: { type: Type.STRING, description: `Identify eye color. Choose one of: ${formatOptionsForPrompt(EYE_COLOR_OPTIONS)}` },
            eyebrows: { type: Type.STRING, description: `Describe eyebrows. Choose one of: ${formatOptionsForPrompt(EYEBROW_OPTIONS)}` },
            noseShape: { type: Type.STRING, description: `Identify nose shape. Choose one of: ${formatOptionsForPrompt(NOSE_SHAPE_OPTIONS)}` },
            lipsShape: { type: Type.STRING, description: `Identify lip shape. Choose one of: ${formatOptionsForPrompt(LIP_SHAPE_OPTIONS)}` },
            features: { type: Type.STRING, description: "Describe any unique facial features like moles, scars, freckles, dimples." },
            hairStyle: { type: Type.STRING, description: `Identify hair style (freehair, hijab, turban, bald). Choose one of: ${formatOptionsForPrompt(HAIR_STYLE_OPTIONS)}` },
            hairType: { type: Type.STRING, description: `If hair is visible, identify its type. Choose one of: ${formatOptionsForPrompt(HAIR_TYPE_OPTIONS)}` },
            hairLength: { type: Type.STRING, description: `If hair is visible, estimate its length. Choose one of: ${formatOptionsForPrompt(HAIR_LENGTH_OPTIONS)}` },
            hairColor: { type: Type.STRING, description: "If hair is visible, describe its color (e.g., natural black, dyed blonde)." },
            hijabStyleDetail: { type: Type.STRING, description: `If wearing a hijab/turban, identify the style. Choose one of: ${formatOptionsForPrompt(HIJAB_STYLE_DETAIL_OPTIONS)}` },
            hijabColor: { type: Type.STRING, description: "If wearing a hijab/turban, describe its color and fabric if possible (e.g., soft beige chiffon)." },
            clothingCasual: { type: Type.STRING, description: `Identify the main casual top wear. Choose one of: ${formatOptionsForPrompt(CLOTHING_CASUAL_OPTIONS)}` },
            clothingIslamik: { type: Type.STRING, description: `Identify any Islamic-style clothing. Choose one of: ${formatOptionsForPrompt(CLOTHING_ISLAMIK_OPTIONS)}` },
            clothingCultural: { type: Type.STRING, description: `Identify any cultural-style clothing. Choose one of: ${formatOptionsForPrompt(CLOTHING_CULTURAL_OPTIONS)}` },
            clothingStylo: { type: Type.STRING, description: `Identify any high-fashion/stylish top wear. Choose one of: ${formatOptionsForPrompt(CLOTHING_STYLO_OPTIONS)}` },
            clothingTrending: { type: Type.STRING, description: `Identify any trending/viral style clothing. Choose one of: ${formatOptionsForPrompt(CLOTHING_TRENDING_OPTIONS)}` },
            clothingBottom: { type: Type.STRING, description: `Identify the bottom wear. Choose one of: ${formatOptionsForPrompt(CLOTHING_BOTTOM_OPTIONS)}` },
            topColor: { type: Type.STRING, description: `Identify the primary color of the top wear. Return the closest hex code from this list: ${COLOR_OPTIONS.map(o => `'${o.value}'`).join(', ')}` },
            bottomColor: { type: Type.STRING, description: `Identify the primary color of the bottom wear. Return the closest hex code from this list: ${COLOR_OPTIONS.map(o => `'${o.value}'`).join(', ')}` },
            accessories: { type: Type.STRING, description: "List any visible accessories (e.g., silver watch, glasses, necklace)." },
            personality: { type: Type.STRING, description: `Infer personality from expression/pose. Choose one of: ${formatOptionsForPrompt(PERSONALITY_OPTIONS)}` },
            pose: { type: Type.STRING, description: `Describe the character's pose. Choose one of: ${formatOptionsForPrompt(POSE_OPTIONS)}` },
            setting: { type: Type.STRING, description: `Describe the background/setting. Choose the closest option: ${formatOptionsForPrompt(SETTING_OPTIONS)}` },
            photoStyle: { type: Type.STRING, description: `Describe the photographic style. Choose the closest option: ${formatOptionsForPrompt(PHOTO_STYLE_OPTIONS)}` },
        },
        required: []
    };

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: "Analyze this character image and extract all details according to the schema." },
                    { inlineData: { mimeType: mimeType, data: base64ImageData }}
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson;

    } catch (error) {
        console.error("Error calling Gemini API for character analysis:", error);
        let errorMessage = "An unknown error occurred while contacting the Gemini API.";
        if (error instanceof Error) {
            errorMessage = `API Error: ${error.message}. The AI may have returned an invalid JSON format.`;
        }
        if (error instanceof SyntaxError) {
             errorMessage = `JSON Parsing Error: The AI returned a response that was not valid JSON.`;
        }
        throw new Error(errorMessage);
    }
}

const generateMovementPrompt = async (base64ImageData: string, mimeType: string, includeLightMovement: boolean) => {
    let systemPrompt = `You are an AI videography expert for high-end gold product commercials. Your task is to generate a single, highly professional, and concise prompt for Google's Veo video generation model.
Analyze the provided image of a gold product (e.g., chain, ring, bracelet).
Focus *exclusively* on a single, famous, impactful, and professional camera *movement* or videography technique that would best highlight the features (texture, shine, craftsmanship, multi-tone gold, clasp, etc.) of *this specific gold product*.
Do NOT include any details about product description, lighting, background, or camera settings – ONLY the camera movement.
Examples of professional movements: 'Smooth 360-degree orbit shot', 'Precise macro slider push-in', 'Elegant crane shot revealing product', 'Dynamic shallow depth-of-field rack focus from background to product detail', 'Slow, sweeping drone-like reveal', 'Steadycam glide tracking across texture'.
Provide the prompt as a JSON object in the format {\"prompt\": \"your_single_professional_movement_prompt_here\"}.`;

    if (includeLightMovement) {
        systemPrompt = `You are an AI cinematography director specializing in luxury gold commercials. Your task is to create a prompt combining camera movement with a specific light effect to make the product sparkle.
1.  **Analyze the Product:** Analyze the provided gold product image.
2.  **Generate Camera Movement:** Devise a single, professional camera movement.
3.  **Generate a 'Sparkle' Effect:** Generate a simple, basic, and elegant light sparkle effect. This should be a quick, subtle flash, like a natural glint of light hitting polished gold. It MUST be appropriate and not look strange. Think 'a subtle sparkle flashes on the edge' or 'a quick glint of light travels across the surface'. Avoid complex or dramatic light movements.
4.  **Combine:** Merge them into one cohesive sentence, like "[Camera Movement] as [Light Sparkle Effect]".
The final output MUST be a JSON object in the format {\"prompt\": \"your_combined_movement_prompt_here\"}. Do not add any other details.`;
    }

    const userQuery = "Generate the single best, professional videography movement prompt for this gold product, suitable for Veo.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { inlineData: { mimeType: mimeType, data: base64ImageData }}
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "prompt": { "type": Type.STRING }
                    },
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && typeof parsedJson.prompt === 'string') {
            return parsedJson.prompt;
        } else {
            console.error("Invalid JSON structure in API response:", parsedJson);
            throw new Error("Failed to get a valid prompt from the API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
          throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

const generateAdvancedMovementPrompt = async (base64ImageData: string, mimeType: string, includeLightMovement: boolean) => {
    let systemPrompt = `You are an unbeatable, world-class gold product commercial director and a master prompter for Google's Veo video generation model. Your analysis is 1000 times more detailed than any other. You see not just a product, but a story of luxury, craftsmanship, and desire.

Analyze the provided image of a gold product with unparalleled expertise. Your analysis MUST consider:
- **Materiality & Light:** How light plays off the surfaces—the soft gleam on brushed gold, the sharp glint on polished facets, the interplay of multi-tone gold. Note the texture, weight, and perceived temperature.
- **Craftsmanship:** Zoom in on the micro-details—the precision of the clasp, the intricacy of the chain links, the setting of any stones. Your prompt should honor this artistry.
- **Brand Storytelling:** What is the brand's narrative? Is it heritage and timelessness? Modern minimalism? Bold audacity? The movement must reflect this brand soul.
- **Emotional Impact:** What feeling should the viewer experience? Awe? Desire? Confidence? Power? The camera's movement is your primary tool to evoke this emotion.

Your task is to generate THREE distinct, highly professional, and evocative prompt options, each targeting a different directorial style. The output MUST be a single, valid JSON object following this exact schema. Do NOT include any other text or explanation outside the JSON.

1.  **'cinematic_reveal'**: A grand, majestic, and awe-inspiring camera movement. Think high-end brand film. It should build anticipation and present the product as a treasured artifact. Use terms like 'slow, sweeping arc', 'majestic crane reveal', 'ethereal light wrap'.
2.  **'intricate_detail'**: A macro-focused, intimate, and mesmerizing camera movement. This highlights the masterful craftsmanship. The viewer should feel they can almost touch the detail. Use terms like 'precise macro probe lens slide', 'shallow depth-of-field rack focus', 'tracing the engravings'.
3.  **'dynamic_energy'**: A modern, bold, and energetic camera movement. This is for a high-fashion or trend-focused context. It should feel confident and exciting. Use terms like 'dynamic whip pan', 'energetic push-in with lens flare', 'staccato motion tracking'.`;

    if (includeLightMovement) {
        systemPrompt = `You are an unbeatable, world-class gold product commercial director and a master prompter for Google's Veo video generation model. Your analysis is 1000 times more detailed than any other.

Analyze the provided gold product, focusing on how to combine camera movement with a simple but elegant 'sparkle' effect. The sparkle should be quick, basic, and look natural on gold—like a subtle glint or flash. It must be appropriate for a luxury product. Avoid overly dramatic or prolonged light shows.

Your task is to generate THREE distinct prompt options. For each option, describe BOTH the camera movement AND a complementary, basic sparkle effect within a single prompt. The output MUST be a single, valid JSON object following this exact schema. Do NOT include any other text or explanation outside the JSON.

1.  **'cinematic_reveal'**: A grand, majestic shot. Combine a grand camera move with a single, subtle sparkle that reveals the product's shine. (e.g., '...as a subtle sparkle briefly catches the light on its polished surface.')
2.  **'intricate_detail'**: A macro-focused, intimate shot. Combine a precise camera move with a quick, small sparkle on a fine detail. (e.g., '...as a quick, tiny sparkle highlights the edge of the clasp.')
3.  **'dynamic_energy'**: A modern, bold, energetic shot. Combine a dynamic camera move with a sharp, clean flash of light that acts as a sparkle. (e.g., '...triggering a clean, sharp flash of light as the camera stops.')`;
    }

    const userQuery = "Provide your 1000x detailed analysis and generate the three distinct, professional Veo prompts for this gold product based on your expert directorial vision.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { inlineData: { mimeType: mimeType, data: base64ImageData }}
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "cinematic_reveal": { "type": Type.STRING, "description": "A grand, sweeping, cinematic prompt focused on revealing the product majestically." },
                        "intricate_detail": { "type": Type.STRING, "description": "A macro-level prompt focusing on the fine details, texture, and craftsmanship." },
                        "dynamic_energy": { "type": Type.STRING, "description": "A modern, energetic prompt with dynamic movement to create excitement." }
                    },
                    required: ["cinematic_reveal", "intricate_detail", "dynamic_energy"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && parsedJson.cinematic_reveal && parsedJson.intricate_detail && parsedJson.dynamic_energy) {
            return parsedJson;
        } else {
            console.error("Invalid JSON structure in advanced API response:", parsedJson);
            throw new Error("Failed to get a valid set of prompts from the advanced API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for advanced analysis:", error);
        if (error instanceof Error) {
          throw new Error(`Advanced API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the advanced Gemini API.");
    }
};

export const generateGoogleFlowCompositePrompts = async (contextImageBase64: string, productImageBase64: string, contextMime: string, productMime: string) => {
    const systemPrompt = `You are an AI Creative Director specializing in composite video generation using advanced tools like Google Flow (Veo) or similar materials-to-video workflows. Your expertise lies in seamlessly blending a specific PRODUCT into a specific CONTEXT (background or model) to create a high-end commercial video.

    **YOUR TASK:**
    1.  **Analyze Image 1 (Context):** Understand the lighting, depth, mood, perspective, and subject (e.g., a model's pose or a table setting).
    2.  **Analyze Image 2 (Product):** Understand the product's material (e.g., gold, leather), shape, and details.
    3.  **Generate Prompts:** Create 3 distinct, detailed video prompts that instruct an AI video generator to composite the Product into the Context.

    **THE 3 PROMPT STYLES:**
    1.  **Realistic Blend:** Focus on natural integration. The product should look like it physically belongs in the scene (e.g., worn by the model or resting on the surface). Match lighting and shadows perfectly.
    2.  **Luxury Commercial:** A high-end, glossy aesthetic. Emphasize the product's shine and allure within the context. Use terms like "soft focus," "glimmer," "cinematic lighting."
    3.  **Creative Transformation:** A more artistic approach. The product could materialize from particles, or the background could shift to highlight the product. Use terms like "morphing," "dissolving," "ethereal."

    **OUTPUT FORMAT:**
    Return a single JSON object with keys: "realistic_blend", "luxury_commercial", "creative_transformation". Each key must contain the string prompt in English.`;

    const userQuery = "Analyze the Context Image (Image 1) and Product Image (Image 2) and generate 3 professional composite video prompts.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { text: "Image 1: Context/Model/Background" },
                    { inlineData: { mimeType: contextMime, data: contextImageBase64 }},
                    { text: "Image 2: Product to Integrate" },
                    { inlineData: { mimeType: productMime, data: productImageBase64 }}
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "realistic_blend": { "type": Type.STRING, "description": "Prompt for natural integration." },
                        "luxury_commercial": { "type": Type.STRING, "description": "Prompt for high-end aesthetic." },
                        "creative_transformation": { "type": Type.STRING, "description": "Prompt for artistic composite." }
                    },
                    required: ["realistic_blend", "luxury_commercial", "creative_transformation"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && parsedJson.realistic_blend) {
            return parsedJson;
        } else {
            throw new Error("Invalid JSON response from AI.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for Google Flow prompts:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred.");
    }
};

export const generateProductActionPrompt = async (base64ImageData: string, mimeType: string, actionDescription: string, style: string, angle: string) => {
    const systemPrompt = `You are an expert creative director and AI image prompter specializing in high-end product photography. Your task is to generate a single, detailed, and professional image prompt suitable for advanced text-to-image models like Imagen or Midjourney.

You will be given a product image, a desired action, a photographic style, and a camera angle. Your goal is to merge these four elements into one cohesive and evocative prompt.

1.  **Analyze the Product:** First, meticulously analyze the provided product image. Identify its key characteristics: what is it (e.g., 'a gold ring'), its materials ('yellow gold', 'polished finish'), design details ('solitaire diamond setting', 'intricate band'), and overall aesthetic.
2.  **Incorporate the Action:** Seamlessly integrate the user's desired action. If the user provides a simple or basic action (e.g., 'held in hand'), your critical task is to embellish and professionalize it. For example, expand 'held in hand' to 'held delicately between the thumb and forefinger of a perfectly manicured hand, showcasing its elegant design against the skin'. Describe the context of the action naturally and evocatively.
3.  **Apply the Camera Angle:** Frame the shot using the specified camera angle ('${angle}'). This defines the viewer's perspective and dramatically influences the product's portrayal.
4.  **Apply the Style:** Infuse the entire prompt with the chosen photographic style ('${style}'). Describe the lighting (e.g., 'soft, diffused studio lighting', 'dramatic single-source hard light'), composition, and mood that aligns with the style.
5.  **Final Polish:** Combine everything into a single, rich paragraph. The final prompt should be in English to ensure maximum compatibility with image generation models.

The final output MUST be a single JSON object in the format: {"prompt": "your_generated_image_prompt_here"}. Do not include any other text or explanation.`;

    const userQuery = `Product Action: "${actionDescription}". Photographic Style: "${style}". Camera Angle: "${angle}". Generate the image prompt.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more creative model for this task
            contents: {
                parts: [
                    { text: userQuery },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "prompt": { "type": Type.STRING }
                    },
                    required: ["prompt"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && typeof parsedJson.prompt === 'string') {
            return parsedJson.prompt;
        } else {
            console.error("Invalid JSON structure in product action API response:", parsedJson);
            throw new Error("Failed to get a valid prompt from the API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for product action prompt:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

export const processBatchProductActionPrompts = async (
    files: any[],
    actionDescription: string,
    style: string,
    angle: string
) => {
    const promises = files.map(async (fileData) => {
        const { file, previewUrl } = fileData;
        try {
            const base64ImageData = await fileToBase64(file);
            const prompt = await generateProductActionPrompt(base64ImageData, file.type, actionDescription, style, angle);
            return { fileName: file.name, previewUrl, prompt };
        } catch (error) {
            return {
                fileName: file.name,
                previewUrl,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    });

    return await Promise.all(promises);
};

export const generateProductBackgroundPrompt = async (base64ImageData: string, mimeType: string, style: string, keywords: string) => {
    const systemPrompt = `You are an expert product photography set designer and creative director, specializing in luxury items, particularly gold jewelry. Your task is to generate a detailed and evocative background prompt for an image generation model (like Midjourney or Imagen).

You will be given a product image, a desired background style, and optional keywords. Your goal is to create a complete, professional, and visually stunning scene for the product to be placed in.

1.  **Analyze the Product:** Meticulously analyze the provided product image to understand its characteristics (e.g., a delicate gold chain, a chunky men's ring, its texture, its shine). This context is crucial for creating a complementary background.
2.  **Develop the Scene:** Based on the chosen style ('${style}'), brainstorm a complete scene.
    -   Describe the main **surface** or backdrop (e.g., 'a slab of black marble with faint white veins', 'soft, out-of-focus white silk fabric').
    -   Describe the **props** and their arrangement. Be specific and creative (e.g., 'a single, dewy black rose petal is placed delicately near the product', 'a few scattered drops of water catch the light').
    -   If the user provides keywords ('${keywords}'), integrate them naturally and creatively into the scene.
    -   Describe the **lighting** in detail to create mood (e.g., 'lit by a single, soft directional light from the top-left, creating long, gentle shadows', 'dramatic, high-contrast lighting from the side').
3.  **Compose the Prompt:** Combine all these elements into a single, rich paragraph. The prompt should be in English.
4.  **Crucial Rule:** The prompt must focus **EXCLUSIVELY** on the background, props, and lighting. **DO NOT** describe the main product (the gold item) itself. The prompt is for generating the *stage*, not the actor.

The final output MUST be a single JSON object in the format: {"prompt": "your_generated_background_prompt_here"}. Do not include any other text or explanation.`;

    const userQuery = `Background Style: "${style}". Optional Keywords: "${keywords}". Generate the background scene prompt.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { "prompt": { "type": Type.STRING } },
                    required: ["prompt"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && typeof parsedJson.prompt === 'string') {
            return parsedJson.prompt;
        } else {
            console.error("Invalid JSON structure in product background API response:", parsedJson);
            throw new Error("Failed to get a valid prompt from the API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for product background prompt:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

export const generateViralBatchPrompts = async (base64ImageData: string, mimeType: string, promptCount: number) => {
    const systemPrompt = `You are a world-class creative director and viral marketing expert specializing in short-form video content for platforms like TikTok and Instagram. Your task is to generate a batch of unique, highly creative video prompts based on a product image.

1.  **Deep Analysis:** First, conduct an extremely detailed analysis of the provided product image. Identify the product, its key selling points, texture, material, brand identity (e.g., luxury, minimalist, rustic), and target audience.
2.  **Viral Concepts:** Using this analysis, generate exactly ${promptCount} unique, highly creative, and viral video shot concepts.
3.  **Prompt Content:** Each prompt must be a concise, actionable idea for a short video (3-7 seconds), written in **English**. Focus on engaging visuals, trending styles (like ASMR, unboxing, satisfying loops, aesthetic showcases), and captivating micro-storytelling. Do not just describe camera movements; describe the *entire concept* of the shot.
4.  **Output Format:** The final output MUST be a single, valid JSON object with a single key "prompts", which is an array of strings. Each string in the array is a unique prompt. Do not add any other text or explanation outside the JSON.`;

    const userQuery = `Analyze this product and generate ${promptCount} viral video concepts.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "prompts": {
                            type: Type.ARRAY,
                            description: `An array of exactly ${promptCount} string prompts in English.`,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["prompts"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && Array.isArray(parsedJson.prompts)) {
            return parsedJson.prompts;
        } else {
            console.error("Invalid JSON structure in viral batch API response:", parsedJson);
            throw new Error("Failed to get a valid list of prompts from the API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for viral batch prompts:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

export const generateCollagePrompt = async (base64ImageData: string, mimeType: string, collageCount: number) => {
    const systemPrompt = `You are a creative director specializing in lifestyle montage and collage aesthetics for social media (TikTok/Reels/Instagram). Your task is to generate a **single, cohesive, and highly visual prompt** describing a split-screen or fast-cut montage featuring the provided product.

    **YOUR PROCESS:**
    1.  **Analyze the Product:** Deeply analyze the uploaded product image (vibe, material, usage).
    2.  **Follow the Style Guide:** The user wants "quick, aesthetic cuts from the wearer's POV".
        *   **Example Style:** "A series of quick, aesthetic cuts from the wearer's POV: the hand with the ring stirring a creamy iced latte, turning the page of a hardcover book, and resting on the steering wheel of a vintage car."
    3.  **Construct the Prompt:** Generate ${collageCount} distinct scenarios that match this aesthetic.
        *   Use phrases like "quick cuts", "POV", "split screen".
        *   Ensure the actions are relevant to the specific product found in the image.
    
    **KEY REQUIREMENTS:**
    -   Output ONE detailed prompt.
    -   English language.
    -   Must contain exactly ${collageCount} distinct scenes/cuts.
    -   Tone: "quick, aesthetic, viral, POV".

    **OUTPUT FORMAT:**
    The final output MUST be a single, valid JSON object with the key "prompt".`;

    const userQuery = `Analyze this product and generate a ${collageCount}-part lifestyle collage/montage prompt based on the aesthetic POV style.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { "prompt": { "type": Type.STRING } },
                    required: ["prompt"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && parsedJson.prompt) {
            return parsedJson.prompt;
        } else {
            console.error("Invalid JSON structure in collage API response:", parsedJson);
            throw new Error("Failed to get a valid prompt from the API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for collage prompt:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

export const generateStyleAnalysisPrompt = async (base64ImageData: string, mimeType: string) => {
    const systemPrompt = `You are a world-class expert in art history, photography, and digital art styles. Your task is to analyze an image and deconstruct its aesthetic into a detailed, professional prompt suitable for an advanced text-to-image model.

    1.  **Deep Analysis:** Meticulously examine the provided image. Identify its genre, subject matter, and composition.
    2.  **Style Identification:** Pinpoint the primary artistic or photographic style (e.g., 'cinematic portrait', 'vaporwave aesthetic', 'baroque oil painting', 'low-poly 3D render', 'vintage Kodachrome photo').
    3.  **Deconstruct Elements:** Break down the visual elements that create the style:
        *   **Lighting:** Describe the quality, direction, and color of the light.
        *   **Color Palette:** Detail the dominant colors, their harmony, and saturation.
        *   **Composition & Framing:** Explain the shot composition and camera characteristics.
        *   **Mood & Atmosphere:** Describe the overall feeling or emotion.
    4.  **Synthesize Prompt:** Combine all these observations into a single, cohesive, and richly detailed paragraph. The prompt should be a powerful instruction set to recreate a similar image.

    The final output MUST be a single JSON object in the format: {"prompt": "your_generated_image_prompt_here"}. Do not include any other text or explanation.`;

    const userQuery = `Analyze this image and generate a detailed style prompt.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { "prompt": { "type": Type.STRING } },
                    required: ["prompt"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && typeof parsedJson.prompt === 'string') {
            return parsedJson.prompt;
        } else {
            console.error("Invalid JSON structure in style analysis API response:", parsedJson);
            throw new Error("Failed to get a valid prompt from the API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for style analysis:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

export const analyzeBackgroundSet = async (base64ImageData: string, mimeType: string) => {
    const systemPrompt = `You are a professional set designer and photographer. Your task is to perform a 'Crazy Detailed' analysis of the background set design of the provided image.
    
    **CRITICAL RULE:** You MUST IGNORE the main foreground product (e.g., the gold jewelry, the watch, the shoe). Pretend it is not there. Focus ONLY on the "Stage", the "Background", and the "Atmosphere".

    Break down the visual concept into these specific categories with extreme detail:

    1.  **Core Theme:** The overall vibe (e.g., "Industrial Chic", "Soft Botanical", "Luxury Noir").
    2.  **Surfaces & Textures:** Describe the materials visible in the background (e.g., "Rough matte black slate stone", "Rippled water surface", "Soft beige velvet fabric").
    3.  **Props & Decor:** List the specific items used to dress the set (e.g., "Dried pampas grass", "Geometric concrete blocks", "Scattered gold flakes", "Water droplets").
    4.  **Lighting Setup:** Describe how the scene is lit (e.g., "Hard directional sunlight with sharp shadows", "Soft diffused top-down light", "Moody rim lighting").
    5.  **Color Palette:** Extract the specific 3-5 dominant hex color codes used in the BACKGROUND.
    6.  **Recreation Prompt:** Write a highly detailed prompt to recreate this *empty* background stage for a 3D render or photoshoot.

    The final output MUST be a single, valid JSON object matching the provided schema.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            theme: { type: Type.STRING, description: "The overall visual theme." },
            surface_and_texture: { type: Type.STRING, description: "Detailed description of surfaces and textures." },
            props_and_decor: { type: Type.STRING, description: "List of props and decorative elements." },
            lighting_setup: { type: Type.STRING, description: "Description of the lighting technique." },
            color_palette: { 
                type: Type.ARRAY, 
                description: "Array of hex color codes found in the background.",
                items: { type: Type.STRING } 
            },
            recreation_prompt: { type: Type.STRING, description: "A detailed prompt to generate this background without the product." }
        },
        required: ["theme", "surface_and_texture", "props_and_decor", "lighting_setup", "color_palette", "recreation_prompt"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: "Analyze the background set design of this image, ignoring the product." },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for background analysis:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred.");
    }
};

export const generateStyleTransferPrompt = async (productBase64: string, productMime: string, styleBase64: string, styleMime: string) => {
    const systemPrompt = `You are an expert creative director and AI prompter specializing in jewelry and gold products.
    
    **YOUR TASK:**
    You will be given two images:
    1.  **Image 1 (Product):** A gold product (ring, chain, bar, etc.).
    2.  **Image 2 (Style Reference):** A reference image showing a specific photographic style, lighting, mood, background, or composition.
    
    **GOAL:**
    Write a single, highly detailed text-to-image prompt. This prompt should describe the **Product from Image 1** being photographed in the exact **Style/Setting of Image 2**.

    **INSTRUCTIONS:**
    1.  **Analyze Product:** Identify the type of gold item, its texture (polished/matte), and key details from Image 1.
    2.  **Analyze Style:** Identify the lighting (soft, hard, neon, natural), the background materials (silk, stone, water, dark void), the color palette, and the camera angle from Image 2.
    3.  **Synthesize:** Combine them. The prompt should explicitly describe the gold product but place it into the context of the style reference. Ensure the gold material is described accurately.
    
    The final output MUST be a single JSON object in the format: {"prompt": "your_generated_prompt_here"}. Do not include any other text.`;

    const userQuery = "Generate a prompt to render Product 1 using the style of Style Reference 2.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: userQuery },
                    { text: "Image 1: The Product (Gold/Jewelry)" },
                    { inlineData: { mimeType: productMime, data: productBase64 }},
                    { text: "Image 2: The Style Reference (Copy this look)" },
                    { inlineData: { mimeType: styleMime, data: styleBase64 }}
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { "prompt": { "type": Type.STRING } },
                    required: ["prompt"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson && parsedJson.prompt) {
            return parsedJson.prompt;
        } else {
             throw new Error("Invalid JSON response.");
        }

    } catch (error) {
         console.error("Error calling Gemini API for style transfer:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred.");
    }
}

export const generatePosterPrompt = async (
    styleBase64: string,
    styleMime: string,
    posterDescription: string,
    personBase64?: string | null,
    personMime?: string | null
) => {
    let systemPrompt = `You are a professional graphic designer and AI prompter. Your task is to generate a highly detailed image prompt for creating a POSTER.
    
    **INPUT:**
    1.  **Style Reference Image:** Analyze this image for its graphic design aesthetic. Look at the layout, typography style (bold, minimal, handwritten), color palette, visual hierarchy, and overall mood.
    2.  **Poster Description:** The user will tell you what the poster is ABOUT (the content/topic).
    
    **GOAL:**
    Write a text-to-image prompt to create a NEW poster about the [Poster Description] using the exact [Style Reference] aesthetic.

    **INSTRUCTIONS:**
    -   Describe the layout and composition based on the reference.
    -   Describe the typography style and placement (e.g., "Bold sans-serif text centered at the top").
    -   Describe the color palette and background elements from the reference.
    -   Apply these visual rules to the user's specific topic.
    
    The final output MUST be a single JSON object in the format: {"prompt": "your_generated_prompt_here"}. Do not include any other text.`;

    const parts: any[] = [
        { text: `Create a poster prompt for: "${posterDescription}"` },
        { text: "Input 1: Style Reference Image" },
        { inlineData: { mimeType: styleMime, data: styleBase64 } }
    ];

    if (personBase64 && personMime) {
        systemPrompt = `You are a world-class AI Prompt Engineer specializing in "Image Compositing". 
        
        **YOUR MISSION (PRO MODE):**
        You need to generate a precise prompt for a high-end AI image generator (like Gemini Image or Midjourney).
        You have THREE inputs:
        1.  **Style Reference Image:** The graphic design, layout, and art style to copy.
        2.  **Person Image (Subject):** A specific person that MUST be composited into the poster.
        3.  **Poster Description:** The topic/text content.

        **CRITICAL INSTRUCTION:**
        Your output prompt must instruct the AI to:
        -   Create a poster about [Poster Description].
        -   Use the **visual style** of Input 1 (Style Reference).
        -   **COMPOSITE** the person from Input 2 (Person Image) into the poster.
        -   Analyze the person in Input 2 (their pose, clothing, gender) and explicitly describe them in the prompt so the generator knows who to render, OR explicitly state "featuring the person from the reference image" if the target tool supports image referencing.
        -   Ensure the person matches the artistic style of the poster (e.g., if the poster is a vector illustration, the person should be rendered as a vector illustration).

        The final output MUST be a single JSON object in the format: {"prompt": "your_generated_prompt_here"}.`;

        parts.push({ text: "Input 2: Person/Subject Image to Composite" });
        parts.push({ inlineData: { mimeType: personMime, data: personBase64 } });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: parts
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { "prompt": { "type": Type.STRING } },
                    required: ["prompt"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson && parsedJson.prompt) {
            return parsedJson.prompt;
        } else {
             throw new Error("Invalid JSON response.");
        }

    } catch (error) {
         console.error("Error calling Gemini API for poster generator:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred.");
    }
}

export const analyzeImageForInfo = async (base64ImageData: string, mimeType: string) => {
    const systemPrompt = `You are an expert data analyst and Optical Character Recognition (OCR) specialist. Your primary task is to meticulously analyze the provided image to extract all textual and numerical information with extreme precision. After extraction, you must provide a structured analysis of the data.

Your process:
1.  **Scan and Extract:** Identify and extract every piece of visible text and every number from the image. This includes small print, stylized fonts, and handwritten notes if legible.
2.  **Categorize:** Separate the extracted information into 'text' and 'numbers'. Numerical data like dates, phone numbers, prices, and identifiers should be in the 'numbers' category.
3.  **Summarize and Analyze:** Determine the context of the image (e.g., is it a receipt, a business card, a product label, a street sign, an infographic?).
4.  **Synthesize:** Provide a concise summary and a detailed analysis explaining the significance of the extracted information within the image's context.

The final output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any other text or explanation outside of this JSON object.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: "A concise, one or two-sentence summary of the image's content and the primary purpose of the information within it."
            },
            extractedText: {
                type: Type.ARRAY,
                description: "An array of all distinct text strings found in the image. Each element is a string.",
                items: { type: Type.STRING }
            },
            extractedNumbers: {
                type: Type.ARRAY,
                description: "An array of all distinct numbers or numerical strings (like prices, dates, phone numbers) found in the image. Each element is a string.",
                items: { type: Type.STRING }
            },
            detailedAnalysis: {
                type: Type.STRING,
                description: "A detailed, paragraph-form analysis explaining the context and significance of the extracted text and numbers. Identify what the document/image is (e.g., receipt, business card, sign) and interpret the data."
            }
        },
        required: ["summary", "extractedText", "extractedNumbers", "detailedAnalysis"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: "Analyze this image for all textual and numerical data and provide a structured analysis." },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for info extraction:", error);
        let errorMessage = "An unknown error occurred while contacting the Gemini API.";
        if (error instanceof Error) {
            errorMessage = `API Error: ${error.message}. The AI may have returned an invalid JSON format.`;
        }
        if (error instanceof SyntaxError) {
             errorMessage = `JSON Parsing Error: The AI returned a response that was not valid JSON.`;
        }
        throw new Error(errorMessage);
    }
};

export const analyzeGraphicImage = async (base64ImageData: string, mimeType: string) => {
    const systemPrompt = `You are a world-class data visualization analyst. Your task is to meticulously analyze the provided image of a graphic (like a bar chart, line graph, or infographic) and extract its core data and design elements into a structured JSON format. The goal is to capture enough information to regenerate a similar chart. Pay close attention to the relationship between data points, for example, a year and its corresponding monetary value must be linked correctly.

Your process:
1.  **Identify:** Determine the title, type of graphic, and its main purpose.
2.  **Extract Data:** Accurately extract all data points. This includes labels, values, and categories. For charts, identify the data and units for the X and Y axes.
3.  **Deconstruct Design:** Describe the key visual elements like the color palette and overall style.
4.  **Summarize Insights:** Provide key takeaways that can be inferred from the data.
5.  **Generate Prompt:** Create a detailed text-to-image prompt that uses the extracted data and design notes to describe a new, similar graphic for an AI image generator.

The final output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any other text or explanation outside of this JSON object.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "The main title of the graphic."
            },
            graphicType: {
                type: Type.STRING,
                description: "The type of graphic (e.g., 'Vertical Bar Chart', 'Line Graph', 'Pie Chart', 'Infographic')."
            },
            summary: {
                type: Type.STRING,
                description: "A brief, one-sentence summary of what the graphic illustrates."
            },
            dataPoints: {
                type: Type.ARRAY,
                description: "An array of structured data points from the graphic.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING, description: "The primary label for the data point (e.g., a year, a category name)." },
                        value: { type: Type.STRING, description: "The value associated with the label (e.g., 'RM 1.5M', '75%')." },
                        category: { type: Type.STRING, description: "Optional category or series the data point belongs to, often from the legend." },
                    },
                    required: ["label", "value"]
                }
            },
            xAxis: {
                type: Type.OBJECT,
                description: "Details of the X-axis, if applicable.",
                properties: {
                    label: { type: Type.STRING, description: "The title or label for the X-axis." },
                    unit: { type: Type.STRING, description: "The unit of measurement for the X-axis (e.g., 'Year', 'Month')." }
                }
            },
            yAxis: {
                type: Type.OBJECT,
                description: "Details of the Y-axis, if applicable.",
                properties: {
                    label: { type: Type.STRING, description: "The title or label for the Y-axis." },
                    unit: { type: Type.STRING, description: "The unit of measurement for the Y-axis (e.g., 'in millions RM', 'Percentage')." }
                }
            },
            keyTakeaways: {
                type: Type.ARRAY,
                description: "A list of 2-3 key insights or conclusions that can be drawn from the graphic's data.",
                items: { type: Type.STRING }
            },
            regeneratePrompt: {
                type: Type.STRING,
                description: "A detailed, descriptive text-to-image prompt to regenerate a visually similar graphic. It should include the chart type, data, labels, colors, and overall style."
            }
        },
        required: ["title", "graphicType", "summary", "dataPoints", "keyTakeaways", "regeneratePrompt"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: "Analyze this graphic and extract its data and design elements into the specified JSON format." },
                    { inlineData: { mimeType: mimeType, data: base64ImageData } }
                ]
            },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for graphic analysis:", error);
        let errorMessage = "An unknown error occurred while contacting the Gemini API.";
        if (error instanceof Error) {
            errorMessage = `API Error: ${error.message}. The AI may have returned an invalid JSON format.`;
        }
        if (error instanceof SyntaxError) {
             errorMessage = `JSON Parsing Error: The AI returned a response that was not valid JSON.`;
        }
        throw new Error(errorMessage);
    }
};

export const generateScenePrompt = async (
    description: string,
    numScenes: number,
    style: string,
    narrativeMode: boolean,
    includeTransitions: boolean,
    genre: string,
    isTikTokFormat: boolean,
    disableTextOverlay: boolean
) => {

    let narrativeInstructions = '';
    if (narrativeMode) {
        narrativeInstructions = `CRITICAL NARRATIVE INSTRUCTION: The scenes must form a coherent, continuous story. Ensure the action and dialogue connect logically from one scene to the next.`;
        if (includeTransitions) {
            narrativeInstructions += `\n\nAdditionally, you MUST intelligently insert transition scenes (e.g., establishing shots, travel sequences, passing of time montages) between key plot points to enhance the narrative flow. The total number of scenes generated must still be exactly ${numScenes}.`;
        }
    } else {
        narrativeInstructions = `CRITICAL NARRATIVE INSTRUCTION: The scenes should be independent variations based on the story description. They do NOT need to connect into a linear story.`;
    }

    let genreInstruction = '';
    if (genre) {
        genreInstruction = `\n\nGENRE & MOOD: The scenes must adhere to the '${genre}' genre. Infuse the descriptions, actions, lighting, and music with the appropriate atmosphere. For 'horror', build suspense. For 'comedy', focus on timing. For 'drama', emphasize emotional conflict.`;
    }

    let tikTokInstruction = '';
    let jsonFormatDescription = '';

    const dialoguePartStandard = `,
  "dialogue": [
    {
      "speaker": "[Character Name or 'Voice Over' or 'Off-screen']",
      "voice": "[e.g., Friendly, tired, etc.]",
      "language": "ms-MY",
      "line": "[Dialogue line in Bahasa Melayu]"
    }
  ],
  "lip_sync_director_note": "[Note for the animator]"`;

    const dialoguePartTiktok = `,
  "dialogue": [
    {
      "speaker": "[Character Name]",
      "voice": "[e.g., Whispering, Excited]",
      "language": "ms-MY",
      "line": "[Short and catchy dialogue line in Bahasa Melayu, if any]"
    }
  ],
  "lip_sync_director_note": "Ensure lip-sync matches the short dialogue precisely."`;

    const standardJsonFormat = `{
  "scene_id": "S[scene_number]",
  "duration_sec": 8,
  "visual_style": "${style}",
  "background_lock": {
    "setting": "[Overall location]",
    "scenery": "[Specific details of the environment]",
    "props": "[Objects in the scene]",
    "lighting": "[Lighting description]"
  },
  "camera": {
    "framing": "[e.g., Medium Wide Shot (MWS), Close-Up (CU)]",
    "angle": "[e.g., Eye-level, Low angle]",
    "movement": "[e.g., Static hold, Slow dolly forward]",
    "focus": "[Description of focus]"
  },
  "foley_and_ambience": {
    "ambience": ["[Sound 1", "Sound 2"]",
    "fx": ["[Sound Effect 1", "Sound Effect 2"]",
    "music": "[Music description]"
  }${dialoguePartStandard}
}`;

    const tiktokJsonFormat = `{
  "scene_id": "S[scene_number]",
  "duration_sec": 8,
  "visual_style": "${style}",
  "background_lock": { /* ... */ },
  "camera": {
    "framing": "[e.g., Medium Close-Up (MCU), Selfie angle]",
    "angle": "[e.g., POV, Eye-level]",
    "movement": "[e.g., Quick zoom in, Whip pan, Static hold]",
    "focus": "[Description of focus]"
  },
  "tiktok_flow": {
    "hook": "[1-3 second visual or audio hook to grab attention.]",
    "buildup": "[3-5 seconds of developing action. Keep it concise.]",
    "reveal_or_climax": "[The key moment, punchline, or surprise.]",
    "call_to_action_or_cliffhanger": "[Action to encourage engagement or lead to the next scene.]"
  }${!disableTextOverlay ? `,\n  "text_overlay": "[Text that appears on screen, e.g., 'Part 1', 'Wait till the end...']"` : ''},
  "foley_and_ambience": {
    "ambience": "[]",
    "fx": ["[Sound Effect 1", "Sound Effect 2"]",
    "music": "[Suggest a style of trending TikTok audio, e.g., 'A trending, upbeat pop song']"
  }${dialoguePartTiktok}
}`;

    if (isTikTokFormat) {
        tikTokInstruction = `\n\nCRITICAL TIKTOK FORMATTING INSTRUCTION: While following all other instructions (narrative, genre, etc.), you MUST structure each scene to be highly engaging for a short-form video platform like TikTok. This means each scene needs a strong visual/audio hook, rapid pacing, and a compelling micro-narrative. The goal is maximum audience retention.`;
        jsonFormatDescription = tiktokJsonFormat;
    } else {
        jsonFormatDescription = standardJsonFormat;
    }

    let textOverlayInstruction = '';
    if (disableTextOverlay) {
        textOverlayInstruction = `\n\nCRITICAL TEXT INSTRUCTION: You are strictly forbidden from including the "text_overlay" field in the JSON output for every scene. The output must not contain any on-screen text elements. This is a hard rule. Dialogue and voice are still required.`;
    }

    const systemPrompt = `You are an expert animation and film pre-production assistant. Your task is to take a user's story description and break it down into a detailed scene prompts in JSON format.
Generate exactly ${numScenes} scene objects. The output MUST be a valid JSON array of objects (or a single object if numScenes=1).
The "duration_sec" for each scene MUST be exactly 8 seconds.
${narrativeInstructions}
${genreInstruction}
${tikTokInstruction}
${textOverlayInstruction}
Each object in the array must strictly follow this format:
${jsonFormatDescription}
Be creative with the details but be absolutely strict with the JSON format. The final output must be ONLY the JSON array/object. All dialogue 'line' MUST be in Bahasa Melayu.`;


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: description,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson;

    } catch (error) {
        console.error("Error calling Gemini API for scene generation:", error);
        let errorMessage = "An unknown error occurred while contacting the Gemini API.";
        if (error instanceof Error) {
            errorMessage = `API Error: ${error.message}. The AI may have returned an invalid JSON format. Try simplifying your description or generating fewer scenes.`;
        }
        if (error instanceof SyntaxError) {
             errorMessage = `JSON Parsing Error: The AI returned a response that was not valid JSON. This can happen with very complex requests. Please try again.`;
        }
        throw new Error(errorMessage);
    }
};

export const processFilesForPrompts = async (files: any[], includeLightMovement: boolean) => {
    const analysisPromises = files.map(async (fileData) => {
        const { file, previewUrl } = fileData;
        try {
            const mimeType = file.type;
            if (!['image/jpeg', 'image/png'].includes(mimeType)) {
                throw new Error(`'${file.name}' is not a valid image type.`);
            }
            const base64ImageData = await fileToBase64(file);
            const prompt = await generateMovementPrompt(base64ImageData, mimeType, includeLightMovement);
            return { fileName: file.name, prompt, previewUrl };
        } catch (error)
            {
            return {
                fileName: file.name,
                previewUrl,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    });

    return await Promise.all(analysisPromises);
};

export const processFilesForAdvancedPrompts = async (files: any[], includeLightMovement: boolean) => {
    const analysisPromises = files.map(async (fileData) => {
        const { file, previewUrl } = fileData;
        try {
            const mimeType = file.type;
            if (!['image/jpeg', 'image/png'].includes(mimeType)) {
                throw new Error(`'${file.name}' is not a valid image type.`);
            }
            const base64ImageData = await fileToBase64(file);
            const prompts = await generateAdvancedMovementPrompt(base64ImageData, mimeType, includeLightMovement);
            return { fileName: file.name, prompts, previewUrl };
        } catch (error)
            {
            return {
                fileName: file.name,
                previewUrl,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    });

    return await Promise.all(analysisPromises);
};

export const generateMalayPromptVariants = async (concept: string, quantity: number, useOutdoorVibrance: boolean) => {
    const lightingInstruction = useOutdoorVibrance
        ? "The lighting must be **bright, natural daylight** to create a clean, vibrant, and realistic outdoor look. **DO NOT use 'golden hour' lighting.**"
        : "The lighting should be appropriate for the scene, creating a realistic and high-quality photograph.";

    const varietyInstruction = useOutdoorVibrance
        ? "Each prompt must be unique. Vary the camera angle, composition, character's expression, and specific details of the action or environment while maintaining the daylight setting."
        : "Each prompt must be unique. Vary the camera angle, composition, character's expression, and specific details of the action or environment.";
        
    const systemPrompt = `You are a creative director specializing in generating image prompts with a distinct modern Malaysian aesthetic. Your task is to take a user's core concept and generate a specific number of creative, detailed, and unique variations.
**NON-NEGOTIABLE RULES:**
1.  **Style:** Every prompt must generate a **realistic, high-quality photograph**.
2.  **Lighting:** ${lightingInstruction}
3.  **Cultural Context:** The scenes, characters, and environment must feel authentically Malaysian.
4.  **Hijab Mandate:** If the prompt describes a female character, she **MUST** be described as wearing a **'bawal' style hijab**. This is a strict requirement. For example, "seorang nenek memakai tudung bawal..."
5.  **Variety:** ${varietyInstruction}
6.  **Output Format:** The final output MUST be a single, valid JSON object with a single key "prompts", which is an array of strings. Each string in the array is a unique prompt. Do not add any other text or explanation outside the JSON.`;

    const userQuery = `Generate ${quantity} variations for the concept: "${concept}".${useOutdoorVibrance ? " Ensure all prompts use natural daylight." : ""}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userQuery,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "prompts": {
                            type: Type.ARRAY,
                            description: `An array of exactly ${quantity} string prompts.`,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["prompts"]
                }
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && Array.isArray(parsedJson.prompts)) {
            return parsedJson.prompts;
        } else {
            console.error("Invalid JSON structure in Malay variant API response:", parsedJson);
            throw new Error("Failed to get a valid list of prompts from the API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for Malay variant prompts:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

export const getAssistantResponseStream = async (chatHistory: { role: 'user' | 'model', content: string }[]) => {
    const systemInstruction = `You are a specialized AI assistant for the 'AI Prompt Generator Studio'. Your goal is to help users create high-quality prompts for generative AI (image & video).

    **CRITICAL OUTPUT FORMATTING RULES:**
    1.  **Structure:** Use a clean, organized structure. Use **Bold** for headers or key concepts. Use lists (- item) for multiple points.
    2.  **Prompts:** When you provide an AI prompt, you **MUST** wrap it in a code block using triple backticks (\`\`\`). This allows the user to easily copy it.
        *   Example:
            Here is your prompt:
            \`\`\`
            A cinematic shot of a cyberpunk city...
            \`\`\`
    3.  **Tone:** Be professional, sophisticated, and helpful. Explain *why* a prompt works (lighting, composition, style).
    4.  **Language:** Respond in the same language the user uses (English or Malay), but prompts should generally be in English for best AI results.

    Keep your responses concise but comprehensive.`;

    const contents = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: contents as any,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return responseStream;

    } catch (error) {
        console.error("Error calling Gemini API for assistant:", error);
        let errorMessage = "An unknown error occurred while contacting the Gemini API.";
        if (error instanceof Error) {
            errorMessage = `API Error: ${error.message}.`;
        }
        throw new Error(errorMessage);
    }
};

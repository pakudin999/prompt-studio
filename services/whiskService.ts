
export interface WhiskImageResult {
    prompt: string;
    imageUrl?: string;
    error?: string;
}

// Hardcoded endpoint for Imagen 3 via Generative Language API
const TARGET_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict";

export const generateImageFromWhisk = async (prompt: string, apiKey: string): Promise<WhiskImageResult> => {
    try {
        // Clean the token: remove 'Bearer ' prefix if the user pasted it in
        const cleanToken = apiKey.replace(/^Bearer\s+/i, '').trim();

        // Construct the request body for standard Google/Vertex Image Generation APIs
        const requestBody = {
            instances: [
                {
                    prompt: prompt
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: "1:1"
            }
        };

        const response = await fetch(TARGET_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cleanToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `API Error ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error && errorJson.error.message) {
                    errorMsg = errorJson.error.message;
                }
            } catch (e) {
                errorMsg += `: ${errorText}`;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();

        // Handle Generative Language API response structure
        if (data.predictions && data.predictions.length > 0) {
            const prediction = data.predictions[0];
            
            // Check for direct bytesBase64Encoded (standard) or mimeType structure
            const imageBytes = prediction.bytesBase64Encoded || 
                               (prediction.mimeType && prediction.bytesBase64Encoded ? prediction.bytesBase64Encoded : null);
            
            if (imageBytes) {
                return {
                    prompt,
                    imageUrl: `data:image/png;base64,${imageBytes}`
                };
            }
        }

        throw new Error("No image data found in response. Token might be expired or invalid.");

    } catch (error) {
        return {
            prompt,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};

export const processWhiskBatch = async (
    promptsText: string, 
    apiKey: string, 
    onProgress: (completed: number, total: number) => void
): Promise<WhiskImageResult[]> => {
    // Split by newlines and filter out empty lines to handle "selang satu baris"
    const prompts = promptsText.split('\n').map(p => p.trim()).filter(line => line !== '');
    const results: WhiskImageResult[] = [];

    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const result = await generateImageFromWhisk(prompt, apiKey);
        results.push(result);
        onProgress(i + 1, prompts.length);
    }

    return results;
};

export const buildCharacterPrompt = (formData: any) => {
    const {
        name, gender, age, ethnicity, skinTone, height, build, faceShape,
        eyeShape, eyeColor, eyebrows, noseShape, lipsShape, features,
        hairStyle, hairType, hairLength, hairColor, hijabStyle, hijabColor,
        hijabStyleDetail, voicePitch, voiceTone, speakingStyle, language,
        clothingCasual, clothingIslamik, clothingCultural, clothingStylo,
        clothingTrending, clothingBottom, topColor, bottomColor,
        accessories, personality, pose, setting, photoStyle, dialogueTopic
    } = formData;

    let prompt = "A high-quality, detailed photo of ";
    const coreDetails = [gender, age, ethnicity, skinTone, build, height, faceShape, eyeShape, eyeColor, eyebrows, noseShape, lipsShape].filter(Boolean);

    if (coreDetails.length > 0) {
        prompt += `a ${coreDetails.join(', ')} character`;
    } else {
        prompt += "a character";
    }

    if (features) prompt += ` with ${features}`;
    prompt += ". ";

    if (hairStyle === 'freehair') {
        const hairParts = [hairLength, hairType, hairColor].filter(Boolean);
        if(hairParts.length > 0) prompt += `They have ${hairParts.join(' ')} hair. `;
    } else if (hairStyle === 'hijab' || hairStyle === 'turban') {
        const headwearParts = [hijabColor, hijabStyleDetail || hijabStyle].filter(Boolean);
        if(headwearParts.length > 0) prompt += `They are wearing a ${headwearParts.join(' ')}. `;
    } else if (hairStyle) {
        prompt += `They are ${hairStyle}. `;
    }

    const voiceAndLanguageParts: string[] = [];
    if (voicePitch || voiceTone) {
        const pitchPart = voicePitch ? `a ${voicePitch}` : '';
        const tonePart = voiceTone ? `a ${voiceTone}` : '';
        const voiceCombined = [pitchPart, tonePart].filter(Boolean).join(' and ');
        if (voiceCombined) {
            voiceAndLanguageParts.push(`has ${voiceCombined}`);
        }
    }
    if (speakingStyle) {
        voiceAndLanguageParts.push(speakingStyle);
    }
    if (language) {
        voiceAndLanguageParts.push(`speaks in ${language}`);
    }

    if (voiceAndLanguageParts.length > 0) {
        prompt += `Their voice and speech pattern is distinct: the character ${voiceAndLanguageParts.join(', ')}. `;
    }

    const top = clothingCasual || clothingIslamik || clothingCultural || clothingStylo || clothingTrending;
    let clothingDesc = "";
    let topDesc = "";
    let bottomDesc = "";

    if (top) {
        topDesc = topColor ? `${top} (color code: ${topColor})` : top;
    }

    if (clothingBottom) {
        bottomDesc = bottomColor ? `${clothingBottom} (color code: ${bottomColor})` : clothingBottom;
    }

    if (topDesc && bottomDesc) {
        clothingDesc = `wearing a ${topDesc} with ${bottomDesc}`;
    } else if (topDesc) {
        clothingDesc = `wearing a ${topDesc}`;
    } else if (bottomDesc) {
        clothingDesc = `wearing ${bottomDesc}`;
    }

    if(clothingDesc) {
        prompt += `For clothing, the character is ${clothingDesc}. `;
    }

    if (accessories) prompt += `They are accessorized with ${accessories}. `;

    if (pose || personality) {
        const poseAndPersonality = [
            pose,
            personality ? `has a ${personality} expression` : ''
        ].filter(Boolean).join(' and ');
        prompt += `The character is ${poseAndPersonality}. `;
    }

    if (setting) prompt += `The scene is ${setting}. `;
    if (photoStyle) prompt += `The image should be in a ${photoStyle} style.`;

    if (dialogueTopic) {
        prompt += `\n\nAdditionally, generate a short monologue or dialogue for this character. The character is speaking about "${dialogueTopic}". The speech should reflect their specified voice, personality, and language traits.`;
    }

    if (name) prompt += ` (Reference name: ${name})`;

    return prompt.replace(/ \. /g, '. ').replace(/  +/g, ' ').trim();
};

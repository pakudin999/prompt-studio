export const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                resolve(result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as a base64 string."));
            }
        };
        reader.onerror = error => reject(error);
    });
};

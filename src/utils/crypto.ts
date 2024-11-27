export async function encrypt(text: string, key: string): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(text);
    const encodedKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
    );

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        encodedKey,
        encodedText
    );

    const combined = new Uint8Array([...iv, ...new Uint8Array(ciphertext)]);
    return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedText: string, key: string): Promise<string> {
    const combined = new Uint8Array(
        atob(encryptedText).split('').map(c => c.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const encodedKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        encodedKey,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}
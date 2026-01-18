export async function generateSecureToken(): Promise<string> {
	const cryptoObj = globalThis.crypto;
	if (!cryptoObj?.getRandomValues) {
		throw new Error("Web Crypto API is not available in this runtime.");
	}

	const bytes = new Uint8Array(32);
	cryptoObj.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}

export async function generateTokenWithExpiry(hours: number = 24 * 7) {
	return {
		token: await generateSecureToken(),
		expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
	};
}

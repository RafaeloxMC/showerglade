import { randomBytes } from "crypto";

export function generateSecureToken(): string {
	return randomBytes(32).toString("hex");
}

export function generateTokenWithExpiry(hours: number = 24 * 7) {
	return {
		token: generateSecureToken(),
		expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
	};
}

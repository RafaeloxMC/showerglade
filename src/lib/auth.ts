import { NextRequest } from "next/server";
import { connectDB } from "@/database/db";
import Session from "@/database/schemas/Session";
import User, { IUser } from "@/database/schemas/User";

export async function authenticateUser(
	request: NextRequest,
): Promise<IUser | null> {
	try {
		let token = request.cookies.get("shovergladeCookie")?.value;

		if (!token) {
			const authHeader = request.headers.get("Authorization");
			if (authHeader?.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			}
		}

		if (!token) {
			return null;
		}

		await connectDB();

		const session = await Session.findOne({
			token,
			expiresAt: { $gt: new Date() },
		});

		if (!session) {
			return null;
		}

		const user = await User.findById(session.userId);

		return user;
	} catch (error) {
		console.error("Authentication error:", error);
		return null;
	}
}

export async function requireAuth(
	request: NextRequest,
): Promise<{ user: IUser } | { error: Response }> {
	const user = await authenticateUser(request);

	if (!user) {
		return {
			error: new Response(
				JSON.stringify({ message: "Authentication required" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			),
		};
	}

	return { user };
}

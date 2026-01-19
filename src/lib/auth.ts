import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import User, { IUser } from "@/database/schemas/User";
import { verify, JwtPayload } from "jsonwebtoken";

export async function authenticateUser(
	request: NextRequest,
): Promise<IUser | null> {
	try {
		let token = request.cookies.get("showergladeCookie")?.value;

		if (!token) {
			const authHeader = request.headers.get("Authorization");
			if (authHeader?.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			}
		}

		if (!token) {
			return null;
		}

		const decoded = verify(
			token,
			process.env.JWT_SECRET || "default_secret",
		) as JwtPayload;

		if (!decoded || !decoded.userId) {
			return null;
		}

		await connectDB();

		const user = await User.findById(decoded.userId);

		return user;
	} catch (error) {
		console.error("Authentication error:", error);
		return null;
	}
}

export async function requireAuth(
	request: NextRequest,
): Promise<{ user: IUser } | { error: NextResponse }> {
	const user = await authenticateUser(request);

	if (!user) {
		return {
			error: NextResponse.json(
				{ message: "Authentication required" },
				{
					status: 401,
				},
			),
		};
	}

	return { user };
}

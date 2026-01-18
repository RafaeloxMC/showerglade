import { connectDB } from "@/database/db";
import Session from "@/database/schemas/Session";
import { NextRequest, NextResponse } from "next/server";

async function handleLogout(request: NextRequest) {
	const token = request.cookies.get("shibaCookie")?.value;

	if (token) {
		try {
			await connectDB();
			await Session.deleteOne({ token });
		} catch (error) {
			console.error("Logout error:", error);
		}
	}

	const response = NextResponse.redirect(new URL("/", request.url));
	response.cookies.set("shovergladeCookie", "", {
		expires: new Date(0),
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
	});

	return response;
}

export async function POST(request: NextRequest) {
	return handleLogout(request);
}

export async function GET(request: NextRequest) {
	return handleLogout(request);
}

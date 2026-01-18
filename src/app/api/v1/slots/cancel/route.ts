import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Slot from "@/database/schemas/Slot";
import { cookies } from "next/headers";
import { verify, JwtPayload } from "jsonwebtoken";

async function getCurrentUserId() {
	const cookieStore = await cookies();
	const token = cookieStore.get("shovergladeCookie")?.value;
	if (!token) return null;
	try {
		const decoded = verify(
			token,
			process.env.JWT_SECRET || "default_secret",
		) as JwtPayload;
		return decoded?.userId || null;
	} catch {
		return null;
	}
}

export async function POST(request: Request) {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { slotId } = await request.json();
		if (!slotId) {
			return NextResponse.json(
				{ error: "Missing slotId" },
				{ status: 400 },
			);
		}

		await connectDB();

		await Slot.deleteOne(slotId);
		return NextResponse.json({ success: true });
	} catch (e) {
		console.error("Cancel slot error:", e);
		return NextResponse.json(
			{ error: "Failed to cancel slot" },
			{ status: 500 },
		);
	}
}

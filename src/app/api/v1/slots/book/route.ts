import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Slot from "@/database/schemas/Slot";
import { cookies } from "next/headers";
import { verify, JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

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
		const userId = (await getCurrentUserId()) as string | null;
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

		const existingBooking = await Slot.findOne({ userId, isBooked: true });
		if (existingBooking) {
			return NextResponse.json(
				{ error: "You already have an active booking." },
				{ status: 409 },
			);
		}

		const slot = await Slot.findById(slotId);
		if (!slot) {
			return NextResponse.json(
				{ error: "Slot not found" },
				{ status: 404 },
			);
		}

		if (slot.isBooked) {
			return NextResponse.json(
				{ error: "Slot is already booked" },
				{ status: 409 },
			);
		}

		slot.isBooked = true;
		slot.userId = new Types.ObjectId(userId);
		await slot.save();

		return NextResponse.json({ success: true, slot });
	} catch (e) {
		console.error("Book slot error:", e);
		return NextResponse.json(
			{ error: "Failed to book slot" },
			{ status: 500 },
		);
	}
}

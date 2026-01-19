import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Slot from "@/database/schemas/Slot";
import { Types } from "mongoose";
import { slotDuration } from "@/lib/config";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const authResult = await requireAuth(request);

		if ("error" in authResult) {
			return authResult.error;
		}

		const { user } = authResult;

		const userId = user._id.toString() as string | null;
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		await connectDB();

		const body = await request.json();

		if (!body.slotStart) {
			return NextResponse.json(
				{
					error: "Bad Request",
				},
				{ status: 400 },
			);
		}

		let anonymized = false;

		if (body.anonymized) {
			anonymized = true;
		}

		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const existingBooking = await Slot.findOne({
			userId: new Types.ObjectId(userId),
			isBooked: true,
			startTime: { $gte: twentyFourHoursAgo },
		});
		if (existingBooking) {
			return NextResponse.json(
				{ error: "You already have an active booking." },
				{ status: 409 },
			);
		}

		const now = new Date(body.slotStart);
		const cutoff = new Date(now.getTime() + slotDuration * 60 * 1000);

		let slot = await Slot.findOne({
			startTime: { $gte: now, $lte: cutoff },
		});
		if (slot) {
			return NextResponse.json(
				{ error: "Slot is already booked" },
				{ status: 409 },
			);
		}

		const end = new Date(body.slotStart);
		end.setSeconds(0, 0);
		end.setMinutes(end.getMinutes() + slotDuration);

		slot = await Slot.create({
			endTime: end,
			isBooked: true,
			userId: new Types.ObjectId(userId),
			startTime: now,
			anonymized: anonymized,
		});

		return NextResponse.json({ success: true, slot });
	} catch (e) {
		console.error("Book slot error:", e);
		return NextResponse.json(
			{ error: "Failed to book slot" },
			{ status: 500 },
		);
	}
}

import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Slot, { ISlot } from "@/database/schemas/Slot";
import User, { IUser } from "@/database/schemas/User";
import { slotDuration } from "@/lib/config";
import { Types } from "mongoose";

export async function GET() {
	try {
		await connectDB();

		const slots = await Slot.find({}).sort({ startTime: 1 });

		const formattedSlots = await Promise.all(
			slots
				.filter(
					(a) =>
						a.isBooked &&
						new Date(a.endTime).getTime() > new Date().getTime(),
				)
				.map(async (slot) => {
					const currentUser = (await User.findById(
						slot.userId,
					).lean()) as IUser | null;
					return {
						_id: slot._id,
						startTime: slot.startTime,
						endTime: slot.endTime,
						isBooked: slot.isBooked,
						userId: slot.userId || null,
						bookedBy: slot.userId
							? slot.anonymized
								? {
										name: "Anonymous",
										avatar: "/showerglade.png",
									}
								: {
										name: currentUser?.name || "",
										avatar: currentUser?.avatar || "",
									}
							: undefined,
						anonymized: slot.anonymized ?? true,
					} as ISlot;
				}),
		);

		const allSlots = formattedSlots;

		const next_slot = new Date();
		const minutes = next_slot.getMinutes();
		const remainder = minutes % slotDuration;
		next_slot.setMinutes(
			minutes + (remainder === 0 ? 0 : slotDuration - remainder),
		);
		next_slot.setSeconds(0);
		next_slot.setMilliseconds(0);

		const bookedTimes = new Set(
			formattedSlots.map((slot) => new Date(slot.startTime).getTime()),
		);

		const now = new Date();
		const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

		while (next_slot < oneDayLater) {
			if (!bookedTimes.has(next_slot.getTime())) {
				const startSlot = new Date(next_slot);
				const endSlot = new Date(
					next_slot.getTime() + slotDuration * 60 * 1000,
				);
				allSlots.push({
					_id: new Types.ObjectId(),
					startTime: startSlot,
					endTime: endSlot,
					isBooked: false,
					userId: new Types.ObjectId(),
					bookedBy: undefined,
					anonymized: false,
				});
			}
			next_slot.setMinutes(next_slot.getMinutes() + slotDuration);
		}

		allSlots.sort(
			(a, b) =>
				new Date(a.startTime).getTime() -
				new Date(b.startTime).getTime(),
		);

		return NextResponse.json({ slots: allSlots });
	} catch (e) {
		console.error("Fetch slots error:", e);
		return NextResponse.json(
			{ error: "Failed to fetch slots" },
			{ status: 500 },
		);
	}
}

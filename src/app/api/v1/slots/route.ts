import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Slot from "@/database/schemas/Slot";
import User, { IUser } from "@/database/schemas/User";

export async function GET() {
	try {
		await connectDB();

		const slots = await Slot.find({}).sort({ startTime: 1 });

		const formattedSlots = await Promise.all(
			slots
				.filter((a) => a.isBooked && new Date(a.startTime) > new Date())
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
							? {
									name: currentUser?.name || "",
									avatar: currentUser?.avatar || "",
								}
							: undefined,
					};
				}),
		);

		return NextResponse.json({ slots: formattedSlots });
	} catch (e) {
		console.error("Fetch slots error:", e);
		return NextResponse.json(
			{ error: "Failed to fetch slots" },
			{ status: 500 },
		);
	}
}

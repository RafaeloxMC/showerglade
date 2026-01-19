import { ISlot } from "@/database/schemas/Slot";
import React from "react";

interface CurrentlyShoweringProps {
	slots: ISlot[];
}

function CurrentlyShoweringDisplay(props: CurrentlyShoweringProps) {
	let currentSlot: ISlot | undefined;
	for (const slot of props.slots) {
		const start = new Date(slot.startTime);
		const end = new Date(slot.endTime);
		const now = new Date();
		if (slot.isBooked && start <= now && end > now) {
			currentSlot = slot;
			break;
		}
	}

	return (
		<div className="flex flex-col items-center justify-center my-4 p-4 bg-teal-800 border border-teal-700 rounded-2xl">
			<h2 className="text-2xl font-bold">Currently Showering:</h2>
			{currentSlot ? (
				<div className="flex flex-row items-center justify-center gap-4">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={currentSlot?.bookedBy?.avatar}
						alt="Profile Picture"
						className="w-8 h-8 rounded-full"
					/>
					<span className="font-bold">
						{currentSlot?.bookedBy?.name ?? "N/A"}
					</span>
				</div>
			) : (
				<span>The shower is empty</span>
			)}
		</div>
	);
}

export default CurrentlyShoweringDisplay;

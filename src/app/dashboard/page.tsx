"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IUser } from "@/database/schemas/User";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import Footer from "@/components/footer";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface Slot {
	_id: string;
	startTime: string;
	endTime: string;
	isBooked: boolean;
	userId: string | null;
	bookedBy?: {
		name: string;
		avatar: string;
	};
}

export default function Dashboard() {
	const router = useRouter();

	const [slots, setSlots] = useState<Slot[]>([]);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<IUser | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchSlots = async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const res = await fetch("/api/v1/slots");
			if (res.ok) {
				const data = await res.json();
				setSlots(data.slots);
			}
		} catch (error) {
			console.error("Failed to fetch slots", error);
			toast.error("Failed to load shower slots.");
		} finally {
			if (!silent) setLoading(false);
		}
	};

	const handleLogout = async () => {
		await fetch("/api/v1/auth/logout", { method: "POST" });
		router.push("/");
	};

	useEffect(() => {
		fetchSlots();
		fetch("/api/v1/auth/me")
			.then((res) => res.json())
			.then((data) => {
				if (data.user) {
					setUser(data.user);
				} else {
					handleLogout();
				}
			})
			.catch(() => {
				handleLogout();
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleConfirmBooking = async () => {
		if (!selectedSlot) return;

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/v1/slots/book", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slotId: selectedSlot._id }),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Booking failed");
			} else {
				toast.success("Shower booked successfully!");
				setSelectedSlot(null);
				fetchSlots(true);
			}
		} catch (e) {
			console.error(e);
			toast.error("Network error while booking");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = async (slotId: string) => {
		if (!confirm("Are you sure you want to cancel this booking?")) return;

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/v1/slots/cancel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slotId }),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Cancel failed");
			} else {
				toast.success("Booking cancelled.");
				fetchSlots(true);
			}
		} catch (e) {
			console.error(e);
			toast.error("Network error while cancelling");
		} finally {
			setIsSubmitting(false);
		}
	};

	const myBooking = slots.find((s) => s.userId === user?._id.toString());

	if ((loading && !slots.length) || !user)
		return (
			<div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-white">
				<div className="animate-pulse flex flex-col items-center gap-4">
					<div className="h-8 w-8 rounded-full border-2 border-t-teal-500 border-neutral-800 animate-spin" />
					<p className="text-neutral-500 text-sm">
						Loading schedule...
					</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-[#123b49] text-white font-sans selection:bg-teal-100">
			<Header user={user} />

			<main className="max-w-3xl mx-auto px-6 pb-20">
				<div className="text-center mb-10">
					<h2 className="text-3xl font-extrabold mb-2">
						Book a Shower
					</h2>
					<p className="text-neutral-300">
						Select a time slot below to reserve your 20-minute
						session.
					</p>
				</div>

				{myBooking && (
					<div className="mb-10 bg-white rounded-2xl p-6 shadow-sm border border-teal-100 relative overflow-hidden group">
						<div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
									Your Reservation
								</p>
								<h3 className="text-2xl font-bold text-neutral-900">
									{format(
										new Date(myBooking.startTime),
										"h:mm aa",
									)}
									<span className="text-neutral-300 font-normal mx-2">
										-
									</span>
									{format(
										new Date(myBooking.endTime),
										"h:mm aa",
									)}
								</h3>
								<p className="text-neutral-500 text-sm mt-1">
									{format(
										new Date(myBooking.startTime),
										"EEEE, MMMM do",
									)}
								</p>
							</div>
							<button
								onClick={() => handleCancel(myBooking._id)}
								disabled={isSubmitting}
								className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
							>
								{isSubmitting
									? "Cancelling..."
									: "Cancel Booking"}
							</button>
						</div>
					</div>
				)}

				{!myBooking && (
					<>
						<div className="bg-neutral-50/10 backdrop-blur-3xl rounded-3xl shadow-sm p-8">
							<div className="flex items-center justify-between mb-6">
								<h3 className="font-semibold text-lg">
									Available Slots (in the next 24h)
								</h3>
								<div className="text-sm text-neutral-400">
									Today
								</div>
							</div>

							<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
								{slots
									.filter(
										(slot) =>
											!(
												new Date() >
												new Date(slot.endTime)
											),
									)
									.map((slot) => {
										const startTime = new Date(
											slot.startTime,
										);
										const isBooked = slot.isBooked;
										const isSelected =
											selectedSlot?._id === slot._id;
										return (
											<div
												key={slot._id}
												className="relative group"
											>
												<button
													disabled={isBooked}
													onClick={() =>
														setSelectedSlot(slot)
													}
													className={cn(
														"w-full relative py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border flex flex-col items-center justify-center gap-1 h-16",
														isSelected
															? "bg-teal-600 text-white border-teal-600 shadow-md scale-105 z-10"
															: isBooked
																? "bg-neutral-800 text-neutral-300 border-neutral-700 cursor-not-allowed"
																: "bg-black border-neutral-950 hover:border-neutral-700 hover:bg-neutral-950",
													)}
												>
													<span>
														{format(
															startTime,
															"h:mm a",
														)}
													</span>
													{isBooked &&
														slot.bookedBy && (
															<div className="flex items-center gap-1.5 max-w-full overflow-hidden px-1">
																{slot.bookedBy
																	.avatar && (
																	/* eslint-disable-next-line @next/next/no-img-element */
																	<img
																		src={
																			slot
																				.bookedBy
																				.avatar
																		}
																		alt={
																			slot
																				.bookedBy
																				.name
																		}
																		className="w-4 h-4 rounded-full grayscale opacity-70"
																	/>
																)}
																<span className="text-[10px] truncate max-w-15 leading-tight">
																	{
																		slot
																			.bookedBy
																			.name
																	}
																</span>
															</div>
														)}
												</button>

												{isBooked && slot.bookedBy && (
													<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
														Booked by{" "}
														{slot.bookedBy.name}
													</div>
												)}
											</div>
										);
									})}
							</div>

							{slots.length === 0 && (
								<div className="text-center py-10 text-neutral-300">
									No slots available for today.
								</div>
							)}
						</div>

						<div className="pt-12">
							<div className="max-w-3xl mx-auto bg-neutral-50/10 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
								<div className="hidden md:block">
									<p className="text-sm uppercase tracking-wider font-semibold">
										Selected Time
									</p>
									<div className="text-xl font-bold">
										{selectedSlot ? (
											<>
												{format(
													new Date(
														selectedSlot.startTime,
													),
													"h:mm a",
												)}{" "}
												-{" "}
												{format(
													new Date(
														selectedSlot.endTime,
													),
													"h:mm a",
												)}
											</>
										) : (
											<span className="text-neutral-300">
												--:--
											</span>
										)}
									</div>
								</div>

								<button
									onClick={handleConfirmBooking}
									disabled={!selectedSlot || isSubmitting}
									className="w-full md:w-auto px-8 py-3 bg-teal-900 hover:bg-teal-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-teal-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
								>
									{isSubmitting
										? "Confirming..."
										: "Confirm Booking"}
								</button>
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
}

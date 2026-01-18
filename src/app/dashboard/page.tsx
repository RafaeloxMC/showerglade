"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

interface User {
    _id: string;
    slackId: string;
    name: string;
    avatar: string;
    isAdmin: boolean;
}

export default function Dashboard() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch slots
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
    }, []);

    const handleLogout = async () => {
        await fetch("/api/v1/auth/logout", { method: "POST" });
        window.location.href = "/";
    };

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

    const myBooking = slots.find((s) => s.userId === user?._id);

    if (loading && !slots.length)
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin" />
                    <p className="text-zinc-500 text-sm">Loading schedule...</p>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-blue-100">
            {/* Header */}
            <header className="flex justify-between items-center p-6 md:p-8 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900">Shoverglade</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-zinc-500">{user?.isAdmin ? "Admin" : "Attendee"}</span>
                    </div>
                    {user?.avatar && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full border border-zinc-200" />
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors ml-2"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pb-20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-zinc-900 mb-2">Book a Shower</h2>
                    <p className="text-zinc-500">Select a time slot below to reserve your 20-minute session.</p>
                </div>

                {/* My Booking Card */}
                {myBooking && (
                    <div className="mb-10 bg-white rounded-2xl p-6 shadow-sm border border-blue-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Your Reservation</p>
                                <h3 className="text-2xl font-bold text-zinc-900">
                                    {format(new Date(myBooking.startTime), "h:mm aa")}
                                    <span className="text-zinc-400 font-normal mx-2">-</span>
                                    {format(new Date(myBooking.endTime), "h:mm aa")}
                                </h3>
                                <p className="text-zinc-500 text-sm mt-1">
                                    {format(new Date(myBooking.startTime), "EEEE, MMMM do")}
                                </p>
                            </div>
                            <button
                                onClick={() => handleCancel(myBooking._id)}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Cancelling..." : "Cancel Booking"}
                            </button>
                        </div>
                    </div>
                )}

                {!myBooking && (
                    <>
                        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-lg text-zinc-900">Available Slots</h3>
                                <div className="text-sm text-zinc-500">Today</div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {slots.map((slot) => {
                                    const startTime = new Date(slot.startTime);
                                    const isBooked = slot.isBooked;
                                    const isSelected = selectedSlot?._id === slot._id;
                                    const isPast = new Date() > new Date(slot.endTime);

                                    return (
                                        <div key={slot._id} className="relative group">
                                            <button
                                                disabled={isBooked || isPast}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={cn(
                                                    "w-full relative py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border flex flex-col items-center justify-center gap-1 h-16",
                                                    isSelected
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105 z-10"
                                                        : isBooked
                                                        ? "bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed"
                                                        : isPast
                                                        ? "bg-zinc-50 text-zinc-300 border-transparent cursor-not-allowed opacity-50"
                                                        : "bg-white text-zinc-700 border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50"
                                                )}
                                            >
                                                <span>{format(startTime, "h:mm a")}</span>
                                                {isBooked && slot.bookedBy && (
                                                    <div className="flex items-center gap-1.5 max-w-full overflow-hidden px-1">
                                                        {slot.bookedBy.avatar && (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img
                                                                src={slot.bookedBy.avatar}
                                                                alt={slot.bookedBy.name}
                                                                className="w-4 h-4 rounded-full grayscale opacity-70"
                                                            />
                                                        )}
                                                        <span className="text-[10px] truncate max-w-[60px] leading-tight">
                                                            {slot.bookedBy.name.split(" ")[0]}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>

                                            {/* Hover Tooltip for booked slots */}
                                            {isBooked && slot.bookedBy && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                    Booked by {slot.bookedBy.name}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {slots.length === 0 && (
                                <div className="text-center py-10 text-zinc-400">No slots available for today.</div>
                            )}
                        </div>

                        {/* Booking Summary & Action */}
                        <div
                            className={cn(
                                "fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-200 transition-transform duration-300 ease-in-out md:relative md:bg-transparent md:backdrop-blur-none md:border-t-0 md:transform-none md:p-0 md:mt-8",
                                selectedSlot ? "translate-y-0" : "translate-y-full md:translate-y-0 md:opacity-50 md:pointer-events-none"
                            )}
                        >
                            <div className="max-w-3xl mx-auto md:bg-white md:rounded-2xl md:border md:border-zinc-200 md:p-6 md:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="hidden md:block">
                                    <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Selected Time</p>
                                    <div className="text-xl font-bold text-zinc-900">
                                        {selectedSlot ? (
                                            <>
                                                {format(new Date(selectedSlot.startTime), "h:mm a")} -{" "}
                                                {format(new Date(selectedSlot.endTime), "h:mm a")}
                                            </>
                                        ) : (
                                            <span className="text-zinc-300">--:--</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={!selectedSlot || isSubmitting}
                                    className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                                >
                                    {isSubmitting ? "Confirming..." : "Confirm Booking"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

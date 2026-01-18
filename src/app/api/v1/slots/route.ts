import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Slot from "@/database/models/Slot";
import User from "@/database/models/User";
import { cookies } from "next/headers";
import { decode } from "jsonwebtoken";

// Helper to get current user from token
async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("shovergladeCookie")?.value;
    if (!token) return null;
    
    try {
        const decoded = decode(token) as any;
        if (!decoded || !decoded.userId) return null;
        
        await connectDB();
        return await User.findById(decoded.userId);
    } catch (e) {
        return null;
    }
}

export async function GET() {
    try {
        await connectDB();
        
        // Return slots for today/upcoming.
        const slots = await Slot.find({}).sort({ startTime: 1 }).populate("userId", "name avatar");

        const formattedSlots = slots.map(slot => ({
            _id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
            userId: slot.userId?._id || null,
            bookedBy: slot.userId ? {
                name: slot.userId.name,
                avatar: slot.userId.avatar
            } : undefined
        }));

        return NextResponse.json({ slots: formattedSlots });
    } catch (e) {
        console.error("Fetch slots error:", e);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}

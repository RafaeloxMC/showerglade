import mongoose from "mongoose";
import Slot from "../src/database/models/Slot";
import { connectDB } from "../src/database/db";
import { startOfToday, addDays, addMinutes } from "date-fns";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

async function seed() {
    await connectDB();
    
    console.log("Connected to DB. Clearing slots...");
    await Slot.deleteMany({});

    const today = startOfToday();
    const duration = 20; // 20 mins

    const slots = [];
    let currentTime = today;
    const endTime = addDays(today, 1);

    while (currentTime < endTime) {
        slots.push({
            startTime: currentTime,
            endTime: addMinutes(currentTime, duration),
            isBooked: false,
            userId: null
        });
        currentTime = addMinutes(currentTime, duration);
    }

    console.log(`Seeding ${slots.length} slots...`);
    await Slot.insertMany(slots);
    console.log("Done!");
    process.exit(0);
}

seed();

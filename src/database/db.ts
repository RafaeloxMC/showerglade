import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
	throw new Error("MONGO_URI is not defined");
}

let cached = (global as any).mongoose;

if (!cached) {
	cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose
			.connect(process.env.MONGO_URI!, opts)
			.then((mongoose) => {
				return mongoose;
			});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

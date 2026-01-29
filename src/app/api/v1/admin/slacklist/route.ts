import Slacklist from "@/database/schemas/Slacklist";
import { authenticateUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();

	const user = await authenticateUser(req);

	if (!user || !user.slackId || !user.isAdmin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!body) {
		return NextResponse.json({ error: "Bad request" }, { status: 400 });
	}

	if (Array.isArray(body)) {
		const slacklistEntries = body.map((slackId) => ({ slackId }));
		await Slacklist.insertMany(slacklistEntries);
		return NextResponse.json(
			{ message: "Slacklist entries created" },
			{ status: 201 },
		);
	} else {
		await Slacklist.create({ slackId: body });
		return NextResponse.json(
			{ message: "Slacklist entry created" },
			{ status: 201 },
		);
	}
}

export async function GET(req: NextRequest) {
	const user = await authenticateUser(req);

	if (!user || !user.slackId || !user.isAdmin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const slacklist = await Slacklist.find({});

	return NextResponse.json({ slacklist }, { status: 200 });
}

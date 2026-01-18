import { authenticateUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const user = await authenticateUser(request);

	if (!user) {
		return NextResponse.json(
			{ error: "Not authenticated" },
			{ status: 401 },
		);
	}

	return NextResponse.json({ user });
}

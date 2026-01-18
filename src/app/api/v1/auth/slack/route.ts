import { NextResponse } from "next/server";

export async function GET() {
	const slackClientId = process.env.SLACK_CLIENT_ID;

	if (!slackClientId) {
		return NextResponse.json(
			{ error: "Slack client ID not configured" },
			{ status: 500 },
		);
	}

	const scopes = ["openid", "email", "profile"].join(",");

	const redirectUri = `${
		process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
	}/api/v1/auth/slack/callback`;

	const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${slackClientId}&user_scope=${scopes}&redirect_uri=${encodeURIComponent(
		redirectUri,
	)}`;

	return NextResponse.redirect(slackAuthUrl);
}

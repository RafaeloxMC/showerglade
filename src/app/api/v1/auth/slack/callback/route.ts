import { connectDB } from "@/database/db";
import User from "@/database/models/User";
import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");

	if (error) {
		return NextResponse.redirect(
			`${
				process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
			}/auth/login?error=access_denied`,
		);
	}

	if (!code) {
		return NextResponse.redirect(
			`${
				process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
			}/auth/login?error=no_code`,
		);
	}

	try {
		const tokenResponse = await fetch(
			"https://slack.com/api/oauth.v2.access",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${Buffer.from(
						`${process.env.SLACK_CLIENT_ID}:${process.env.SLACK_CLIENT_SECRET}`,
					).toString("base64")}`,
				},
				body: new URLSearchParams({
					code,
					redirect_uri: `${
						process.env.NEXT_PUBLIC_BASE_URL ||
						"https://localhost:3000"
					}/api/v1/auth/slack/callback`,
				}),
			},
		);

		const tokenData = await tokenResponse.json();

		if (!tokenData.ok) {
			console.error("Slack OAuth error:", tokenData);
			return NextResponse.redirect(
				`${
					process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
				}/auth/login?error=oauth_error`,
			);
		}

		const userResponse = await fetch(
			"https://slack.com/api/openid.connect.userInfo",
			{
				headers: {
					Authorization: `Bearer ${tokenData.authed_user.access_token}`,
				},
			},
		);

		const userData = await userResponse.json();

		if (!userData.sub) {
			console.error("Slack user info error:", userData);
			return NextResponse.redirect(
				`${
					process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
				}/auth/login?error=user_info_error`,
			);
		}

		await connectDB();

        // Check against admin list in env
        const adminIds = (process.env.ADMIN_SLACK_IDS || "").split(",").map(id => id.trim());
        const isAdmin = adminIds.includes(userData.sub);

		const user = await User.findOneAndUpdate(
			{ slackId: userData.sub },
			{
				slackId: userData.sub,
				name: userData.name,
				email: userData.email,
				avatar: userData.picture,
                isAdmin: isAdmin,
				updatedAt: new Date(),
			},
			{ upsert: true, new: true },
		);

		// Generate JWT
		const token = sign(
			{ userId: user._id, slackId: user.slackId },
			process.env.JWT_SECRET || "default_secret",
			{ expiresIn: "7d" }
		);

		const response = NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"}/dashboard`,
		);

		response.cookies.set("shovergladeCookie", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});

		return response;
	} catch (error) {
		console.error("OAuth callback error:", error);
		return NextResponse.redirect(
			`${
				process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
			}/login?error=server_error`,
		);
	}
}

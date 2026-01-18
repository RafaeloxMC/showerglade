import { connectDB } from "@/database/db";
import Session from "@/database/schemas/Session";
import User, { IUser } from "@/database/schemas/User";
import { generateTokenWithExpiry } from "@/util/tokens";
import { Types } from "mongoose";
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
				process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
			}/auth/login?error=no_code`,
		);
	}

	try {
		const tokenResponse = await fetch(
			"https://slack.com/api/openid.connect.token",
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
						"http://localhost:3000"
					}/api/v1/auth/slack/callback`,
				}),
			},
		);

		const tokenData = await tokenResponse.json();

		if (!tokenData.ok) {
			console.error("Slack OAuth error:", tokenData);
			return NextResponse.redirect(
				`${
					process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
				}/auth/login?error=oauth_error`,
			);
		}

		const userResponse = await fetch(
			"https://slack.com/api/openid.connect.userInfo",
			{
				headers: {
					Authorization: `Bearer ${tokenData.access_token}`,
				},
			},
		);

		const userData = await userResponse.json();

		if (!userData.ok) {
			console.error("Slack user info error:", userData);
			return NextResponse.redirect(
				`${
					process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
				}/auth/login?error=user_info_error`,
			);
		}

		await connectDB();

		const user = (await User.findOneAndUpdate(
			{ slackId: userData.sub },
			{
				slackId: userData.sub,
				name: userData.name,
				avatar: userData.picture,
				updatedAt: new Date(),
			},
			{ upsert: true, new: true },
		)) as IUser;

		const { token, expiresAt } = generateTokenWithExpiry(24 * 7);

		await Session.create({
			token,
			userId: (user._id as Types.ObjectId).toString(),
			slackId: user.slackId,
			expiresAt,
		});

		const response = new NextResponse(
			`<html><head><meta http-equiv="refresh" content="0;url=/dashboard"/></head><body>Redirecting...</body></html>`,
			{
				status: 200,
				headers: {
					"Content-Type": "text/html",
				},
			},
		);

		const cookieMaxAge = 7 * 24 * 60 * 60;
		const cookieExpires = new Date(Date.now() + cookieMaxAge * 1000);

		response.cookies.set({
			name: "shovergladeCookie",
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: true,
			maxAge: cookieMaxAge,
			expires: cookieExpires,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("OAuth callback error:", error);
		return NextResponse.redirect(
			`${
				process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
			}/auth/login?error=server_error`,
		);
	}
}

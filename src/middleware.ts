import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const token = request.cookies.get("shovergladeCookie")?.value;

	const isAuthPage = request.nextUrl.pathname.startsWith("/auth/login");
    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

	if (!token && isDashboardPage) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/auth/login"],
};

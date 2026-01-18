import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function Home() {
    const cookieStore = await cookies();
    const token = cookieStore.get("shovergladeCookie");
    const isLoggedIn = !!token;

	return (
		<div className="min-w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
			<main className="flex flex-col gap-8 p-8 text-center max-w-2xl">
				<div>
					<h1 className="text-7xl font-extrabold mb-4 tracking-tight drop-shadow-md">Shoverglade</h1>
					<p className="text-xl opacity-90 font-medium">
						Reserve shower spots during Hack Club&apos;s Overglade event!
                        Avoid the lines and stay fresh.
					</p>
				</div>
                
                <div className="flex justify-center gap-4">
                    {isLoggedIn ? (
                        <Link 
                            href="/dashboard" 
                            prefetch={false}
                            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link 
                            href="/api/v1/auth/slack" 
                            prefetch={false}
                            className="px-8 py-4 bg-[#4A154B] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.314zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.52v2.522h-2.52v-.002zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.522 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.52h2.522zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.522 2.527 2.527 0 0 1 2.52-2.522h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z"/>
                            </svg>
                            Login with Slack
                        </Link>
                    )}
                </div>
			</main>
		</div>
	);
}

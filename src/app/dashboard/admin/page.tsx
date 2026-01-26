"use client";
import Header from "@/components/dashboard/header";
import { IUser } from "@/database/schemas/User";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function SlacklistUserComponent() {
	return (
		<div className="flex flex-row gap-2 items-center">
			<img src={"/showerglade.png"} className="w-16 h-16 rounded-full" />
			<span className="text-2xl">Example User</span>
		</div>
	);
}

function AdminPage() {
	// TODO: Protect route & add fetching from Slacklist model from DB

	const router = useRouter();
	const [user, setUser] = useState<IUser | undefined>(undefined);

	const handleLogout = async () => {
		await fetch("/api/v1/auth/logout", { method: "POST" });
		router.push("/");
	};

	useEffect(() => {
		// fetchSlacklist();
		fetch("/api/v1/auth/me")
			.then((res) => res.json())
			.then((data) => {
				if (data.user) {
					setUser(data.user);
				} else {
					handleLogout();
				}
			})
			.catch(() => {
				handleLogout();
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!user)
		return (
			<div className="flex h-screen w-full items-center justify-center bg-[#123b49] text-white">
				<div className="animate-pulse flex flex-col items-center gap-4">
					<div className="h-8 w-8 rounded-full border-2 border-t-teal-500 border-neutral-800 animate-spin" />
					<p className="text-neutral-500 text-sm">Loading panel...</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-[#123b49] text-white font-sans selection:bg-teal-100">
			<Header user={user} />
			<main className="max-w-3xl mx-auto px-6 pb-20">
				<h1 className="text-6xl font-extrabold">Administration</h1>
				<div className="mt-2">
					<h2 className="text-4xl font-extrabold">Slacklist</h2>
					<ul className="flex flex-col gap-2">
						<SlacklistUserComponent />
						<SlacklistUserComponent />
						<SlacklistUserComponent />
						<SlacklistUserComponent />
						<SlacklistUserComponent />
						<SlacklistUserComponent />
					</ul>
				</div>
			</main>
		</div>
	);
}

export default AdminPage;

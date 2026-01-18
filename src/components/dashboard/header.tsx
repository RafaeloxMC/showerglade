import { IUser } from "@/database/schemas/User";
import { useRouter } from "next/navigation";
import React from "react";

export interface HeaderProps {
	user: IUser;
}

function Header(props: HeaderProps) {
	const router = useRouter();

	const handleLogout = async () => {
		await fetch("/api/v1/auth/logout", { method: "POST" });
		router.push("/");
	};

	return (
		<header className="flex justify-between items-center p-6 md:p-8 max-w-5xl mx-auto w-full">
			<div className="flex items-center gap-3">
				<div className="h-8 w-8 bg-transparent rounded-lg flex items-center justify-center text-white font-bold text-lg">
					🚿
				</div>
				<h1 className="text-xl font-bold tracking-tight">
					Showerglade
				</h1>
			</div>

			<div className="flex items-center gap-4">
				<div className="hidden md:flex flex-col items-end">
					<span className="text-sm font-medium">
						{props.user?.name}
					</span>
					<span className="text-xs text-neutral-500">
						{props.user?.isAdmin ? "Admin" : "Attendee"}
					</span>
				</div>
				{props.user?.avatar && (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={props.user.avatar}
						alt="User"
						className="w-9 h-9 rounded-full border border-neutral-800"
					/>
				)}
				<button
					onClick={handleLogout}
					className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors ml-2"
				>
					Sign Out
				</button>
			</div>
		</header>
	);
}

export default Header;

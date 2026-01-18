import { connectDB } from "@/database/db";
import Session from "@/database/schemas/Session";
import User, { IUser } from "@/database/schemas/User";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getAuthenticatedUser(): Promise<IUser | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get("shovergladeCookie")?.value;

	if (!token) {
		redirect("/");
	}

	await connectDB();

	const session = await Session.findOne({
		token,
		expiresAt: { $gt: new Date() },
	});

	if (!session) {
		redirect("/");
	}

	const user = await User.findById(session.userId);
	return user as IUser;
}

async function DashboardPage() {
	const user = await getAuthenticatedUser();

	return (
		<div className="min-w-screen min-h-screen bg-black">
			<main className="flex flex-col p-4 gap-4">
				<h1 className="text-4xl font-extrabold">Dashboard</h1>
				{user ? (
					<>
						{" "}
						<h2>
							Welcome, {user.name}!{" "}
							<Link
								href="/api/v1/auth/logout"
								prefetch={false}
								className="underline cursor-pointer"
							>
								Sign Out
							</Link>
						</h2>
						<div>
							<h2 className="text-2xl font-extrabold">
								Shower Schedule
							</h2>
						</div>
					</>
				) : (
					<p>You need to sign in to view this page!</p>
				)}
			</main>
		</div>
	);
}

export default DashboardPage;

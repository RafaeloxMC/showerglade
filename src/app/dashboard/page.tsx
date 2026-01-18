import { connectDB } from "@/database/db";
import Session from "@/database/schemas/Session";
import User, { IUser } from "@/database/schemas/User";
import { cookies } from "next/headers";

async function getAuthenticatedUser(): Promise<IUser | null> {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("shovergladeCookie")?.value;

		if (!token) {
			return null;
		}

		await connectDB();

		const session = await Session.findOne({
			token,
			expiresAt: { $gt: new Date() },
		});

		if (!session) {
			return null;
		}

		const user = await User.findById(session.userId);
		return user as IUser;
	} catch (error) {
		console.error("Authentication error:", error);
		return null;
	}
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
						<h2>Welcome, {user.name}!</h2>
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

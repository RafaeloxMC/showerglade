import { Slack } from "lucide-react";
import Link from "next/link";

function LoginPage() {
	return (
		<div className="min-w-screen min-h-screen">
			<main className="flex flex-col gap-4">
				<h1 className="text-7xl font-extrabold">
					Login to Shoverglade
				</h1>
				<Link
					href="/api/v1/auth/slack"
					prefetch={false}
					className="flex flex-row gap-2 items-center justify-center bg-purple-600 rounded-xl py-4 px-6 text-2xl font-extrabold text-center mt-4"
				>
					<Slack />
					Sign In
				</Link>
			</main>
		</div>
	);
}

export default LoginPage;

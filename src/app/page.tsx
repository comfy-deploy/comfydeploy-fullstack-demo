import { App } from "@/components/App";
import { Onboarding } from "@/components/Onboarding";
import { UserRuns } from "@/components/UserRuns";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center">
			<nav className="fixed top-0 left-0 right-0 py-2 px-2 flex items-center justify-between w-full border-b bg-background">
				<div className="flex items-start justify-center">
					<div className="font-bold text-lg">Generative App</div>
				</div>
				<div className="flex items-start justify-center">
					<UserButton />
				</div>
			</nav>
			<div className="mt-[45px] w-full h-[calc(100vh-45px)] flex flex-col items-center space-x-2">
				<SignedOut>
					<Onboarding />
				</SignedOut>
				<SignedIn>
					<div className="mt-2 flex flex-col items-center justify-center gap-2">
						<App />
						<UserRuns />
					</div>
				</SignedIn>
			</div>
		</main>
	);
}

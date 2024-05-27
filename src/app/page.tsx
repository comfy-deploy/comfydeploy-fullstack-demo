import { App } from "@/components/App";
import { Onboarding } from "@/components/Onboarding";
import { UserRuns } from "@/components/UserRuns";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserRuns } from "@/server/getUserRuns";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { SWRConfig } from "swr";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center">
			<nav className="fixed top-0 left-0 right-0 py-2 px-2 flex items-center justify-between w-full border-b bg-background">
				<div className="flex items-start justify-center">
					<div className="font-bold text-lg">ComfyUI Nextjs Demo</div>
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
					<div className="w-full mt-2 flex flex-col items-center justify-center gap-2">
						<App />
						<Suspense
							fallback={<Skeleton className="max-w-[800px] w-full h-[200px]" />}
						>
							<UserRunsAsync />
						</Suspense>
					</div>
				</SignedIn>
			</div>
		</main>
	);
}

async function UserRunsAsync() {
	return (
		<SWRConfig
			value={{
				fallback: {
					userRuns: await getUserRuns(),
				},
			}}
		>
			<UserRuns />
		</SWRConfig>
	);
}

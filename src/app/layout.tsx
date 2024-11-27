import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { HandleSignout } from "@/components/HandleSignout";
import { ComfyDeployProvider } from "@/hooks/hooks";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "ComfyUI Nextjs Demo",
	description: "A fullstack demo of ComfyUI with Nextjs, powered by ComfyDeploy",
	keywords: ["nextjs", "comfyui", "comfydeploy", "fullstack", "demo"],
	openGraph: {
		title: "ComfyUI Nextjs Demo",
		description: "A fullstack demo of ComfyUI with Nextjs, powered by ComfyDeploy",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={inter.className}>
					<ComfyDeployProvider>
						{children}
					</ComfyDeployProvider>
					<Toaster />
					<HandleSignout />
				</body>
			</html>
		</ClerkProvider>
	);
}


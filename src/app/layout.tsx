import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { HandleSignout } from "@/components/HandleSignout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "ComfyUI Nextjs Demo",
	description:
		"A fullstack demo of ComfyUI with Nextjs, powered by ComfyDeploy",
	keywords: ["nextjs", "comfyui", "comfydeploy", "fullstack", "demo"],
	openGraph: {
		title: "ComfyUI Nextjs Demo",
		description:
			"A fullstack demo of ComfyUI with Nextjs, powered by ComfyDeploy",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={inter.className}>{children}</body>
				<Toaster />
				<HandleSignout />
			</html>
		</ClerkProvider>
	);
}

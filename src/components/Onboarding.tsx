"use client";

import { SignIn, SignInButton, useSignIn } from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "./ui/card";
import { ArrowRight, ArrowRightIcon, ExternalLink, Github } from "lucide-react";
import coverImage from "@/images/cover-image.jpg";
import Image from "next/image";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Suspense } from "react";

export function Onboarding() {
	return (
		<div className="flex w-full h-full pt-4 md:items-center justify-center gap-2 relative">
			<Image
				className="blur-2xl opacity-20 mb-4 fixed -z-10 w-screen h-full object-cover"
				src={coverImage}
				alt="Relighting Demo"
			/>
			<div className="flex flex-col md:flex-row items-center justify-center h-fit gap-4 w-full overflow-hidden">
				<Image
					className="rounded-3xl p-2 w-full max-w-[400px]"
					src={coverImage}
					alt="Relighting Demo"
				/>
				<div className="px-6 gap-2 w-full md:w-fit flex flex-col h-full justify-center">
					<CardTitle className="text-balance">Integrate ComfyUI into your project</CardTitle>
					<CardDescription className="text-balance">
						A demo app build with Next js 15, Tailwind, Shadcn UI, Drizzle,
						Turso, Clerk
					</CardDescription>

					<Separator className="my-4 bg-primary/40" />
					<div className="flex flex-col md:flex-row justify-start gap-2">
						<SignInButton mode="modal">
							<Button
								variant="expandIcon"
								className="w-full md:w-fit rounded-xl transition-all hover:scale-105"
								Icon={ArrowRight}
								iconPlacement="right"
							>
								Get Started
							</Button>
						</SignInButton>
						<Button variant="outline" className="rounded-xl" asChild>
							<Link
								target="_blank"
								href="https://github.com/comfy-deploy/comfydeploy-fullstack-demo"
								className="flex gap-2 items-center"
							>
								GitHub
								<ExternalLink size={16} />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

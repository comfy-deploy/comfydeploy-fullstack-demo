import { SignIn, SignInButton, useSignIn } from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "./ui/card";
import { ArrowRightIcon } from "lucide-react";
import coverImage from "@/images/cover-image.jpg";
import Image from "next/image";
import { Separator } from "./ui/separator";

export function Onboarding() {
	return (
		<div className="flex w-full h-full items-center justify-center gap-2 relative">
			<Image
				className="blur-2xl opacity-40 mb-4 absolute -z-10 w-screen h-full object-cover"
				src={coverImage}
				alt="Relighting Demo"
			/>
			<Card className="rounded-3xl shadow-xl max-w-[500px] h-fit w-full overflow-hidden">
				<Image
					className="rounded-3xl p-2 w-full"
					src={coverImage}
					alt="Relighting Demo"
				/>
				<CardHeader>
					<CardTitle>Relighting Demo</CardTitle>
					<CardDescription>
						Relight your image with IC Light ComfyUI
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Separator className="my-4" />
					<div className="flex justify-end">
						<SignInButton mode="modal">
							<Button
								variant="expandIcon"
								className="rounded-xl"
								Icon={ArrowRightIcon}
								iconPlacement="right"
							>
								Get Started
							</Button>
						</SignInButton>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

"use client";

import { ImageGenerationResult } from "@/components/ImageGenerationResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateImage } from "@/server/generate";
import { useState } from "react";
import { Card } from "./ui/card";
import { ArrowRightIcon, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

export function App() {
	const [prompt, setPrompt] = useState(
		"beautiful scenery nature glass bottle landscape, , purple galaxy bottle,",
	);

	return (
		<div className="fixed z-50 bottom-0 md:bottom-2 flex flex-col gap-2 w-full md:max-w-lg mx-auto">
			<Card className="p-2 shadow-lg rounded-none md:rounded-2xl">
				{/* <Label htmlFor="input">Text Prompt</Label> */}
				<div className="flex gap-2">
					<Input
						id="input"
						className="rounded-xl text-base sm:text-sm"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="An amazing image"
					/>
					<Button
						variant="expandIcon"
						className="rounded-xl"
						Icon={WandSparklesIcon}
						iconPlacement="right"
						onClick={async () => {
							// await new Promise((resolve) => setTimeout(resolve, 3000));
							const runId = await generateImage(prompt);
							mutate("userRuns");
						}}
					>
						Generate
					</Button>
				</div>
			</Card>

			{/* {runId && <ImageGenerationResult runId={runId} />} */}
		</div>
	);
}

"use client";

import { ImageGenerationResult } from "@/components/ImageGenerationResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateImage } from "@/server/generate";
import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { ArrowRightIcon, WandSparklesIcon, Zap } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
// import { useComfyWebSocket } from "@/hooks/useComfyWebSocket";
import { Badge } from "./ui/badge";

// function RealtimeCanvas(props: {
// 	prompt: string;
// }) {
// 	const canvasRef = useRef<HTMLCanvasElement>(null); // Reference to the canvas element

// 	const { status, sendInput, queuePrompt, currentLog } = useComfyWebSocket({
// 		workflow_id: "0",
// 		getWebsocketUrl: getRealtimeWebsocketUrl,
// 		onOutputReceived: ({ data, outputId, imageType }) => {
// 			const url = URL.createObjectURL(data);

// 			const canvas = canvasRef.current;
// 			const ctx = canvas?.getContext("2d");

// 			console.log(imageType, outputId, data);

// 			if (ctx) {
// 				const img = new Image();
// 				img.onload = () => {
// 					if (canvas) {
// 						ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
// 					}
// 					URL.revokeObjectURL(url); // Clean up
// 				};
// 				img.src = url;
// 			}
// 		},
// 	});

// 	const preStatus = useRef(status);

// 	useEffect(() => {
// 		if (preStatus.current !== status && status === "ready") {
// 			sendInput({
// 				positive_prompt: props.prompt,
// 			});
// 			queuePrompt();
// 		}
// 		preStatus.current = status;
// 	}, [status, sendInput, queuePrompt]);

// 	useEffect(() => {
// 		sendInput({
// 			positive_prompt: props.prompt,
// 		});
// 		queuePrompt();

// 		console.log(props.prompt);
// 	}, [props.prompt, sendInput, queuePrompt]);

// 	return (
// 		<div className="relative">
// 			<div className="flex gap-2 absolute top-1 left-1 z-10">
// 				<Badge variant={"default"} className="w-fit">
// 					Status: {status}
// 				</Badge>
// 				{(currentLog || status === "connected" || status === "ready") && (
// 					<Badge variant={"default"} className="w-fit">
// 						{currentLog}
// 						{status === "connected" && !currentLog && "starting comfy ui"}
// 						{status === "ready" && !currentLog && " running"}
// 					</Badge>
// 				)}
// 			</div>

// 			<div className="relative w-full">
// 				<canvas
// 					ref={canvasRef}
// 					className="rounded-lg ring-1 ring-black/10 w-full aspect-square"
// 					width={1024}
// 					height={1024}
// 				/>
// 			</div>
// 		</div>
// 	);
// }

export function App() {
	const [prompt, setPrompt] = useState(
		"beautiful scenery nature glass bottle landscape, , purple galaxy bottle,",
	);
	const [debouncedPrompt] = useDebounce(prompt, 200);

	const [realtime, setRealtime] = useState(false);

	return (
		<div className="fixed z-50 bottom-0 md:bottom-2 flex flex-col gap-2 w-full md:max-w-lg mx-auto">
			{/* {realtime ? (
				<Card
					data-state={realtime ? "open" : "closed"}
					className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
				>
					<RealtimeCanvas prompt={debouncedPrompt} />
				</Card>
			) : null} */}
			<Card className="p-2 shadow-lg rounded-none md:rounded-2xl">
				{/* <Label htmlFor="input">Text Prompt</Label> */}
				<div className="flex gap-2">
					{/* <Button
						className="rounded-xl"
						variant={"shine"}
						onClick={() => setRealtime(!realtime)}
					>
						<Zap
							size={16}
							className={cn(realtime && "animate-pulse fill-yellow-400")}
						/>
					</Button> */}
					<Input
						id="input"
						className="rounded-xl text-base sm:text-sm z-10"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="An amazing image"
					/>
					<Button
						variant="expandIcon"
						className={cn(
							"rounded-xl transition-all w-[170px] min-w-0 p-0",
							realtime && "w-0 opacity-0",
						)}
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

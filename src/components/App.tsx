"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card } from "./ui/card";
import { WandSparklesIcon } from "lucide-react";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { queryClient } from "@/hooks/hooks";

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
							const runId = await fetch("/api/run", {
								method: "POST",
								body: JSON.stringify({ prompt }),
							}).then((res) => res.json());
							queryClient.invalidateQueries({ queryKey: ["userRuns"] });
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

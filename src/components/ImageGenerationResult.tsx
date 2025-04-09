"use client";

import { LoadingIcon } from "@/components/LoadingIcon";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { findOutputImageById } from "@/lib/findOutputById";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ImageGenerationResult({
	runId,
	className,
}: { runId: string } & React.ComponentProps<"div">) {
	const [image, setImage] = useState("");
	const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
	const [status, setStatus] = useState<string>("preparing");
	const [progress, setProgress] = useState<number | undefined>();
	const [liveStatus, setLiveStatus] = useState<string | null>();
	const [loading, setLoading] = useState(true);

	const { data, isLoading } = useQuery({
		queryKey: ["run", runId],
		queryFn: () => fetch(`/api/run/${runId}`).then((res) => res.json()),
		refetchInterval: 1000,
	});

	useEffect(() => {
		const res = data;
		if (res) {
			setStatus(res.status);
			setProgress(res.progress);
			setLiveStatus(res.live_status ?? null);
		}
		if (res) {
			const image = findOutputImageById(data.outputs, "intermediate_result");

			if (image) {
				setPreviewImage(image.url);
			}

			if (res.status === "success") {
				const image = findOutputImageById(data.outputs, "final_result");
				if (image) {
					setImage(image.url);
				}
				setLoading(false);
			}
		}
	}, [data]);

	return (
		<div
			className={cn(
				"w-full aspect-[512/512] relative",
				className,
			)}
		>
			{!loading && image && (
				<AnimatePresence mode="wait">
					<motion.img
						key="final"
						initial={{ opacity: 0, scale: 1 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1 }}
						transition={{ duration: 1, ease: "easeOut" }}
						className="z-10 w-full h-full"
						src={image}
						alt="Generated output"
					/>
				</AnimatePresence>
			)}
			{!image && previewImage && (
				<AnimatePresence mode="wait">
					<div className="z-10 relative w-full h-full overflow-hidden">
						<motion.img
							key="preview"
							initial={{ opacity: 0, scale: 1 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 1 }}
							transition={{ duration: 1, ease: "easeOut" }}
							className="w-full h-full scale-110"
							src={previewImage}
							alt="Generated output"
						/>
						<div className="absolute inset-0 backdrop-blur-md" />
					</div>
				</AnimatePresence>
			)}
			{!image && status && (
				<div className="absolute z-10 top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-2 px-4">
					{
						!previewImage && (
							<>
								<div className="flex items-center justify-center gap-2 text-gray-600">
									{status} <LoadingIcon />
								</div>
								<Progress value={(progress !== undefined ? progress : 0) * 100} className="h-[2px] w-full" />
								<span className="text-sm text-center text-gray-400">
									{" "}
									{liveStatus !== undefined && liveStatus}
								</span>
							</>
						)
					}
					{
						previewImage && (
							<>
								<div className="flex items-center justify-center gap-2 drop-shadow text-white">
									<span className="">Finishing touches...</span> <LoadingIcon />
								</div>
							</>
						)
					}
				</div>
			)}
			{loading && <Skeleton className="absolute inset-0 w-full h-full" />}
		</div>
	);
}

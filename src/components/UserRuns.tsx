"use client";

import useSWR from "swr";
import { getUserRuns } from "@/server/getUserRuns";
import React from "react";
import { ImageGenerationResult } from "./ImageGenerationResult";
import { Sparkle } from "lucide-react";

export function UserRuns() {
	const { data: userRuns, isValidating } = useSWR("userRuns", getUserRuns, {
		refreshInterval: 5000,
	});

	if (userRuns && userRuns.length > 0) {
		return (
			<div className="max-w-[800px] w-full grid grid-cols-2 md:gap-4 pb-32">
				{userRuns.map((run) => (
					<div
						className="md:rounded-sm overflow-hidden relative group"
						key={run.run_id}
					>
						{!run.image_url && <ImageGenerationResult runId={run.run_id} />}
						{run.image_url && <img src={run.image_url} alt="Run" />}
						{run.inputs && (
							<div className="transition-opacity group-hover:opacity-100 opacity-0 absolute bottom-0 text-xs text-white/80 p-4 bg-slate-950/40 flex flex-col gap-2">
								{Object.entries(run.inputs).map(([key, value]) => (
									<div key={key}>
										<span className="font-bold">{key}:</span>{" "}
										<span>{value}</span>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="text-sm flex w-full h-[calc(100vh-45px-50px)] justify-center items-center text-gray-400 gap-2">
			Start generating some images! <Sparkle size={16} />
		</div>
	);
}

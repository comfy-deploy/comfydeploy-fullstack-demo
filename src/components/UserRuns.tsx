"use client";

import useSWR from "swr";
import { getUserRuns } from "@/server/getUserRuns";
import React from "react";
import { ImageGenerationResult } from "./ImageGenerationResult";

export function UserRuns() {
	const { data: userRuns, isValidating } = useSWR("userRuns", getUserRuns, {
		refreshInterval: 5000,
	});

	if (userRuns) {
		return (
			<div>
				<div className="grid grid-cols-2 gap-4 pb-32">
					{userRuns.map((run) => (
						<React.Fragment key={run.id}>
							<div className="rounded-sm overflow-hidden">
								{!run.image_url && <ImageGenerationResult runId={run.run_id} />}
								{run.image_url && <img src={run.image_url} alt="Run" />}
							</div>
						</React.Fragment>
					))}
				</div>
			</div>
		);
	}

	return <></>;
}

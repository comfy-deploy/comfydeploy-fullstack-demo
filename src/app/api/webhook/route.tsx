import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ComfyDeploy } from "comfydeploy";

const cd = new ComfyDeploy();

export async function POST(request: Request) {
	const data = await cd.validateWebhook({ request });

	const { status, runId, outputs, liveStatus, progress } = data;

	if (status === "success") {
		const data = outputs?.[0].data?.images?.[0];
		if (data && typeof data !== "string") {
			const imageUrl = data.url;
			await db
				.update(runs)
				.set({
					image_url: imageUrl,
				})
				.where(eq(runs.run_id, runId));
			console.log("updated", runId, imageUrl);
		}
	}

	// Do your things
	console.log(status, runId, outputs);

	return NextResponse.json({ message: "success" }, { status: 200 });
}

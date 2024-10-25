import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { RunUpdateRequestBodyWebhookPostBody$inboundSchema as WebhookParser } from "comfydeploy/models/webhooks";

export async function POST(request: Request) {
	console.log("webhook");
	const parseData = WebhookParser.safeParse(
		await request.json(),
	);
	console.log("webhook", parseData, parseData.error?.toString());

	if (!parseData.success) {
		return NextResponse.json({ message: "error" }, { status: 400 });
	}

	const data = parseData.data;

	const { status, runId, outputs, liveStatus } = data;

	if (status === "success") {
		const imageUrl = outputs?.[0].data?.images?.[0].url;
		await db
			.update(runs)
			.set({
				image_url: imageUrl,
			})
			.where(eq(runs.run_id, runId));
		console.log("updated", runId, imageUrl);
	}

	// Do your things
	console.log(status, runId, outputs);

	return NextResponse.json({ message: "success" }, { status: 200 });
}

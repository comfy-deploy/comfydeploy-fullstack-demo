import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { findOutputImageById } from "@/lib/findOutputById";

export async function POST(request: Request) {
	let data;
	try {
		data = await request.json();
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "error, but skipping" }, { status: 200 });
	}

	const { status, run_id, outputs, live_status, progress, event_type } = data;

	if (event_type === "run.updated" && status === "success") {
		// Find the final result image by output_id
		const finalImage = findOutputImageById(outputs, "final_result");
		if (finalImage) {
			const imageUrl = finalImage.url;
			await db
				.update(runs)
				.set({
					image_url: imageUrl,
				})
				.where(eq(runs.run_id, run_id));
			console.log("updated", run_id, imageUrl);
		}
	}

	// Do your things
	console.log(status, run_id, outputs);

	return NextResponse.json({ message: "success" }, { status: 200 });
}

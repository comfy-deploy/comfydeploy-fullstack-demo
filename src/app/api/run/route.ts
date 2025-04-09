import { db } from "@/db/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { promises as fs } from "node:fs";
import { runs } from "@/db/schema";

const isDevelopment = process.env.NODE_ENV === "development";

async function getEndpoint() {
	const headersList = headers();
	const host = headersList.get("host") || "";
	const protocol = headersList.get("x-forwarded-proto") || "";
	let endpoint = `${protocol}://${host}`;

	if (isDevelopment) {
		const tunnelUrlFilePath = "tunnel_url.txt";

		try {
			const tunnelUrl = await fs.readFile(tunnelUrlFilePath, "utf-8");
			endpoint = tunnelUrl.trim();

			console.log(endpoint);
		} catch (error) {
			console.error(
				`Failed to read tunnel URL from ${tunnelUrlFilePath}:`,
				error,
			);
		}
	}

	return endpoint
}

export async function POST(request: NextRequest) {
	const { userId } = auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const req = await request.json()
	const { prompt } = req

	const inputs = {
		positive_prompt: prompt,
		negative_prompt: "text, watermark",
	};

	const data = await fetch(`https://api.comfydeploy.com/api/run/deployment/queue`, {
		method: "POST",
		headers: {
			'Authorization': `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`
		},
		body: JSON.stringify({
			deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
			webhook: `${await getEndpoint()}/api/webhook` + "?target_events=run.output,run.updated", // optional
			inputs: inputs,
		})
	})

	if (data.status !== 200) {
		console.log(data.statusText);
		return NextResponse.json({ error: "Failed to create run" }, { status: 500 })
	}

	const json = await data.json()

	if (json) {
		await db.insert(runs).values({
			run_id: json.run_id,
			user_id: userId,
			inputs: inputs,
		});
		return NextResponse.json(json)
	}

	return NextResponse.json({ error: "Failed to create run" }, { status: 500 })
}

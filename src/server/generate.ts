"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { ComfyDeployClient } from "comfydeploy";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { promises as fs } from "node:fs";

const client = new ComfyDeployClient({
	apiToken: process.env.COMFY_DEPLOY_API_KEY,
});

const isDevelopment = process.env.NODE_ENV === "development";

export async function generateImage(prompt: string) {
	const { userId } = auth();

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

	if (!userId) throw new Error("User not found");

	const inputs = {
		positive_prompt: prompt,
		negative_prompt: "text, watermark",
	};

	const result = await client.run({
		deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
		webhook: `${endpoint}/api/webhook`, // optional
		inputs: inputs,
	});

	if (result) {
		await db.insert(runs).values({
			run_id: result.run_id,
			user_id: userId,
			inputs: inputs,
		});
		return result.run_id;
	}

	return undefined;
}

export async function checkStatus(run_id: string) {
	return await client.getRun(run_id);
}

export async function getRealtimeWebsocketUrl() {
	return await client.getWebsocketUrl({
		deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
	});
}

// src/server/generate.ts
import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm/expressions";

// Función para optimizar el prompt
async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt...");
    try {
        const response = await fetch("https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const result = await response.json();
        return result?.choices?.[0]?.content || prompt;
    } catch (error) {
        console.error("Error optimizing the prompt:", error);
        return prompt;
    }
}

// Primer handler: optimiza el prompt y actualiza el estado
export async function optimizePromptHandler(prompt: string) {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const run_id = `run_${Date.now()}`;
    await db.insert(runs).values({
        run_id,
        user_id: userId,
        live_status: "optimizing_prompt",
        inputs: { input_text: prompt }
    });

    const optimizedPrompt = await promptOptimizer(prompt);
    await db.update(runs).set({
        live_status: "optimized",
        inputs: { input_text: optimizedPrompt }
    }).where(eq(runs.run_id, run_id));

    // Iniciar generación de imagen con el prompt optimizado
    await generateImageHandler(run_id, optimizedPrompt);
    return run_id;
}

// Segundo handler: genera la imagen usando el prompt optimizado
export async function generateImageHandler(run_id: string, optimizedPrompt: string) {
    const headersList = await headers();
    const endpoint = `https://${headersList.get("host") || ""}`;
    const inputs = {
        input_text: optimizedPrompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: ""
    };

    await db.update(runs).set({ live_status: "sending_to_comfy" }).where(eq(runs.run_id, run_id));

    try {
        const response = await fetch("https://www.comfydeploy.com/api/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`
            },
            body: JSON.stringify({
                deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
                inputs,
                webhook: `${endpoint}/api/webhook`
            })
        });

        const result = await response.json();
        if (response.ok && result && "run_id" in result) {
            await db.update(runs).set({ live_status: "queued" }).where(eq(runs.run_id, run_id));
            return result.run_id;
        } else {
            throw new Error("Failed to start image generation");
        }
    } catch (error) {
        console.error("Error in image generation:", error);
        await db.update(runs).set({ live_status: "failed" }).where(eq(runs.run_id, run_id));
        throw error;
    }
}

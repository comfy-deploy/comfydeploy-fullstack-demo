import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm/expressions";

// Función para optimizar el prompt
async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt with assistant...");
    try {
        const response = await fetch("https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            console.error(`Failed to optimize prompt: ${response.statusText}`);
            return prompt; // Retorna el prompt original si falla la solicitud
        }

        const result = await response.json();
        const optimizedPrompt = result?.choices?.[0]?.content;
        return optimizedPrompt ?? prompt;
    } catch (error: any) {
        console.error("Error optimizing the prompt:", error.message || error);
        return prompt;
    }
}

// Función para generar la imagen
export async function generateImage(prompt: string, endpoint: string) {
    const { userId } = auth();
    if (!userId) throw new Error("User not found");

    const run_id = `run_${Date.now()}`;

    await db.insert(runs).values({
        run_id,
        user_id: userId,
        live_status: "optimizing_prompt",
        inputs: { input_text: prompt }
    });

    let optimizedPrompt = prompt;
    try {
        optimizedPrompt = await promptOptimizer(prompt);
    } catch (error) {
        console.error("Error optimizing prompt, using original:", error);
    }

    await db.update(runs).set({ live_status: "sending_to_comfy" }).where(eq(runs.run_id, run_id));

    const inputs = {
        input_text: optimizedPrompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: ""
    };

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

        if (!response.ok) {
            throw new Error(`ComfyDeploy API responded with status ${response.status}`);
        }

        const result = await response.json();
        if (result?.run_id) {
            await db.update(runs).set({
                live_status: "queued",
                inputs
            }).where(eq(runs.run_id, run_id));
            return run_id;
        } else {
            throw new Error("Image generation failed: Invalid response from ComfyDeploy");
        }
    } catch (error) {
        console.error("Error calling ComfyDeploy API:", error);
        throw new Error("Error generating image");
    }
}

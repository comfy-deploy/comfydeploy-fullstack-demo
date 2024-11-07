import fetch from "node-fetch";
import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

// Configuración del cliente para optimización del prompt
interface OpenAIResponse {
    choices: { message: { content: string } }[];
}

interface ComfyDeployResponse {
    run_id?: string;
}

// Función para optimizar el prompt usando OpenAI API
async function optimizePrompt(prompt: string): Promise<string> {
    console.log("Optimizing prompt with assistant...");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 segundos de tiempo de espera

    try {
        const response = await fetch(`https://api.openai.com/v1/assistants/asst_zpQUmdKpyGW2WqXbWXRmBNn7/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({ input: prompt }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            console.warn(`Error in OpenAI API response: ${response.statusText}`);
            return prompt; // Devuelve el prompt original si hay un error
        }

        const result = (await response.json()) as OpenAIResponse;

        if (result && result.choices?.[0]?.message?.content) {
            const optimizedPrompt = result.choices[0].message.content;
            console.log("Optimized prompt:", optimizedPrompt);
            return optimizedPrompt;
        } else {
            console.warn("Unexpected structure from OpenAI, returning original prompt.");
            return prompt;
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                console.error("Optimize prompt request timed out.");
            } else {
                console.error("Error in optimizePrompt:", error.message);
            }
        } else {
            console.error("Unknown error in optimizePrompt:", error);
        }
        return prompt; // Retorna el prompt original en caso de error o timeout
    }
}

// Función principal para generar la imagen
export async function generateImage(prompt: string) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const headersList = await headers();
    const host = headersList.get("host") || "";
    const endpoint = `https://${host}`;

    // Optimizar el prompt antes de enviarlo
    const optimizedPrompt = await optimizePrompt(prompt);

    const inputs = {
        input_text: optimizedPrompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: ""
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout para ComfyDeploy

    try {
        const response = await fetch("https://www.comfydeploy.com/api/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`
            },
            body: JSON.stringify({
                deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
                inputs: inputs,
                webhook: `${endpoint}/api/webhook`
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            if (response.status === 504) {
                console.warn("504 Gateway Timeout ignored.");
                return "504-ignored"; // Indicar que el 504 fue ignorado
            }
            throw new Error(`Unexpected response from ComfyDeploy: ${response.statusText}`);
        }

        const result = (await response.json()) as ComfyDeployResponse;

        if (result && result.run_id) {
            await db.insert(runs).values({
                run_id: result.run_id,
                user_id: userId,
                inputs: inputs
            });
            console.log("Image queued successfully with run ID:", result.run_id);
            return result.run_id;
        } else {
            console.error("No valid run_id received.");
            return undefined;
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                console.error("generateImage request timed out.");
            } else {
                console.error("Error in generateImage:", error.message);
            }
        } else {
            console.error("Unknown error in generateImage:", error);
        }
        return undefined;
    }
}

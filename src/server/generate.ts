"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm/expressions";

// Función para optimizar el prompt usando Make
async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt with assistant...");

    try {
        const response = await fetch("https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            console.error(`Failed to optimize prompt: ${response.statusText}`);
            return prompt; // Retornamos el prompt original si falla la solicitud
        }

        const result = await response.json();
        console.log("Respuesta completa de Make:", result);

        const optimizedPrompt = result?.choices?.[0]?.content;
        if (optimizedPrompt) {
            console.log("Optimized prompt:", optimizedPrompt);
            return optimizedPrompt;
        } else {
            console.warn("Content no encontrado en la respuesta de Make. Usando prompt original.");
            return prompt;
        }
    } catch (error: any) {
        console.error("Error optimizing the prompt:", error.message || error);
        return prompt;
    }
}

// Función para generar la imagen con el prompt optimizado
export async function generateImage(prompt: string) {
    console.log("Iniciando generación de imagen con prompt:", prompt);

    const { userId } = auth();
    if (!userId) {
        console.error("Error: Usuario no autenticado");
        throw new Error("User not found");
    }

    const headersList = await headers();
    const host = headersList.get("host") || "";
    const endpoint = `https://${host}`;

    // Generar un `run_id` único
    const run_id = `run_${Date.now()}`; // Cambia esto por tu propia lógica de generación de ID si es necesario

    // Paso 1: Estado inicial "optimizing_prompt"
    await db.insert(runs).values({
        run_id,  // Asigna el run_id generado
        user_id: userId,
        live_status: "optimizing_prompt",
        inputs: { input_text: prompt }
    });

    console.log("Estado inicial 'optimizing_prompt' establecido en la base de datos.");

    // Optimización del prompt
    let optimizedPrompt;
    try {
        optimizedPrompt = await promptOptimizer(prompt);
    } catch (error) {
        console.error("Error optimizando prompt, usando el original:", error);
        optimizedPrompt = prompt;
    }

    // Actualizar estado a "sending_to_comfy" antes de enviar a ComfyDeploy
    await db.update(runs).set({ live_status: "sending_to_comfy" }).where(eq(runs.run_id, run_id));
    console.log("Estado actualizado a 'sending_to_comfy'");

    const inputs: Record<string, string> = {
        input_text: optimizedPrompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: ""
    };

    try {
        console.log("Enviando solicitud a ComfyDeploy...");
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
            })
        });

        const result = await response.json();
        console.log("Resultado de la llamada a ComfyDeploy:", result);

        if (response.ok && result && typeof result === "object" && "run_id" in result) {
            await db.update(runs).set({
                live_status: "queued",
                inputs: inputs
            }).where(eq(runs.run_id, run_id));

            console.log(`Imagen generada con run_id: ${result.run_id}`);
            return result.run_id;
        } else {
            throw new Error("Image generation failed: Invalid response");
        }
    } catch (error) {
        console.error("Error al llamar a la API de ComfyDeploy:", error);
        throw new Error("Error generating image");
    }
}

"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

// Función para optimizar el prompt usando Make
async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt with assistant...");

    try {
        const response = await fetch(`https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Failed to optimize prompt: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Respuesta completa de Make:", result);

        // Verificamos si la respuesta tiene el campo 'optimizedPrompt'
        const optimizedPrompt = (result as { optimizedPrompt?: string }).optimizedPrompt;

        if (typeof optimizedPrompt === "string") {
            console.log("Optimized prompt:", optimizedPrompt);
            return optimizedPrompt;
        } else {
            console.warn("optimizedPrompt no encontrado en la respuesta de Make.");
            return prompt; // Retornamos el prompt original si `optimizedPrompt` no está disponible
        }
    } catch (error) {
        console.error("Error optimizing the prompt:", error);
        return prompt; // Si hay un error, devolvemos el prompt original
    }
}

// Función para generar la imagen con el prompt optimizado
export async function generateImage(prompt: string) {
    console.log("Iniciando generación de imagen con prompt:", prompt);

    // Verificación de que el usuario esté autenticado
    const { userId } = auth();
    if (!userId) {
        console.error("Error: Usuario no autenticado");
        throw new Error("User not found");
    }

    const headersList = await headers();
    const host = headersList.get("host") || "";
    const endpoint = `https://${host}`;

    // Optimización del prompt usando Make
    const optimizedPrompt = await promptOptimizer(prompt);
    if (!optimizedPrompt) {
        console.error("Error: prompt optimizado es undefined o vacío");
        return undefined;
    }

    const inputs: Record<string, string> = {
        input_text: optimizedPrompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: "" // Id de la imagen
    };

    try {
        // Llamada a la API de ComfyDeploy para poner en cola la generación de la imagen
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

        // Manejo especial para el error 504 (Gateway Timeout)
        if (response.status === 504) {
            console.warn("504 Gateway Timeout: Continuando el flujo sin interrumpir.");
            return "504-ignored"; // Devuelve un identificador especial para indicar que el 504 fue ignorado
        }

        // Procesamos la respuesta de la API de ComfyDeploy
        const result = await response.json();
        console.log("Resultado de la llamada a ComfyDeploy:", result);

        // Verificación de que la respuesta contiene `run_id`
        if (response.ok && result && typeof result === "object" && "run_id" in result) {
            // Guardamos la información en la base de datos
            await db.insert(runs).values({
                run_id: result.run_id,
                user_id: userId,
                inputs: inputs
            });
            return result.run_id;
        } else {
            console.error("Error: No se recibió un resultado de generación válido o el estado de la respuesta es incorrecto.");
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error al llamar a la API de ComfyDeploy:", error.message);
        } else {
            console.error("Error desconocido al llamar a la API de ComfyDeploy:", error);
        }
    }

    return undefined;
}

"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import promptOptimizer from "../app/api/webhook/promptOptimizer"; // Usando Make para optimización del prompt

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

    // Optimización del prompt usando Make
    let optimizedPrompt = prompt;
    try {
        optimizedPrompt = await promptOptimizer(prompt); // Intentamos optimizar el prompt
        if (!optimizedPrompt) {
            console.error("Error: prompt optimizado es undefined o vacío");
            return undefined;
        }
    } catch (error) {
        console.error("Error optimizando el prompt:", error);
        // Retornamos el prompt original si ocurre un error
        return undefined;
    }

    const inputs: Record<string, string> = {
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
                inputs: inputs,
                webhook: `${endpoint}/api/webhook`
            })
        });

        // Manejo especial para el error 504 (Gateway Timeout)
        if (response.status === 504) {
            console.warn("504 Gateway Timeout: Continuando el flujo sin interrumpir.");
            return "504-ignored"; // Devuelve un identificador especial para indicar que el 504 fue ignorado
        }

        let result;
        try {
            // Intentamos parsear el JSON solo si la respuesta es válida
            result = await response.json();
        } catch (jsonError) {
            console.error("Error al parsear JSON de la respuesta:", jsonError);
            return undefined; // Si la respuesta no es JSON, retornamos undefined
        }

        console.log("Resultado de la llamada a ComfyDeploy:", result);

        // Verificación de que la respuesta contiene `run_id`
        if (response.ok && result && "run_id" in result) {
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

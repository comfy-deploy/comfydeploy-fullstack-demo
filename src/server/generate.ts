"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import fetch from "node-fetch";

// Define el tipo para la respuesta de OpenAI
interface OpenAIResponse {
    choices: { message: { content: string } }[];
}

// Función para optimizar el prompt usando el assistant de ChatGPT
async function optimizePrompt(prompt: string): Promise<string> {
    console.log("Optimizing prompt with assistant...");

    try {
        const response = await fetch(`https://api.openai.com/v1/assistants/asst_zpQUmdKpyGW2WqXbWXRmBNn7/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({ input: prompt })
        });

        // Asegúrate de que la respuesta sea del tipo `OpenAIResponse`
        const result = await response.json() as OpenAIResponse;
        const optimizedPrompt = result.choices[0]?.message?.content || prompt;

        console.log("Optimized prompt:", optimizedPrompt);
        return optimizedPrompt;
    } catch (error) {
        console.error("Error optimizing prompt:", error);
        return prompt; // Si hay un error, retorna el prompt original
    }
}

// Función principal para generar la imagen con un prompt dado
export async function generateImage(prompt: string) {
    console.log("Iniciando generación de imagen con prompt:", prompt);

    const { userId } = auth(); // Obtiene el ID de usuario de Clerk para autenticación
    console.log("ID de usuario:", userId);

    // Verifica que el usuario esté autenticado
    if (!userId) {
        console.error("Error: Usuario no autenticado");
        throw new Error("User not found");
    }

    // Obtiene el protocolo y el host de los headers de la solicitud
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const endpoint = `https://${host}`;
    console.log("Endpoint de webhook:", endpoint);

    // Optimiza el prompt antes de enviarlo a ComfyDeploy
    const optimizedPrompt = await optimizePrompt(prompt);

    // Configura los inputs como un objeto plano de tipo Record<string, string>
    const inputs: Record<string, string> = {
        input_text: optimizedPrompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: ""
    };
    console.log("Inputs configurados para ComfyDeploy:", inputs);

    // Llama a la API de ComfyDeploy para poner en cola la generación de la imagen
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

        const result = await response.json() as { run_id: string };
        console.log("Resultado de la llamada a ComfyDeploy:", result);

        // Si la cola de la generación es exitosa, guarda la información en la base de datos
        if (response.ok && result.run_id) {
            await db.insert(runs).values({
                run_id: result.run_id,
                user_id: userId,
                inputs: inputs // Guarda los valores como strings
            });
            console.log("Imagen puesta en cola exitosamente con ID:", result.run_id);
            return result.run_id; // Devuelve el ID de ejecución
        } else {
            console.error("Error: No se recibió un resultado de generación válido o el estado de la respuesta es incorrecto.");
        }
    } catch (error) {
        console.error("Error al llamar a la API de ComfyDeploy:", error);
    }

    return undefined; // En caso de falla, devuelve undefined
}

// Función para verificar el estado de una generación en base al run_id
export async function checkStatus(run_id: string) {
    console.log("Chequeando estado para el run_id:", run_id);

    try {
        const response = await fetch(`https://www.comfydeploy.com/api/run/${run_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`
            }
        });

        const result = await response.json();
        console.log("Estado de la generación obtenido:", result);

        return result;
    } catch (error) {
        console.error("Error al verificar el estado de la generación:", error);
        return undefined;
    }
}

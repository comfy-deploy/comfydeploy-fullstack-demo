"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { ComfyDeploy } from "comfydeploy";
import { headers } from "next/headers";

// Configuración del cliente de ComfyDeploy con la API key desde las variables de entorno
const client = new ComfyDeploy({
    bearer: process.env.COMFY_DEPLOY_API_KEY,
});

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
    const protocol = headersList.get("x-forwarded-proto") || "";
    const endpoint = `https://${host}`;
    console.log("Endpoint de webhook:", endpoint);

    // Configura los inputs para la generación de la imagen
    const inputs = {
        positive_prompt: prompt,
        negative_prompt: "text, watermark",
    };
    console.log("Inputs configurados para ComfyDeploy:", inputs);

    // Llama a la API de ComfyDeploy para poner en cola la generación de la imagen
    try {
        const result = await client.run.queue({
            deploymentId: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
            webhook: `${endpoint}/api/webhook`, // URL del webhook para recibir actualizaciones
            inputs: inputs,
        });
        console.log("Resultado de la llamada a ComfyDeploy:", result);

        // Si la cola de la generación es exitosa, guarda la información en la base de datos
        if (result) {
            await db.insert(runs).values({
                run_id: result.runId,
                user_id: userId,
                inputs: inputs,
            });
            console.log("Imagen puesta en cola exitosamente con ID:", result.runId);
            return result.runId; // Devuelve el ID de ejecución
        } else {
            console.error("Error: No se recibió un resultado de generación válido.");
        }
    } catch (error) {
        console.error("Error al llamar a la API de ComfyDeploy:", error);
    }

    return undefined; // En caso de falla, devuelve undefined
}

// Función para verificar el estado de una generación en base al run_id
export async function checkStatus(run_id: string) {
    console.log("Chequeando estado para el run_id:", run_id);
    return await client.run.get({
        runId: run_id,
    });
}

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
    const { userId } = auth(); // Obtiene el ID de usuario de Clerk para autenticación

    // Verifica que el usuario esté autenticado
    if (!userId) throw new Error("User not found");

    // Obtiene el dominio de Vercel para producción
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || "comfydeploy-fullstack-novamente.vercel.app";
    const endpoint = `https://${vercelUrl}`;

    // Configura los inputs para la generación de la imagen
    const inputs = {
        positive_prompt: prompt,
        negative_prompt: "text, watermark",
    };

    // Llama a la API de ComfyDeploy para poner en cola la generación de la imagen
    const result = await client.run.queue({
        deploymentId: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
        webhook: `${endpoint}/api/webhook`, // URL del webhook para recibir actualizaciones
        inputs: inputs,
    });

    // Si la cola de la generación es exitosa, guarda la información en la base de datos
    if (result) {
        await db.insert(runs).values({
            run_id: result.runId,
            user_id: userId,
            inputs: inputs,
        });
        return result.runId; // Devuelve el ID de ejecución
    }

    return undefined; // En caso de falla, devuelve undefined
}

// Función para verificar el estado de una generación en base al run_id
export async function checkStatus(run_id: string) {
    return await client.run.get({
        runId: run_id,
    });
}

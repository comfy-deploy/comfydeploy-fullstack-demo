"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { ComfyDeploy } from "comfydeploy";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";

// Configuración del cliente de ComfyDeploy con la API key desde las variables de entorno
const client = new ComfyDeploy({
    bearer: process.env.COMFY_DEPLOY_API_KEY,
});

const isDevelopment = process.env.NODE_ENV === "development";

// Función principal para generar la imagen con un prompt dado
export async function generateImage(prompt: string) {
    const { userId } = auth(); // Obtiene el ID de usuario de Clerk para autenticación

    // Obtiene el protocolo y el host de los headers de la solicitud
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "";
    let endpoint = `${protocol}://${host}`;

    // Si estamos en un entorno de desarrollo, intenta leer la URL del túnel desde `tunnel_url.txt`
    if (isDevelopment) {
        const tunnelUrlFilePath = "tunnel_url.txt";

        if (existsSync(tunnelUrlFilePath)) {
            try {
                const tunnelUrl = await fs.readFile(tunnelUrlFilePath, "utf-8");
                endpoint = tunnelUrl.trim();
                console.log(`Tunnel URL: ${endpoint}`);
            } catch (error) {
                console.error(`Failed to read tunnel URL from ${tunnelUrlFilePath}:`, error);
            }
        } else {
            console.warn(`Tunnel URL file ${tunnelUrlFilePath} not found.`);
        }
    }

    // Verifica que el usuario esté autenticado
    if (!userId) throw new Error("User not found");

    // Configura los inputs para la generación de la imagen
    const inputs = {
        positive_prompt: prompt,
        negative_prompt: "text, watermark",
    };

    // Llama a la API de ComfyDeploy para poner en cola la generación de la imagen
    const result = await client.run.queue({
        deploymentId: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
        webhook: `${endpoint}/api/webhook`, // URL del webhook opcional
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

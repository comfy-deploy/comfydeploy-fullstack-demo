// src/server/generate.ts

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export async function generateImage(prompt: string) {
    console.log("Iniciando generación de imagen con prompt optimizado:", prompt);

    const { userId } = auth();
    if (!userId) {
        console.error("Error: Usuario no autenticado");
        throw new Error("User not found");
    }

    const headersList = await headers();
    const host = headersList.get("host") || "";
    const endpoint = `https://${host}`;

    const inputs: Record<string, string> = {
        input_text: prompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: ""
    };

    try {
        console.log("Enviando solicitud a ComfyDeploy para generar imagen...");
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

        if (!response.ok) {
            throw new Error("Image generation failed");
        }

        const result = await response.json();
        if (result && result.run_id) {
            await db.insert(runs).values({
                run_id: result.run_id,
                user_id: userId,
                inputs: inputs
            });

            console.log(`Imagen generada con run_id: ${result.run_id}`);
            return result.run_id;
        } else {
            console.error("Error: No se recibió un resultado de generación válido.");
            throw new Error("Image generation failed: Invalid response");
        }
    } catch (error) {
        console.error("Error al llamar a la API de ComfyDeploy:", error);
        throw new Error("Error generating image");
    }
}

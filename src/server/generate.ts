"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import promptOptimizer from "../app/api/webhook/promptOptimizer";

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

        const result = await response.json();
        console.log("Resultado de la llamada a ComfyDeploy:", result);

        if (response.ok && result.run_id) {
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
        console.error("Error al llamar a la API de ComfyDeploy:", error);
    }

    return undefined;
}

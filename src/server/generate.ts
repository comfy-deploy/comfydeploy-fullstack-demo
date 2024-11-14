import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

async function optimizePrompt(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantInstructions = "The purpose of this assistant is to receive a basic prompt and expand it into a detailed description, focused on a vector design with well-defined outlines, ready to be used on surfaces with removable backgrounds. The description should be contained within a single paragraph, with a maximum limit of 1000 characters..."; // Completa las instrucciones específicas aquí

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: assistantInstructions },
                { role: "user", content: prompt }
            ]
        })
    });

    const result = await response.json();
    if (!response.ok || !result.choices) {
        throw new Error("Error optimizing prompt: " + result.error?.message || "Unknown error");
    }

    return result.choices[0].message.content;
}

export async function generateImage(prompt: string) {
    console.log("Iniciando generación de imagen con prompt original:", prompt);

    const { userId } = auth();
    if (!userId) {
        console.error("Error: Usuario no autenticado");
        throw new Error("User not found");
    }

    // Optimiza el prompt antes de proceder
    let optimizedPrompt;
    try {
        optimizedPrompt = await optimizePrompt(prompt);
        console.log("Prompt optimizado:", optimizedPrompt);
    } catch (error) {
        console.error("Error al optimizar el prompt:", error);
        throw new Error("Error optimizing prompt");
    }

    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    const endpoint = `${host}/api/webhook`;

    const inputs: Record<string, string> = {
        input_text: optimizedPrompt,
        batch: "1",
        width: "832",
        height: "1216",
        id: ""
    };

    try {
        console.log("Enviando solicitud a ComfyDeploy con prompt optimizado...");
        const response = await fetch("https://www.comfydeploy.com/api/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`
            },
            body: JSON.stringify({
                deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
                inputs: inputs,
                webhook: endpoint
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

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

async function optimizePrompt(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantInstructions = `
You are a creative assistant specializing in generating detailed descriptions for vector illustrations. Your goal is to expand a basic prompt into a high-quality, visually appealing design description suitable for printing on apparel, with a focus on clean lines and defined outlines for easy background removal. The final output should be in English, and contain the following:

1. **Main Subject Details**: Start with a vivid description of the central figure or object in the design. Include specifics about its posture, orientation, and any distinct features that make it unique. Aim for a striking aesthetic that makes the subject visually captivating.

2. **Texture and Style**: Describe any textural qualities (such as vintage wear, metallic sheen, or smoothness) that enhance the design's appearance. Specify if the style should lean towards realism, minimalism, or an abstract approach, ensuring that it harmonizes with the subject.

3. **Color and Contrast**: Clearly specify primary and secondary colors that should be used, especially highlighting contrasts that make the subject stand out on a dark or light background. Ensure color transitions and boundaries are smooth yet clear, maintaining defined edges.

4. **Shading and Highlights**: Mention any soft shadows or subtle highlights that could be applied to add dimension without overwhelming the vector style. Shadows should be applied evenly and minimally to keep the design crisp.

5. **Typography**: If any text is involved, such as a band name or quote, suggest a font style that complements the artwork. Ensure the text is integrated subtly so it enhances rather than distracts from the main visual elements.

6. **Background and Format**: The background should be simple or removable, keeping the focus on the subject for optimal printing on apparel. Describe how the design would look on a plain, removable background, emphasizing the defined contours that facilitate background removal.

7. **Overall Composition**: Conclude with a brief description of how all elements come together to create a balanced and coherent design, ensuring that the central figure or object remains the focal point. Specify any final touches that could make the design visually impactful, memorable, and easy to print.

The output must be contained in a single paragraph and be within 1000 characters, written in English, and suitable for generating a high-quality, print-ready vector design. Avoid special characters such as quotes or slashes that might interfere with the printing process.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
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
        width: "896",
        height: "1152",
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

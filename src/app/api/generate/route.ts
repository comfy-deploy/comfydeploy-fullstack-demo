// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/server/generate";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Define el endpoint para el webhook
        const host = request.headers.get("host");
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const endpoint = `${protocol}://${host}`;

        // Llama a la función generateImage
        const runId = await generateImage(prompt, endpoint);

        return NextResponse.json({ runId }, { status: 200 });
    } catch (error) {
        console.error("Error generating image:", error);
        return NextResponse.json(
            { error: "Failed to generate image", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

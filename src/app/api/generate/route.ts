import { generateImage } from "@/server/generate";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();
        const endpoint = request.nextUrl.origin; // Usa el origen de la solicitud para el webhook

        // Inicia el proceso de generación de imagen de forma asincrónica
        const run_id = await generateImage(prompt, endpoint);

        return NextResponse.json({ run_id }, { status: 202 }); // Responde de inmediato con el run_id
    } catch (error: any) {
        console.error("Error en /api/generate:", error);
        return NextResponse.json({ message: "Error iniciando la generación de imagen", error: error.message }, { status: 500 });
    }
}

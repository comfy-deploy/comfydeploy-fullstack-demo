import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { WorkflowRunWebhookBody$inboundSchema as WebhookParser } from "comfydeploy/models/components";

export async function POST(request: Request) {
    console.log("Webhook recibido: Iniciando procesamiento");

    try {
        // Parsear los datos del webhook
        const parseData = WebhookParser.safeParse(await request.json());
        
        // Log para verificar si el parseo fue exitoso
        if (!parseData.success) {
            console.error("Error de validación en datos del webhook:", parseData.error?.toString());
            return NextResponse.json({ message: "error en los datos del webhook" }, { status: 400 });
        }

        const { status, runId, outputs, liveStatus } = parseData.data;
        console.log("Datos parseados correctamente:", { status, runId, liveStatus });

        // Verificar y actualizar la URL de la imagen solo si el estado es "success"
        if (status === "success" && outputs) {
            const data = outputs[0]?.data?.images?.[0];
            
            if (data && typeof data !== "string" && data.url) {
                const imageUrl = data.url;
                await db
                    .update(runs)
                    .set({
                        image_url: imageUrl,
                        live_status: status, // Usamos live_status para almacenar el estado
                    })
                    .where(eq(runs.run_id, runId));

                console.log(`Imagen actualizada en la base de datos para runId ${runId}: ${imageUrl}`);
            } else {
                console.warn("No se encontró URL de imagen en outputs:", outputs);
            }
        } else {
            // Actualizar solo live_status en otros estados
            await db
                .update(runs)
                .set({
                    live_status: liveStatus ?? status, // Guarda liveStatus o status aquí
                })
                .where(eq(runs.run_id, runId));

            console.log(`Estado actualizado para runId ${runId}: ${status}`);
        }

        return NextResponse.json({ message: "success" }, { status: 200 });
    } catch (error) {
        console.error("Error en el procesamiento del webhook:", error);
        return NextResponse.json({ message: "error interno del servidor" }, { status: 500 });
    }
}

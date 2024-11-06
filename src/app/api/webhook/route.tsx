import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { WorkflowRunWebhookBody$inboundSchema as WebhookParser } from "comfydeploy/models/components";

export async function POST(request: Request) {
	console.log("Webhook recibido: Iniciando procesamiento");

	try {
		const jsonData = await request.json();
		console.log("Datos JSON recibidos en el webhook:", jsonData);

		// Validación de los datos entrantes con el esquema de ComfyDeploy
		const parseData = WebhookParser.safeParse(jsonData);

		// Si la validación falla, retorna un error 400 y loguea el detalle del error
		if (!parseData.success) {
			console.error("Error en la estructura de datos del webhook:", parseData.error?.issues);
			return NextResponse.json({ message: "error en los datos del webhook", details: parseData.error?.issues }, { status: 400 });
		}

		const { status, runId, outputs, liveStatus } = parseData.data;

		// Log para verificar los datos importantes del webhook
		console.log("Estado recibido:", status, "Run ID:", runId, "Live Status:", liveStatus);

		if (status === "success") {
			const imageData = outputs?.[0]?.data?.images?.[0];
			if (imageData && typeof imageData !== "string" && imageData.url) {
				const imageUrl = imageData.url;
				await db
					.update(runs)
					.set({
						image_url: imageUrl,
					})
					.where(eq(runs.run_id, runId));

				console.log("Base de datos actualizada exitosamente con URL de la imagen:", imageUrl);
			} else {
				console.warn("Advertencia: No se encontró URL de imagen válida en los outputs");
			}
		} else {
			console.log("El estado no es 'success'. Estado actual:", status);
		}

		return NextResponse.json({ message: "Webhook procesado correctamente" }, { status: 200 });
	} catch (error) {
		console.error("Error inesperado en el webhook:", error);
		return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
	}
}

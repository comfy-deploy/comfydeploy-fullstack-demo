import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Esquema personalizado para los datos entrantes del webhook
const WebhookSchema = z.object({
  status: z.string(),
  run_id: z.string().optional(),  // Marcar `run_id` como opcional
  live_status: z.string().optional(),
  outputs: z.array(
    z.object({
      id: z.string(),
      run_id: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
      data: z.object({
        images: z.array(
          z.object({
            url: z.string(),
            type: z.string(),
            filename: z.string(),
          })
        )
      })
    })
  ).optional(),
});

export async function POST(request: Request) {
    console.log("Receiving webhook data...");

    try {
        const jsonData = await request.json();
        console.log("Received JSON data:", JSON.stringify(jsonData, null, 2));

        // Parsing the incoming data to ensure it matches the expected schema
        const parseData = WebhookSchema.safeParse(jsonData);
        console.log("Parse result:", parseData);

        // If parsing fails, log the errors and respond with a 400 status code
        if (!parseData.success) {
            console.error("Error in webhook data:", parseData.error.format());
            return NextResponse.json({ message: "Error in webhook data", details: parseData.error.issues }, { status: 400 });
        }

        const { status, run_id, outputs, live_status } = parseData.data;

        // Si no hay `run_id`, ignoramos la solicitud en lugar de lanzar un error
        if (!run_id) {
            console.warn("No run_id found in webhook data, ignoring this entry.");
            return NextResponse.json({ message: "ignored due to missing run_id" }, { status: 200 });
        }

        // Si el estado es "queued" o "started" y no tiene `outputs`, solo registramos sin actualizar la base de datos
        if ((status === "queued" || status === "started") && (!outputs || outputs.length === 0)) {
            console.log(`Status is ${status} with no outputs, waiting for more data for run_id ${run_id}.`);
            return NextResponse.json({ message: `Status is ${status}, no outputs yet` }, { status: 200 });
        }

        if (status === "success" && outputs && outputs.length > 0) {
            const imageData = outputs[0].data.images[0];
            
            // Verificamos que `imageData` contenga una propiedad `url`
            if (imageData && typeof imageData === "object" && "url" in imageData) {
                const imageUrl = imageData.url;
                
                console.log("Updating database for run ID:", run_id);
                console.log("Image URL:", imageUrl);
                console.log("Live Status:", live_status ?? "unknown");

                await db
                    .update(runs)
                    .set({
                        image_url: imageUrl,
                        live_status: live_status ?? "unknown",
                    })
                    .where(eq(runs.run_id, run_id));
                
                console.log("Database updated successfully for run ID:", run_id);
            } else {
                console.warn("No valid image data found in outputs for run_id:", run_id);
            }
        } else {
            console.log("Status is not 'success' or no outputs found, skipping database update.");
        }

        return NextResponse.json({ message: "success" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ message: "server error" }, { status: 500 });
    }
}

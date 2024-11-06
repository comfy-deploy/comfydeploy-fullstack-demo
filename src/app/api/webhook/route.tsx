import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Esquema personalizado para los datos entrantes del webhook
const WebhookSchema = z.object({
  status: z.string(),
  runId: z.string(),
  liveStatus: z.string().optional(),
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
  ),
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
            return NextResponse.json({ message: "error en los datos del webhook", details: parseData.error.issues }, { status: 400 });
        }

        // If parsing is successful, proceed with processing the data
        const { status, runId, outputs, liveStatus } = parseData.data;
        console.log("Webhook parsed data:", { status, runId, liveStatus });

        if (status === "success") {
            const imageData = outputs[0]?.data?.images[0];
            
            // Check if imageData contains a 'url' property
            if (imageData && typeof imageData === "object" && "url" in imageData) {
                const imageUrl = imageData.url;
                
                // Logging before updating the database
                console.log("Updating database for run ID:", runId);
                console.log("Image URL:", imageUrl);
                console.log("Live Status:", liveStatus ?? "unknown");

                // Update the database with the new image URL and live status for the given run ID
                await db
                    .update(runs)
                    .set({
                        image_url: imageUrl,
                        live_status: liveStatus ?? "unknown", // Usa un valor por defecto si liveStatus está ausente
                    })
                    .where(eq(runs.run_id, runId));
                console.log("Database updated successfully for run ID:", runId);
            } else {
                console.warn("No valid image data found in outputs.");
            }
        } else {
            console.log("Status is not 'success', skipping database update.");
        }

        console.log("Webhook processing completed.");
        return NextResponse.json({ message: "success" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ message: "server error" }, { status: 500 });
    }
}

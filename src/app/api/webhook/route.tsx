import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const WebhookSchema = z.object({
    status: z.string(),
    run_id: z.string().optional(),
    live_status: z.union([z.string(), z.null()]).optional(),
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
    try {
        const jsonData = await request.json();

        const parseData = WebhookSchema.safeParse(jsonData);
        if (!parseData.success) {
            console.error("Error in webhook data:", parseData.error.format());
            return NextResponse.json({ message: "Error in webhook data", details: parseData.error.issues }, { status: 400 });
        }

        const { status, run_id, outputs, live_status } = parseData.data;

        if (!run_id) {
            console.warn("No run_id found in webhook data, ignoring this entry.");
            return NextResponse.json({ message: "ignored due to missing run_id" }, { status: 200 });
        }

        if (status === "queued" || status === "started" || status === "uploading") {
            console.log(`Status is ${status}, no outputs or image data yet, waiting for more data for run_id ${run_id}.`);
            return NextResponse.json({ message: `Status is ${status}, no outputs yet` }, { status: 200 });
        }

        if (status === "success" && outputs && outputs.length > 0) {
            const imageData = outputs[0].data.images[0];
            if (imageData && typeof imageData === "object" && "url" in imageData) {
                const imageUrl = imageData.url;

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

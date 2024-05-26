
import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { parseWebhookDataSafe } from "comfydeploy";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const [_data, error] = await parseWebhookDataSafe(request);
    if (!_data || error) return error;

    const { status, run_id, outputs } = _data;

    if (status === "success") {
        const imageUrl = outputs[0].data?.images?.[0].url
        await db.update(runs).set({
            image_url: imageUrl,
        }).where(eq(runs.run_id, run_id));
        console.log("updated", run_id, imageUrl);
    }

    // Do your things
    console.log(status, run_id, outputs);

    return NextResponse.json({ message: "success" }, { status: 200 });
}

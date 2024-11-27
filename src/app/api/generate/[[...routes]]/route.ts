// src/app/api/generateImage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/server/generate";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();
        const runId = await generateImage(prompt);
        return NextResponse.json({ runId });
    } catch (error) {
        console.error("Error generating image:", error);
        return NextResponse.json({ error: "Error generating image" }, { status: 500 });
    }
}

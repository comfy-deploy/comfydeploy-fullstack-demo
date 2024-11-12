import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const run_id = searchParams.get("run_id");

  if (!run_id) {
    return NextResponse.json(
      { error: "run_id is required" },
      { status: 400 }
    );
  }

  try {
    // Busca el run en la base de datos
    const [run] = await db.select().from(runs).where(eq(runs.run_id, run_id));

    if (!run) {
      return NextResponse.json(
        { error: "Run ID not found" },
        { status: 404 }
      );
    }

    // Devuelve el live_status y la URL de la imagen si está disponible
    return NextResponse.json(
      {
        live_status: run.live_status || "processing",
        image_url: run.image_url || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking image generation status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

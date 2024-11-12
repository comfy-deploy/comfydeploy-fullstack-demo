import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  context: { params: { run_id: string } } // Cambiamos aquí para usar `context`
) {
  const { run_id } = context.params;

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

    // Devuelve el estado y la URL de la imagen si está disponible
    return NextResponse.json(
      {
        status: run.status || "processing",
        image_url: run.image_url || null,
        live_status: run.live_status || null,
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

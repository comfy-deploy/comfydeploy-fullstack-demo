// src/app/api/cd/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

// Añade otros métodos HTTP según sea necesario

async function handleRequest(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const apiPath = pathname.replace("/api/cd", "");
  const url = `https://api.comfydeploy.com/api${apiPath}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("Authorization", `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`);

  const response = await fetch(url, {
    method: request.method,
    headers,
    body: request.body,
  });

  // Verifica si la respuesta es streamable
  const isStreamable =
    response.headers.get("Transfer-Encoding") === "chunked" ||
    response.headers.get("Content-Type")?.includes("text/event-stream");

  if (isStreamable) {
    // Crea un TransformStream para manejar la respuesta en streaming
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();

    // Empieza a canalizar el cuerpo de la respuesta al TransformStream
    response.body?.pipeTo(
      new WritableStream({
        write(chunk) {
          writer.write(chunk);
        },
        close() {
          writer.close();
        },
      })
    );

    // Retorna una respuesta en streaming
    return new NextResponse(transformStream.readable, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  // Para respuestas no streamables, retorna como antes
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

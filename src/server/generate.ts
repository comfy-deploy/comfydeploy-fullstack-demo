"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
// Eliminamos la importación de Clerk
// import { auth } from "@clerk/nextjs/server";
import { ComfyDeploy } from "comfydeploy";
// Eliminamos la importación de revalidatePath si no se utiliza
// import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { promises as fs } from "node:fs";
// Importamos uuid para generar IDs únicos
import { v4 as uuidv4 } from "uuid";

const client = new ComfyDeploy({
  bearer: process.env.COMFY_DEPLOY_API_KEY,
});

const isDevelopment = process.env.NODE_ENV === "development";

export async function generateImage(prompt: string) {
  // Generamos un ID único para la imagen
  const imageId = uuidv4();

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  let endpoint = `${protocol}://${host}`;

  if (isDevelopment) {
    const tunnelUrlFilePath = "tunnel_url.txt";

    try {
      const tunnelUrl = await fs.readFile(tunnelUrlFilePath, "utf-8");
      endpoint = tunnelUrl.trim();

      console.log(endpoint);
    } catch (error) {
      console.error(
        `Failed to read tunnel URL from ${tunnelUrlFilePath}:`,
        error,
      );
    }
  }

  // Ya no necesitamos obtener el userId ni verificar autenticación
  // const { userId } = auth();
  // if (!userId) throw new Error("User not found");

  // Incluimos el imageId en los inputs
  const inputs = {
    input_text: prompt,
    width: 832,
    height: 1216,
    batch: 1,
    id: imageId,
  };

  const result = await client.run.queue({
    deploymentId: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID,
    webhook: `${endpoint}/api/webhook`, // opcional
    inputs: inputs,
  });

  if (result) {
    await db.insert(runs).values({
		// run_id: result.runId, // Elimina esta línea
		image_id: imageId,
		inputs: inputs,
	  });
    // Devolvemos runId e imageId
    return { runId: result.runId, imageId };
  }

  return undefined;
}

export async function checkStatus(run_id: string) {
  return await client.run.get({
    runId: run_id,
  });
}

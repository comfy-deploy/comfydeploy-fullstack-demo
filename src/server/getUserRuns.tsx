"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
// Eliminamos la importación de 'auth' de Clerk
// import { auth } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";

export async function getUserRuns() {
  // Eliminamos la obtención de 'userId' y la verificación de autenticación
  // const { userId } = auth();
  // if (!userId) throw new Error("User not found");

  // Opción A: Obtener todas las ejecuciones sin filtrar por 'user_id'
  return db
    .select()
    .from(runs)
    .orderBy(desc(runs.createdAt));

  // Si deseas filtrar de alguna otra manera, puedes aplicar filtros adicionales
}

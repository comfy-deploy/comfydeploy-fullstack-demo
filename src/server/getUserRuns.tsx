"use server";

import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

export async function getUserRuns() {
	const { userId } = auth();
	if (!userId) throw new Error("User not found");
	return db
		.select()
		.from(runs)
		.where(eq(runs.user_id, userId))
		.orderBy(desc(runs.createdAt));
}

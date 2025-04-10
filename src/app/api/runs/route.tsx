import { runs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) throw new Error("User not found");

    // return []
    // return [
    // 	{
    // 		run_id: "123",
    // 		createdAt: 123,
    // 	},
    // 	{
    // 		run_id: "1232",
    // 		createdAt: 123,
    // 	},
    // ];

    const my_runs = await db
        .select()
        .from(runs)
        .where(eq(runs.user_id, userId))
        .orderBy(desc(runs.createdAt));

    return NextResponse.json(my_runs);
}


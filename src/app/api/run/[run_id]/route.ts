import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ run_id: string }> }) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { run_id } = params;

  const data = await fetch(`https://api.comfydeploy.com/api/run/${run_id}?queue_position=true`, {
    headers: {
      'Authorization': `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`
    }
  })

  const json = await data.json()

  const { live_status, status, outputs, progress, queue_position } = json

  // Now you can use the run_id in your response
  return NextResponse.json({
    live_status,
    status,
    outputs,
    progress,
    queue_position
  })
}
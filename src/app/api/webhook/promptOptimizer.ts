// src/app/api/webhook/promptOptimizer/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { prompt } = await request.json();

    try {
        const response = await fetch(`https://api.openai.com/v1/assistants/${process.env.ASSISTANT_ID}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: `Please optimize this prompt for image generation: "${prompt}"`
                    }
                ]
            })
        });

        if (!response.ok) {
            console.error(`Failed to optimize prompt: ${response.statusText}`);
            return NextResponse.json({ optimizedPrompt: prompt, error: "Optimization failed" }, { status: 500 });
        }

        const result = await response.json();
        const optimizedPrompt = result.choices?.[0]?.message?.content.trim() ?? prompt;

        return NextResponse.json({ optimizedPrompt });
    } catch (error) {
        console.error("Error optimizing the prompt:", error);
        return NextResponse.json({ optimizedPrompt: prompt, error: "Server error" }, { status: 500 });
    }
}

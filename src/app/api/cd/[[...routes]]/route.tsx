import { type NextRequest, NextResponse } from "next/server";

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

// Add other HTTP methods as needed (PUT, DELETE, etc.)

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

	// Check if the response is streamable
	const isStreamable = response.headers.get('Transfer-Encoding') === 'chunked' ||
                       response.headers.get('Content-Type')?.includes('text/event-stream');

	if (isStreamable) {
		// Create a TransformStream to handle the streaming response
		const transformStream = new TransformStream();
		const writer = transformStream.writable.getWriter();

		// Start pumping the response body to the transform stream
		response.body?.pipeTo(new WritableStream({
			write(chunk) {
				writer.write(chunk);
			},
			close() {
				writer.close();
			}
		}));

		// Return a streaming response
		return new NextResponse(transformStream.readable, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});
	}

	// For non-streaming responses, return as before
	return new NextResponse(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
}


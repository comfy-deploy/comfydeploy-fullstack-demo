import fetch from "node-fetch";

async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt...");

    try {
        const response = await fetch("https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const result = (await response.json()) as { prompt: string };
        console.log("Prompt optimizado:", result.prompt);
        return result.prompt;
    } catch (error) {
        console.error("Error optimizando el prompt:", error);
        return prompt; // Si hay un error, devuelve el prompt original
    }
}

export default promptOptimizer;

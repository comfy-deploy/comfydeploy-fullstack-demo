import fetch from "node-fetch";

type MakeResponse = {
    prompt: string; // Define la estructura esperada de la respuesta aquí
};

async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt...");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 segundos de timeout

    try {
        const response = await fetch("https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt }),
            signal: controller.signal // Conecta el controlador de abort con la solicitud
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const result = (await response.json()) as MakeResponse;
        console.log("Respuesta completa de Make:", JSON.stringify(result, null, 2));

        const optimizedPrompt = result.prompt;
        console.log("Prompt optimizado:", optimizedPrompt);

        return optimizedPrompt || prompt; // Retorna el prompt optimizado o el original si falla
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                console.error("Error: La solicitud fue cancelada debido a timeout.");
            } else {
                console.error("Error optimizando el prompt:", error.message);
            }
        } else {
            console.error("Error desconocido:", error);
        }
        return prompt; // En caso de error, retorna el prompt original
    } finally {
        clearTimeout(timeout); // Limpia el timeout si la solicitud se completa antes de los 20 segundos
    }
}

export default promptOptimizer;

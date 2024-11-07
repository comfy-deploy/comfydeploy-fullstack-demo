import fetch from "node-fetch";

async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt...");

    // Configuramos el controlador de abortar con un tiempo de espera de 30 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30000 ms = 30 segundos

    try {
        const response = await fetch("https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt }),
            signal: controller.signal
        });

        clearTimeout(timeoutId); // Limpiar el timeout si la respuesta llega a tiempo

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        // Parseamos la respuesta y verificamos que `optimizedPrompt` esté presente
        const result = await response.json();
        console.log("Respuesta completa de Make:", result);

        // Verificamos si `optimizedPrompt` existe y es una cadena de texto
        const optimizedPrompt = (result as { optimizedPrompt?: string }).optimizedPrompt;

        if (typeof optimizedPrompt !== "string") {
            console.error("optimizedPrompt no encontrado en la respuesta de Make o no es un string");
            return prompt; // Retornamos el prompt original si `optimizedPrompt` es undefined o no es string
        }

        console.log("Prompt optimizado:", optimizedPrompt);
        return optimizedPrompt;
    } catch (error) {
        if ((error as Error).name === "AbortError") {
            console.error("Error: La solicitud de optimización de prompt fue abortada por tiempo de espera.");
        } else {
            console.error("Error optimizando el prompt:", (error as Error).message);
        }
        return prompt; // Si hay un error, devuelve el prompt original
    }
}

export default promptOptimizer;


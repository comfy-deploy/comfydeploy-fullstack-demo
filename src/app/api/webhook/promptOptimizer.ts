import fetch from "node-fetch";

// Definimos la interfaz para la respuesta de Make
interface MakeResponse {
    optimizedPrompt?: string; // Esto indica que `optimizedPrompt` es opcional
}

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
            throw new Error(`Error en la solicitud a Make: ${response.statusText}`);
        }

        // Intentamos parsear la respuesta como JSON y luego verificamos su estructura
        const result = await response.json().catch((error) => {
            console.error("Error al parsear la respuesta JSON de Make:", error);
            throw new Error("Error al parsear la respuesta de Make.");
        });

        // Comprobamos que la respuesta tenga la estructura correcta
        if (result && typeof result === "object" && "choices" in result && Array.isArray(result.choices)) {
            const optimizedPrompt = result.choices[0]?.message?.content;

            if (typeof optimizedPrompt === "string") {
                console.log("Optimized prompt:", optimizedPrompt);
                return optimizedPrompt;
            } else {
                console.warn("optimizedPrompt no encontrado o no es una cadena de texto.");
            }
        } else {
            console.warn("La respuesta no tiene la estructura esperada.");
        }

        return prompt; // Si la respuesta no tiene el formato esperado, devolvemos el prompt original
    } catch (error) {
        if ((error as Error).name === "AbortError") {
            console.error("Error: La solicitud de optimización de prompt fue abortada por tiempo de espera.");
        } else {
            console.error("Error optimizando el prompt:", (error as Error).message);
        }
        return prompt; // Si hay un error, devolvemos el prompt original
    }
}

export default promptOptimizer;

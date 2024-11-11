"use server";

async function promptOptimizer(prompt: string): Promise<string> {
    console.log("Optimizing prompt with assistant...");

    try {
        const response = await fetch("https://hook.us2.make.com/rdpyblg9ov0hrjcqhsktc8l7o6gmiwsc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        // Verificamos si la respuesta es válida
        if (!response.ok) {
            throw new Error(`Failed to optimize prompt: ${response.statusText}`);
        }

        // Intentamos parsear la respuesta como JSON
        const responseText = await response.text(); // Usamos text() para capturar el cuerpo completo como texto
        let result;
        try {
            result = JSON.parse(responseText); // Parseamos la respuesta JSON
        } catch (jsonError) {
            console.error("Error parsing JSON from Make API:", jsonError);
            console.error("Response body:", responseText); // Muestra el cuerpo completo en caso de error
            throw new Error("Invalid JSON response from Make API");
        }

        console.log("Respuesta completa de Make:", result);

        // Verificamos si el objeto tiene la estructura esperada
        if (result?.optimizedPrompt && typeof result.optimizedPrompt === "string") {
            const optimizedPrompt = result.optimizedPrompt;
            console.log("Optimized prompt:", optimizedPrompt);
            return optimizedPrompt;
        } else {
            console.warn("optimizedPrompt no encontrado en la respuesta de Make.");
            return prompt; // Retornamos el prompt original si `optimizedPrompt` no está disponible
        }
    } catch (error) {
        console.error("Error optimizing the prompt:", error);
        return prompt; // Si hay un error, devolvemos el prompt original
    }
}

export default promptOptimizer;

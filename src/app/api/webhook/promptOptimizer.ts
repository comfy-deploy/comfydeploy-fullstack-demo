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

        if (!response.ok) {
            throw new Error(`Failed to optimize prompt: ${response.statusText}`);
        }

        const responseText = await response.text();
        
        let result;
        try {
            result = JSON.parse(responseText); // Intentamos convertir la respuesta a JSON
        } catch (jsonError) {
            console.error("Error parsing JSON from Make API:", jsonError);
            console.error("Response body:", responseText); // Log el cuerpo completo en caso de error
            throw new Error("Invalid JSON response from Make API");
        }

        console.log("Respuesta completa de Make:", result);

        // Verificamos si la respuesta tiene el campo 'content' directamente dentro de 'choices'
        const optimizedPrompt = result?.choices?.[0]?.content;

        if (optimizedPrompt) {
            console.log("Optimized prompt:", optimizedPrompt);
            return optimizedPrompt;
        } else {
            console.warn("content no encontrado en la respuesta de Make.");
            return prompt; // Retornamos el prompt original si 'content' no está disponible
        }
    } catch (error) {
        console.error("Error optimizing the prompt:", error);
        return prompt; // Si ocurre un error, devolvemos el prompt original
    }
}

export default promptOptimizer;

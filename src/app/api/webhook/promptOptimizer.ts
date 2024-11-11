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

        // Verificamos si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Failed to optimize prompt: ${response.statusText}`);
        }

        // Intentamos leer la respuesta como texto
        const responseText = await response.text();

        // Intentamos parsear el texto a JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Error parsing JSON from Make API:", jsonError);
            console.error("Response body:", responseText); // Muestra el cuerpo completo en caso de error
            throw new Error("Invalid JSON response from Make API");
        }

        console.log("Respuesta completa de Make:", result);

        // Verificamos si el resultado contiene los datos esperados
        if (result?.choices?.[0]?.message?.content) {
            // Accedemos correctamente al contenido del mensaje
            const optimizedPrompt = result.choices[0].message.content;
            console.log("Optimized prompt:", optimizedPrompt);
            return optimizedPrompt;
        } else {
            console.warn("optimizedPrompt no encontrado en la respuesta de Make.");
            console.warn("Message object:", result?.choices?.[0]?.message); // Mostrar el objeto completo
            return prompt; // Retornamos el prompt original si `optimizedPrompt` no está disponible
        }
    } catch (error) {
        console.error("Error optimizing the prompt:", error);
        return prompt; // Si hay un error, devolvemos el prompt original
    }
}

export default promptOptimizer;

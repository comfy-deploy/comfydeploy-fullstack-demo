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

        // Accedemos al objeto 'message' de 'choices' y mostramos su contenido
        if (result?.choices?.[0]?.message) {
            console.log("Message object:", result?.choices[0]?.message); // Mostrar el objeto completo 'message'

            // Intentamos acceder al 'content' dentro del 'message'
            const optimizedPrompt = result.choices[0].message.content;

            if (optimizedPrompt) {
                console.log("Optimized prompt:", optimizedPrompt);
                return optimizedPrompt;
            } else {
                console.warn("content no encontrado en el objeto 'message'.");
            }
        } else {
            console.warn("message no encontrado en la respuesta de Make.");
        }

        // Si no encontramos el 'content', devolvemos el prompt original
        return prompt;
    } catch (error) {
        console.error("Error optimizing the prompt:", error);
        return prompt; // Si hay un error, devolvemos el prompt original
    }
}

export default promptOptimizer;

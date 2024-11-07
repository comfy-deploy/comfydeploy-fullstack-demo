import fetch from "node-fetch";

type MakeResponse = {
    prompt: string; // Define la estructura esperada de la respuesta aquí
};

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

        // Usa el tipo MakeResponse para que TypeScript reconozca la estructura del JSON
        const result = (await response.json()) as MakeResponse;
        console.log("Respuesta completa de Make:", JSON.stringify(result, null, 2));

        const optimizedPrompt = result.prompt;
        console.log("Prompt optimizado:", optimizedPrompt);

        return optimizedPrompt || prompt; // Retorna el prompt optimizado o el original si falla
    } catch (error) {
        console.error("Error optimizando el prompt:", error);
        return prompt; // En caso de error, retorna el prompt original
    }
}

export default promptOptimizer;

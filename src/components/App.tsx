    "use client";

    import { useState } from "react";
    import { toast } from "sonner";
    import { mutate } from "swr";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Card } from "./ui/card";
    import { WandSparklesIcon } from "lucide-react";
    import { cn } from "@/lib/utils";

    export function App() {
        const [prompt, setPrompt] = useState("beautiful scenery nature glass bottle landscape, purple galaxy bottle");
        const [isGenerating, setIsGenerating] = useState(false);
        const [runId, setRunId] = useState<string | null>(null);

        // Función para optimizar el prompt y generar la imagen en un solo flujo
        const handleGenerateImage = async () => {
            setIsGenerating(true);

            try {
                // Paso 1: Optimización del prompt usando OpenAI
                const optimizeResponse = await fetch("/api/webhook/promptOptimizer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt })
                });

                const optimizeData = await optimizeResponse.json();
                if (!optimizeData.optimizedPrompt) {
                    throw new Error(optimizeData.error || "Failed to optimize prompt.");
                }
                const optimizedPrompt = optimizeData.optimizedPrompt;
                toast.success("Prompt optimized successfully!");

                // Paso 2: Generación de la imagen usando el prompt optimizado
                const generateResponse = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: optimizedPrompt })
                });

                const generateData = await generateResponse.json();
                if (generateData.runId) {
                    toast.success("Image generation started!");
                    setRunId(generateData.runId);
                    mutate("userRuns"); // Actualiza la lista de imágenes generadas
                } else {
                    toast.error("Failed to start image generation.");
                }
            } catch (error) {
                console.error("Error generating image:", error);
                toast.error("An error occurred while generating the image.");
            } finally {
                setIsGenerating(false);
            }
        };

        return (
            <div className="fixed z-50 bottom-0 md:bottom-2 flex flex-col gap-2 w-full md:max-w-lg mx-auto">
                <Card className="p-2 shadow-lg rounded-none md:rounded-2xl">
                    <div className="flex gap-2">
                        <Input
                            id="input"
                            className="rounded-xl text-base sm:text-sm z-10"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter a prompt to generate an image"
                        />
                        <Button
                            variant="expandIcon"
                            className={cn("rounded-xl transition-all w-[170px] min-w-0 p-0", isGenerating && "opacity-50 cursor-not-allowed")}
                            Icon={WandSparklesIcon}
                            iconPlacement="right"
                            onClick={handleGenerateImage}
                            disabled={isGenerating}
                        >
                            {isGenerating ? "Generating..." : "Generate"}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

/**
 * Helper function to find an output by its output_id
 * @param outputs Array of outputs from the webhook
 * @param outputId The output_id to search for
 * @returns The image object if found, undefined otherwise
 */
export function findOutputImageById(outputs: any[] | undefined, outputId: string) {
	if (!outputs) return undefined;

	const output = outputs.find((output) => output.output_id === outputId);

	return output?.data?.images[0];
}

import type { TypeOf } from "zod";

declare global {
	namespace NodeJS {
		interface ProcessEnv extends TypeOf<typeof zodEnv> {}
	}
}

import { z } from "zod";

export const zodEnv = z.object({
	COMFY_DEPLOY_WF_DEPLOYMENT_ID: z.string(),
	COMFY_DEPLOY_API_KEY: z.string(),

	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
	NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string(),

	DATABASE_URL: z.string(),
});

try {
	zodEnv.parse(process.env);
} catch (err) {
	if (err instanceof z.ZodError) {
		const { fieldErrors } = err.flatten();
		const errorMessage = Object.entries(fieldErrors)
			.map(([field, errors]) =>
				errors ? `${field}: ${errors.join(", ")}` : field,
			)
			.join("\n  ");

		const my_error = new Error(
			`Missing environment variables:\n  ${errorMessage}`,
		);
		my_error.stack = "";
		console.log(my_error.message);
		// throw my_error;
		process.exit(1);
	}
}

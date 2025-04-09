import type { Config } from 'drizzle-kit';

export default {
	out: './migrations',
	schema: './src/db/schema.ts',
	breakpoints: true,
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
	dialect: 'turso'
} satisfies Config;


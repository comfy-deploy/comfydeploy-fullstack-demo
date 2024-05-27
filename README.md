Full stack demo build with Next js 15, Tailwind, Shadcn UI, Drizzle, Turso, Clerk

## Setup Environment variable (Local)

```bash
cp .env.example .env.local
```

Create a new workflow on [ComfyDeploy](https://www.comfydeploy.com/) and get the API key from https://www.comfydeploy.com/api-keys

```bash
# API key from  https://www.comfydeploy.com/api-keys
COMFY_DEPLOY_API_KEY=""
# Workflow Deployment ID
COMFY_DEPLOY_WF_DEPLOYMENT_ID=""
```

Create a new project in Clerk and setup the key

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3006](http://localhost:3006) with your browser to see the result.
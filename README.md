Full stack demo build with Next js 15, Tailwind, Shadcn UI, Drizzle, Turso, Clerk

https://github.com/comfy-deploy/comfydeploy-fullstack-demo/assets/18395202/71ab2f5a-6e76-46a0-a1d1-81ba3a37b3ea

## Setting up ComfyUI workflow

1. Clone the workflow here https://www.comfydeploy.com/share/comfy-deploy-full-stack-demo
2. Deploy the workflow and use default machine to Production

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

## Deploying to Prod

1. Deploy to Vercel
2. Create a new clerk production environment, add env to vercel
3. Create a https://turso.tech/ db, and copy over the token to vercel

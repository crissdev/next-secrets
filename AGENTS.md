<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is
outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Development

After making changes to files run `pnpm run format` to ensure the code is formatted correctly.

After finishing implementing a feature, run `pnpm run lint` to ensure the code is linted correctly, `pnpm run typecheck`
to ensure the types are correct.

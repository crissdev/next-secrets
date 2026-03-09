<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is
outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Development

After making changes to files run `pnpm run format` to ensure the code is formatted correctly.

After finishing implementing a feature, run `pnpm run lint` to ensure the code is linted correctly, `pnpm run typecheck`
to ensure the types are correct, and ensure all the tests pass.

# Tests

Tests are defined in the `tests/` directory. Here's what each directory contains:

- `unit/` - unit tests
- `integration/` - integration tests
- `e2e/` - e2e tests

Tests are run via the npm scripts defined in `package.json`:

- `pnpm run test:unit`
- `pnpm run test:integration`

E2E tests are a bit special. If the application is running, they can be run via `pnpm run test:e2e`. The application is
running locally on port 3000.
If it's not running, then you need to build the application first via `pnpm run build` and then run
`pnpm run test:e2e:ci`.

When asked to run tests, always run all suites including E2E.

# Next Secrets

A secure secrets management application built with Next.js and TypeScript.

## Getting Started

This project uses [pnpm](https://pnpm.io/) as its package manager. To ensure you use the correct version, make sure you have Node.js 16.10 or newer, then enable corepack (included with Node.js):

```bash
corepack enable
```

corepack will automatically use the correct pnpm version as specified in the project's `package.json`.

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

### Data Storage

The application stores data in a PostgreSQL database. The database connection must be configured using the `DATABASE_URL` environment variable.

### Optional Encryption

Secrets can be optionally encrypted for enhanced security. To enable encryption, configure the following environment variables:

#### Required

- `DATA_ENC_KEY` - The encryption key (required to enable encryption)

#### Optional

- `DATA_ENC_ALGO` - The encryption algorithm (default: `aes-256-cbc`)
- `DATA_ENC_SALT` - The encryption salt (recommended for improved security)

For optimal security, the salt should be random and at least 16 bytes long. The encryption is performed using Node.js's built-in `scrypt` function.

## Environment Variables

Copy the example environment file to create your own local configuration:

```sh
cp .env.example .env
```

Then edit `.env` as needed for your environment.

Create a `.env.local` file in the project root with the following variables:

```env
# Encryption configuration (optional)
DATA_ENC_KEY="your-encryption-key-here"
DATA_ENC_ALGO="aes-256-cbc"
DATA_ENC_SALT="your-random-salt-here"
```

## Running with Docker

You can run the application and its PostgreSQL database using Docker Compose. This is the recommended way to ensure a consistent development environment.

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Steps

1. Copy the example environment variables to a `.env` file:

   ```sh
   cp .env.example .env
   # Edit .env as needed for your Docker setup
   ```

   Make sure your `.env` file contains the required database variables:

   ```env
   POSTGRES_USER=your_db_user
   POSTGRES_PASSWORD=your_db_password
   POSTGRES_DB=your_db_name
   POSTGRES_PORT=5432
   # Any other required variables
   ```

2. Start the services:

   ```sh
   pnpm dev:docker
   # or
   npm run dev:docker
   # or
   yarn dev:docker
   ```

   This will:

   - Start the PostgreSQL database
   - Run database migrations and seed the database
   - Start the Next.js development server on [http://localhost:3000](http://localhost:3000)

3. To stop and remove containers, networks, and volumes:

   ```sh
   pnpm dev:docker:down:volumes
   # or
   npm run dev:docker:down:volumes
   # or
   yarn dev:docker:down:volumes
   ```

### Notes

- The app will be available at [http://localhost:3000](http://localhost:3000).
- The database will be available on the host at the port specified by `POSTGRES_PORT` (default: 5432).
- Any code changes will be reflected automatically thanks to volume mounting.
- Migrations and seed scripts are run automatically on container startup.

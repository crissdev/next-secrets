# Next Secrets

A secure secrets management application built with Next.js and TypeScript.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

### Data Storage

The application stores data in a JSON file. The file location must be configured using the `DATA_FILE_PATH` environment variable.

### Optional Encryption

Secrets can be optionally encrypted for enhanced security. To enable encryption, configure the following environment variables:

#### Required

- `DATA_FILE_ENC_KEY` - The encryption key (required to enable encryption)

#### Optional

- `DATA_FILE_ENC_ALGO` - The encryption algorithm (default: `aes-256-cbc`)
- `DATA_FILE_ENC_SALT` - The encryption salt (recommended for improved security)

For optimal security, the salt should be random and at least 16 bytes long. The encryption is performed using Node.js's built-in `scrypt` function.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Data file configuration
DATA_FILE_PATH="data.json"

# Encryption configuration (optional)
DATA_FILE_ENC_KEY="your-encryption-key-here"
DATA_FILE_ENC_ALGO="aes-256-cbc"
DATA_FILE_ENC_SALT="your-random-salt-here"
```

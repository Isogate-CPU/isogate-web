# Isogate web

The Isogate web client is the public Vite application for [isogate.tech](https://isogate.tech/). It presents the inspectable deterministic CPU experience, Native Node provider surfaces, Genesis workflows, documentation, and public network views in a browser.

This repository contains the client only. It does not include an API server, database, deployment credentials, wallet secrets, or private operational data.

## What is included

- A React and Vite single-page application with query-string navigation for the public product surfaces.
- Local CPU replay in a browser worker, so the console can demonstrate bounded deterministic execution without requiring a server.
- A generated TypeScript API client in `src/api-client/`, kept in this repository so the client can be built independently.
- Optional wallet connection support for Robinhood Chain through the public AppKit configuration.
- Public branding and metadata assets in `public/`.

## Architecture

```text
Browser
  ├─ React UI and local CPU worker (src/)
  ├─ generated API client (src/api-client/)
  ├─ optional wallet adapter (src/lib/wallet.ts)
  └─ Vite static bundle (dist/)
         │
         └── HTTP requests to /api/* or VITE_API_BASE_URL
                         │
                  Isogate API deployment
```

The API boundary is deliberate: this project does not provide the server, persistence layer, database migrations, provider credentials, or contract deployment tooling. Run the separately exported API project when an API-backed surface is needed. Same-origin requests are used by default; an explicitly configured `VITE_API_BASE_URL` can point at a compatible public API deployment.

The browser never needs a private wallet key. Wallet actions are initiated through the connected wallet provider. Do not treat a browser bundle or a `VITE_*` value as a secret.

## Requirements

- Node.js 20 or newer
- pnpm 10 (the repository is intended to be installed with pnpm, not npm or Yarn)

## Setup

```bash
pnpm install
pnpm run typecheck
pnpm run build
pnpm run dev
```

Vite prints the local development URL. The production site is [https://isogate.tech](https://isogate.tech).

### Environment variables

All variables are optional for a static/local UI build. Copy values into your shell or a local ignored environment file; never commit credentials or private keys.

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Absolute base URL for a compatible API deployment. If omitted, requests use the current origin. | `https://api.example.test` |
| `VITE_REOWN_PROJECT_ID` | Public AppKit project identifier used to enable wallet connection UI. This is an identifier, not a wallet secret. | `public-project-id` |
| `VITE_BASE_PATH` | Optional URL base path when hosting the bundle below a subpath. | `/demo/` |
| `PORT` | Local Vite dev/preview port. | `5173` |

Do not place API credentials, provider credentials, signing keys, database URLs, or private wallet material in `VITE_*` variables. Vite embeds those values into the browser bundle.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Start the Vite development server. |
| `pnpm run typecheck` | Run TypeScript checks without emitting files. |
| `pnpm run build` | Create the production static bundle in `dist/`. |
| `pnpm run preview` | Preview the built bundle locally. |

## Product-status boundaries

The application includes labels such as live beta, coming soon, and mainnet live because those labels are part of the public product interface. They are not independent availability, audit, security, market, or decentralization claims. API-backed pages require a compatible deployment and may show unavailable status when no API is configured. Wallet and chain interactions require the relevant public network and user approval. Roadmap and simulator surfaces should be treated as experimental until independently documented.

Nothing in this client is an audit, investment advice, guarantee of performance, or recommendation to send funds. Verify network, contract, source, and deployment details independently before interacting with a live system.

## Security

Report suspected vulnerabilities privately to [support@isogate.tech](mailto:support@isogate.tech) rather than opening a public issue. Please do not include private keys, credentials, personal data, or production secrets in a report. See [SECURITY.md](./SECURITY.md) for the reporting policy.

For local work:

- Keep `.env` files, credentials, wallet material, generated bundles, and logs out of commits.
- Treat API responses and browser storage as untrusted input.
- Review wallet transaction details and the destination network before signing.
- Remember that this client does not establish the security of an API, smart contract, RPC endpoint, or deployment.

## Official links

- Website: [isogate.tech](https://isogate.tech/)
- Public GitHub organization: [github.com/Isogate-CPU](https://github.com/Isogate-CPU)
- Native Node package: [@isogate/node on npm](https://www.npmjs.com/package/@isogate/node)
- Public updates: [@Isogate_CPU on X](https://x.com/Isogate_CPU)

## Contributing and license

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request and follow the [Code of Conduct](./CODE_OF_CONDUCT.md). This project is released under the [MIT License](./LICENSE). Changes are recorded in [CHANGELOG.md](./CHANGELOG.md).

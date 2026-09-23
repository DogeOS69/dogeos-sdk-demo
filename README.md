# DogeOS SDK Demo

Interactive demo and reference site for `@dogeos/dogeos-sdk@4.0.0`.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

The demo includes public client ID defaults for compatibility. For SDK 4 email and social login, set a registered DogeOS client ID whose allowed origins include your deployment or local development URL:

```bash
NEXT_PUBLIC_DOGEOS_CLIENT_ID=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

The legacy default client ID is not admitted by the v4 authentication relay for localhost. Set `NEXT_PUBLIC_DOGEOS_CLIENT_ID` and confirm the registered origin before testing authentication or publishing.

Google and X are selected with `{ type: "google" }` and `{ type: "x" }`. SDK 4 owns their OAuth configuration and service destinations; the old provider client ID environment variables are no longer used.

## Build

```bash
pnpm typecheck
pnpm build
pnpm start
```

## Project Structure

- `app/` contains the Nextra App Router layout.
- `content/` contains the MDX demo/reference pages.
- `components/` contains the SDK demo UI and live configuration controls.
- `next.config.mjs` contains the Next.js and Nextra configuration.

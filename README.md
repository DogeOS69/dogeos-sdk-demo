# DogeOS SDK Demo

Interactive demo and reference site for `@dogeos/dogeos-sdk`.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

The demo includes DogeOS public client ID defaults so it can run locally without extra setup. Override them with:

```bash
NEXT_PUBLIC_DOGEOS_CLIENT_ID=
NEXT_PUBLIC_DOGEOS_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_DOGEOS_X_CLIENT_ID=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

- `app/` contains the Nextra App Router layout.
- `content/` contains the MDX demo/reference pages.
- `components/` contains the SDK demo UI and live configuration controls.
- `next.config.mjs` contains the Next.js and Nextra configuration.

# DogeOS SDK Demo

Interactive demo and reference site for `@dogeos/dogeos-sdk@4.0.0`.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Configuration

The demo uses the signup site's public integration client ID and the SDK's default production services. The shared client supports `https://sdk.dogeos.com` and `http://localhost:5173`.

For local development, use the exact URL above. Other ports and `127.0.0.1` are different origins and must be registered for your client ID.

To use your own integration, set `NEXT_PUBLIC_DOGEOS_CLIENT_ID` to a registered public client ID. You can also set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` if you manage your own WalletConnect project. Google and X authentication are managed by DogeOS.

## Wallet Actions

The SDK Tests panel runs requests against the connected wallet and displays their results:

- EVM balance, transaction count, gas estimation, message signing, and chain switching.
- Dogecoin account retrieval, balance, and message signing.
- Solana account retrieval and message signing.

Connect the corresponding wallet before running its actions. Balance actions read through the wallet provider; EVM results use hexadecimal base units and Dogecoin results include `confirmed`, `unconfirmed`, and `total` amounts in satoshis.

## Build

```bash
pnpm typecheck
pnpm build
pnpm start -p 5173
```

## Project Structure

- `app/` contains the Nextra App Router layout.
- `content/` contains the MDX demo/reference pages.
- `components/` contains the SDK demo UI and live configuration controls.
- `next.config.mjs` contains the Next.js and Nextra configuration.

# DogeOS SDK Demo

Interactive demo and reference site for `@dogeos/dogeos-sdk@4.0.1`.

## Getting Started

```bash
pnpm install --frozen-lockfile
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

## Native connection and signing

SDK 4.0.1 gives the injected MyDoge wallet precedence inside the native app and does not initialize an embedded-wallet iframe there. Ordinary browsers retain the configured email, Google, X, and external-wallet options. No private capability flags or separate native provider configuration are required.

`isConnected` describes a wallet connection. `walletStatus` and `isWalletReady` describe the embedded wallet, and are not prerequisites for injected-wallet signing or proof of an authenticated application session.

The **Sign Demo SIWE (EVM)** action creates a cryptographically random demo nonce, displays the exact challenge for the current account and chain, and calls `signInWithWallet`. It returns a signature only; this demo has no authentication backend. Production applications must issue a one-use server challenge and verify the exact message, signature, address, chain, origin, nonce, and expiry before establishing a session. See the [signing reference](content/hooks/useAccount/signInWithWallet.mdx).

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

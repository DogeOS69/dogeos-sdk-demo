# dogeos-sdk

A lightweight React SDK for integrating crypto wallet connections into your app. It ships with a configurable wallet list modal and basic account actions. Currently focused on EVM chains, built on top of `@tomo-inc/wallet-adaptor-base`, and supports custom wallets and chain configuration.

## On This Page

- [Installation](#installation)
- [Setup Provider](#setup-provider)
- [Displaying the Modal](#displaying-the-modal)
- [Customize Theme](#customize-theme)
- [Account Actions](#account-actions)
- [Advanced Configuration](#advanced-configuration)
- [Additional Reference](#additional-reference)

---

## Installation

```bash
npm install @dogeos/dogeos-sdk

```

Or using yarn:

```bash
yarn add @dogeos/dogeos-sdk

```

Or using pnpm:

```bash
pnpm add @dogeos/dogeos-sdk

```

---

## Setup Provider

### Use React

Wrap your app with `WalletConnectProvider` at the root component.

```tsx
// App.tsx
import React from "react";
import { WalletConnectProvider } from "@dogeos/dogeos-sdk";
import "@dogeos/dogeos-sdk/style.css";
import type { WalletConfig, WalletConnectConfig, WalletConnectProtocolConfig, tomoClientId } from "@dogeos/dogeos-sdk"

const config = {
  connectors?: WalletConfig[];
  // Supported chains (for EVM, compatible with viem/Chain)
  chains?: Partial<Record<ChainType, EvmChain[] | any[]>>;
  walletConnectConfig?: WalletConnectProtocolConfig;
  tomoClientId?: string;
} as WalletConnectConfig;

export default function App() {
  return (
    <WalletConnectProvider config={config}>
      <YourApp />
    </WalletConnectProvider>
  );
}
```

---

## Displaying the Modal

To display the modal for wallet connection, you can use the hooks provided by **dogeos-sdk**.

### Example Code

```tsx
import React from "react";
import { useWalletConnect } from "@dogeos/dogeos-sdk";

const ConnectButton = () => {
  const { openModal, isConnected, disconnect } = useWalletConnect();

  return (
    <button onClick={() => (isConnected ? disconnect() : openModal())}>
      {isConnected ? "Disconnect" : "Connect Wallet"}
    </button>
  );
};

export default ConnectButton;
```

### MyDoge Social Login Experience

When using the MyDoge theme, the modal will first display the social login interface, supporting:

- **Twitter Login** - Quick login with Twitter/X account
- **Google Login** - Quick login with Google account
- **Email Login** - Login with email address

Users can also select "Or connect a wallet" to directly connect traditional crypto wallets.

---

## Account Actions

### Reading Account Info and Signing

After connecting a wallet, you can use the `useAccount` hook to access account information and perform signing operations.

```tsx
import React from "react";
import { useAccount } from "@dogeos/dogeos-sdk";

export function AccountInfo() {
  const { address, chainId, signMessage, signInWithWallet } = useAccount();

  const onSignMessage = async () => {
    // Message signing for verification
    const sig = await signMessage?.({ message: "Hello MyDoge" });
    console.log("signature:", sig);
  };

  const onSignin = async () => {
    // Sign in with wallet to get a token
    const token = await signInWithWallet();
    console.log("token:", token);
  };

  return (
    <div>
      <div>Address: {address}</div>
      <div>Chain ID: {chainId}</div>
      <button onClick={onSignMessage}>Sign Message</button>
      <button onClick={onSignin}>Sign In With Wallet</button>
    </div>
  );
}
```

### Available Account Actions

- **address** - Current connected wallet address
- **chainId** - Current connected chain ID
- **balance** - Account balance
- **chainType** - Chain type (e.g., "evm")
- **currentWallet** - Current wallet information
- **currentProvider** - Current wallet provider
- **switchChain** - Switch network
- **signMessage** - Sign message
- **signInWithWallet** - Sign in with wallet

---

## Additional Reference

### SDK Exports

The SDK provides the following main exports:

- **WalletConnectProvider** - Main provider component with optional `config` prop
- **useWalletConnect** - Hook for modal control and connection state
  - `{ isOpenModal, openModal, closeModal, isConnected, isConnecting, error, connect, disconnect }`
- **useAccount** - Hook for account info and actions
  - `{ address, balance, chainType, chainId, currentWallet, currentProvider, switchChain, signMessage, signInWithWallet }`
- **Type Definitions**: `WalletConnectConfig`, `Chain`, `WalletProvider`, `UseAccount`, `UseWalletConnect`, `ChainType`, `ModalView`

### Complete Example

```tsx
import React from "react";
import {
  WalletConnectProvider,
  useWalletConnect,
  useAccount,
} from "@dogeos/dogeos-sdk";
import "@dogeos/dogeos-sdk/style.css";

// Connect Button Component
function ConnectButton() {
  const { openModal, isConnected, disconnect } = useWalletConnect();
  const { address } = useAccount();

  if (isConnected && address) {
    return (
      <div>
        <p>
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={openModal}>Connect Wallet</button>;
}

// App Component
function App() {
  // Configuration
  const config = {};

  return (
    <WalletConnectProvider config={config}>
      <div>
        <h1>MyDoge Wallet Connect Example</h1>
        <ConnectButton />
      </div>
    </WalletConnectProvider>
  );
}

export default App;
```

---

## Support

For more help or if you encounter issues, please visit:

- [GitHub Issues](https://github.com/DogeOS69/mydoge-sdk)
- [Support](support@dogeos.com)
- [Documentation](https://docs.dogeos.com)

---

## License

Please check the project's LICENSE file for details.

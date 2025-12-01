# Wallet Connect SDK - Usage Examples

## Basic Usage

```tsx
import { WalletConnectProvider } from "./views/WalletConnectProvider";

function App() {
  return (
    <WalletConnectProvider>
      <YourApp />
    </WalletConnectProvider>
  );
}
```

## Configure Connectors (Wallet Connectors)

```tsx
import { WalletConnectProvider } from "./views/WalletConnectProvider";

const config = {
  connectors: [
    {
      id: "my-custom-wallet",
      name: "My Custom Wallet",
      namespace: "my.custom.wallet",
      icon: "https://example.com/icon.png",
      iconBackground: "#000000",
      downloadUrls: {
        chrome: "https://example.com/install",
      },
    },
  ],
};

function App() {
  return (
    <WalletConnectProvider config={config}>
      <YourApp />
    </WalletConnectProvider>
  );
}
```

## Configure Chains (Supported Chains)

```tsx
import { WalletConnectProvider } from "./views/WalletConnectProvider";
import type { Chain } from "./views/WalletConnectProvider";

const config = {
  chains: [
    {
      id: 1,
      name: "Ethereum",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://eth.merkle.io"],
        },
      },
      blockExplorers: {
        default: {
          name: "Etherscan",
          url: "https://etherscan.io",
        },
      },
    },
    {
      id: 56,
      name: "BNB Smart Chain",
      nativeCurrency: {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://bsc-dataseed.binance.org"],
        },
      },
      blockExplorers: {
        default: {
          name: "BscScan",
          url: "https://bscscan.com",
        },
      },
    },
  ],
};

function App() {
  return (
    <WalletConnectProvider config={config}>
      <YourApp />
    </WalletConnectProvider>
  );
}
```

## Configure Both Connectors and Chains

```tsx
import { WalletConnectProvider } from "./views/WalletConnectProvider";
import type { WalletConnectConfig } from "./views/WalletConnectProvider";

const config: WalletConnectConfig = {
  connectors: [
    // custom wallets
  ],
  chains: [
    // supported chains
  ],
};

function App() {
  return (
    <WalletConnectProvider config={config}>
      <YourApp />
    </WalletConnectProvider>
  );
}
```

## Documentation

### Connectors

- `connectors` parameter is used to add custom wallet connectors
- Type reference: [WalletConfig](https://github.com/tomo-inc/wallet-adaptor-base)
- Standard reference: [wagmi Connectors](https://wagmi.sh/react/api/connectors)

### Chains

- `chains` parameter is used to configure supported blockchain networks
- Currently mainly used for EVM-compatible chains
- Structure compatible with [viem/Chain](https://wagmi.sh/react/api/chains)
- Standard reference: [wagmi Chains](https://wagmi.sh/react/api/chains)

### Non-EVM Chains

- Support for Solana, Aptos and other non-EVM chains is still under discussion
- Current version mainly supports EVM chain configuration

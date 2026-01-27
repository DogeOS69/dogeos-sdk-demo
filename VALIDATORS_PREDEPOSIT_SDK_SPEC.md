# DogeOS SDK Integration Specification
## Validators Pre-Deposit Campaign

**Version:** 1.0  
**Last Updated:** January 2026  
**SDK Version:** @dogeos/dogeos-sdk ^3.0.9

---

## Table of Contents

1. [Overview](#1-overview)
2. [Installation and Setup](#2-installation-and-setup)
3. [Provider Configuration](#3-provider-configuration)
4. [API Client Setup](#4-api-client-setup)
5. [Step 1: Connect and Authenticate](#5-step-1-connect-and-authenticate)
6. [Step 2: Obtain Dogecoin Address](#6-step-2-obtain-dogecoin-address)
7. [Step 3: Create PPW (Deposit Address)](#7-step-3-create-ppw-deposit-address)
8. [Step 4: Balance Check and Deposit Flow](#8-step-4-balance-check-and-deposit-flow)
9. [Contract Signing](#9-contract-signing)
10. [Utility Functions](#10-utility-functions)
11. [Complete Integration Example](#11-complete-integration-example)
12. [Error Handling](#12-error-handling)
13. [Type Definitions](#13-type-definitions)

---

## 1. Overview

### Campaign Flow Architecture

The Validators Pre-Deposit Campaign implements a **multi-chain architecture**:

1. **EVM Wallet (Primary)** - Required for:
   - Signing the smart contract (terms & conditions)
   - Receiving rewards for the pre-deposit campaign

2. **Dogecoin Address (Secondary)** - Required for:
   - Making the DOGE deposit
   - Refund address in case of issues

### Flow Diagram

```
┌─────────────────┐
│  Landing Page   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 1: Connect │
│   EVM Wallet    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 2: Get EVM │
│    Address      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 3: Get     │
│ DOGE Address    │◄──────────────────────┐
└────────┬────────┘                       │
         │                                │
    ┌────┴────┐                           │
    │         │                           │
    ▼         ▼                           │
┌───────┐ ┌────────┐                      │
│Embedded│ │External│                     │
│Wallet │ │Wallet  │                      │
└───┬───┘ └───┬────┘                      │
    │         │                           │
    ▼         ▼                           │
┌───────┐ ┌────────┐                      │
│Switch │ │Manual  │                      │
│to DOGE│ │Input   │                      │
└───┬───┘ └───┬────┘                      │
    │         │                           │
    └────┬────┘                           │
         │                                │
         ▼                                │
┌─────────────────┐                       │
│ Step 4: Backend │                       │
│  Get Deposit    │                       │
│    Address      │                       │
└────────┬────────┘                       │
         │                                │
         ▼                                │
┌─────────────────┐                       │
│ Step 5: Deposit │                       │
│    Flow         │                       │
└────────┬────────┘                       │
         │                                │
    ┌────┴────┐                           │
    │         │                           │
    ▼         ▼                           │
┌───────┐ ┌────────┐                      │
│Send   │ │Display │                      │
│via SDK│ │QR+Poll │                      │
└───┬───┘ └───┬────┘                      │
    │         │                           │
    └────┬────┘                           │
         │                                │
         ▼                                │
┌─────────────────┐                       │
│ Sign Contract   │                       │
└────────┬────────┘                       │
         │                                │
         ▼                                │
┌─────────────────┐                       │
│   Dashboard     │                       │
└─────────────────┘                       │
```

---

## 2. Installation and Setup

### 2.1 Package Installation

```bash
# Using npm
npm install @dogeos/dogeos-sdk

# Using pnpm
pnpm add @dogeos/dogeos-sdk

# Using yarn
yarn add @dogeos/dogeos-sdk
```

### 2.2 Peer Dependencies

The SDK requires React 18+ and works with both Next.js and Vite applications.

```bash
# If using viem for chain definitions (recommended)
npm install viem
```

### 2.3 Required Credentials

Before starting, obtain:

1. **DogeOS Client ID** - Required for embedded wallet functionality
   - Get from: https://sdk.dogeos.com/

2. **WalletConnect Project ID** - Required for WalletConnect integration
   - Get from: https://cloud.walletconnect.com/

---

## 3. Provider Configuration

### 3.1 Configuration Interface

```typescript
interface WalletConnectKitConfig {
  // Chain configuration
  chains?: {
    evm?: Chain[];
    dogecoin?: { name: string }[];
  };
  defaultConnectChain?: "evm" | "dogecoin";
  
  // Connector configuration (optional, obtained via getConnectors())
  connectors?: Awaited<GetConnectorsReturnType>;
  
  // External service IDs
  clientId?: string;
  walletConnectProjectId?: string;
  
  // Login methods
  login?: {
    basicLogins?: ("email" | "externalWallets")[];
    socialLogins?: { type: "google" | "x" }[];
  };
  
  // Theme configuration
  theme?: ThemeConfig;
  
  // Application metadata
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}
```

### 3.2 Complete Provider Setup

```typescript
// providers/wallet-provider.tsx
"use client";

import { WalletConnectProvider } from "@dogeos/dogeos-sdk";
import type { WalletConnectKitConfig } from "@dogeos/dogeos-sdk";
import { mainnet } from "viem/chains";
import { ReactNode, useMemo, useEffect, useState } from "react";

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Detect system/app theme
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getTheme = (): "light" | "dark" => {
      const html = document.documentElement;
      if (html.classList.contains("dark")) return "dark";
      if (html.classList.contains("light")) return "light";
      return "light";
    };

    setCurrentTheme(getTheme());

    const observer = new MutationObserver(() => setCurrentTheme(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const config = useMemo<WalletConnectKitConfig>(() => ({
    // ═══════════════════════════════════════════════════════════════
    // CHAIN CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    chains: {
      // EVM chain - Ethereum Mainnet only (for signing and rewards)
      evm: [mainnet],
      // Dogecoin for deposits
      dogecoin: [{ name: "Dogecoin" }],
    },
    
    // Default to EVM for initial connection
    defaultConnectChain: "evm",

    // ═══════════════════════════════════════════════════════════════
    // EXTERNAL SERVICE IDS
    // ═══════════════════════════════════════════════════════════════
    clientId: process.env.NEXT_PUBLIC_DOGEOS_CLIENT_ID,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // ═══════════════════════════════════════════════════════════════
    // LOGIN METHODS
    // ═══════════════════════════════════════════════════════════════
    login: {
      // Basic login methods
      basicLogins: ["email", "externalWallets"],
      
      // Social login providers
      socialLogins: [
        { type: "google" },
        { type: "x" },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // THEME CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    theme: {
      // CSS class prefix for theme styles
      prefix: "heroui",
      
      // Default theme mode
      defaultTheme: currentTheme,
      
      // Theme variants
      themes: {
        // ─────────────────────────────────────────────────────────────
        // LIGHT THEME
        // ─────────────────────────────────────────────────────────────
        light: {
          colors: {
            // Primary brand color (buttons, links, focus states)
            primary: {
              DEFAULT: "#FCD436",      // Main primary color
              foreground: "#12122A",   // Text on primary background
              // Color scale (optional, for variations)
              50: "#FFFEF5",
              100: "#FFFDE6",
              200: "#FFF9BF",
              300: "#FFF599",
              400: "#FFED4D",
              500: "#FCD436",          // Same as DEFAULT
              600: "#E5BF00",
              700: "#B39500",
              800: "#806B00",
              900: "#4D4000",
            },
            // Background color for the modal/widget
            background: "#FFFFFF",
            // Text color
            foreground: "#000000",
            // Content area background
            content1: "#FCFCFD",
          },
        },
        // ─────────────────────────────────────────────────────────────
        // DARK THEME
        // ─────────────────────────────────────────────────────────────
        dark: {
          colors: {
            primary: {
              DEFAULT: "#FCD436",
              foreground: "#12122A",
              50: "#4D4000",
              100: "#806B00",
              200: "#B39500",
              300: "#E5BF00",
              400: "#FCD436",
              500: "#FCD436",
              600: "#FFED4D",
              700: "#FFF599",
              800: "#FFF9BF",
              900: "#FFFEF5",
            },
            background: "#000000",
            foreground: "#FFFFFF",
            content1: "#1A1A1A",
          },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // APPLICATION METADATA
    // ═══════════════════════════════════════════════════════════════
    metadata: {
      name: "DogeOS Validators",
      description: "Pre-deposit campaign for DogeOS Validators",
      url: "https://validators.dogeos.com",
      icons: ["/logo.svg"],
    },
  }), [currentTheme]);

  return (
    <WalletConnectProvider config={config}>
      {children}
    </WalletConnectProvider>
  );
}
```

### 3.3 Theme Color Reference

| Property | Purpose | Example |
|----------|---------|---------|
| `primary.DEFAULT` | Primary buttons, links, focus rings, active states | `#FCD436` |
| `primary.foreground` | Text displayed on primary color backgrounds | `#12122A` |
| `background` | Modal/widget background color | `#FFFFFF` |
| `foreground` | Primary text color | `#000000` |
| `content1` | Secondary content area background | `#FCFCFD` |

### 3.4 Environment Variables

Create a `.env` file:

```bash
# Required for embedded wallet functionality
NEXT_PUBLIC_DOGEOS_CLIENT_ID=your_client_id_here

# Required for WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

---

## 4. API Client Setup

Configure Axios for backend API communication.

```typescript
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for session cookies
});
```

---

## 5. Step 1: Connect and Authenticate

This step has two parts: connecting the wallet via the SDK, then authenticating with the backend using SIWE.

### 5.1 Opening the Connection Modal

```typescript
import { useWalletConnect } from "@dogeos/dogeos-sdk";

function ConnectButton() {
  const { openModal, isConnected, isConnecting } = useWalletConnect();

  return (
    <button onClick={openModal} disabled={isConnecting || isConnected}>
      {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Connect Wallet"}
    </button>
  );
}
```

### 5.2 Connection State and EVM Address

```typescript
import { useWalletConnect, useAccount } from "@dogeos/dogeos-sdk";

function WalletStatus() {
  const { isConnected } = useWalletConnect();
  const { address, chainType } = useAccount();

  const isEvmConnected = isConnected && chainType === "evm" && !!address;

  if (!isEvmConnected) {
    return <div>Not connected</div>;
  }

  return <div>Connected: {address}</div>;
}
```

### 5.3 Connection State Properties

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | `boolean` | `true` when wallet is connected |
| `isConnecting` | `boolean` | `true` during connection process |
| `isOpenModal` | `boolean` | `true` when modal is visible |
| `error` | `Error \| null` | Error object if connection failed |

### 5.4 Backend Authentication (SIWE)

After wallet connection, authenticate with the backend using SIWE (Sign-In with Ethereum). The `signMessage` function accepts a `nonce` parameter separately from the message for security.

#### signMessage Parameters

```typescript
signMessage({
  message: string;   // The message to sign
  nonce?: string;    // Optional nonce for replay protection
})
```

#### Authentication Flow

```typescript
import { useAccount } from "@dogeos/dogeos-sdk";
import { apiClient } from "./api";

interface NonceResponse {
  nonce: string;
  expiresAt: string;
}

interface VerifyResponse {
  evmAddress: string;
  session: { type: string };
}

async function authenticateWithBackend(
  signMessage: ReturnType<typeof useAccount>["signMessage"]
): Promise<VerifyResponse> {
  // 1. Get nonce from backend
  const { data: { nonce } } = await apiClient.get<NonceResponse>("/v1/auth/siwe/nonce");

  // 2. Sign message with nonce passed as separate parameter
  const message = "Sign in to DogeOS Validators Pre-Deposit Campaign";
  const signature = await signMessage({ message, nonce });

  // 3. Verify with backend
  const { data } = await apiClient.post<VerifyResponse>("/v1/auth/siwe/verify", {
    message,
    signature,
  });

  return data;
}
```

### 5.5 Complete Step 1 Flow

```typescript
import { useState } from "react";
import { useWalletConnect, useAccount } from "@dogeos/dogeos-sdk";
import { apiClient } from "./api";

function Step1ConnectAndAuth({ onComplete }: { onComplete: () => void }) {
  const { openModal, isConnected } = useWalletConnect();
  const { address, chainType, signMessage } = useAccount();
  const [authenticating, setAuthenticating] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEvmConnected = isConnected && chainType === "evm" && !!address;

  const handleAuthenticate = async () => {
    if (!signMessage) return;

    try {
      setAuthenticating(true);
      setError(null);

      // Get nonce from backend
      const { data: { nonce } } = await apiClient.get("/v1/auth/siwe/nonce");

      // Sign message with nonce as separate parameter
      const message = "Sign in to DogeOS Validators Pre-Deposit Campaign";
      const signature = await signMessage({ message, nonce });

      // Verify with backend
      await apiClient.post("/v1/auth/siwe/verify", { message, signature });

      setAuthenticated(true);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthenticating(false);
    }
  };

  if (!isEvmConnected) {
    return (
      <div>
        <p>Connect your EVM wallet to participate in the pre-deposit campaign.</p>
        <button onClick={openModal}>Connect Wallet</button>
      </div>
    );
  }

  if (authenticated) {
    return <div>Authenticated as {address}</div>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      {error && <p>Error: {error}</p>}
      <button onClick={handleAuthenticate} disabled={authenticating}>
        {authenticating ? "Signing..." : "Sign In"}
      </button>
    </div>
  );
}
```

---

## 6. Step 2: Obtain Dogecoin Address

This step implements **branching logic** based on wallet type.

### 6.1 Wallet Type Detection Strategy

The SDK does not expose an explicit property to distinguish embedded wallets from external wallets. The recommended approach is to **attempt connecting to Dogecoin**:

- If successful → embedded wallet (has Dogecoin support)
- If it fails → external EVM wallet (requires manual address input)

**Important:** The `switchChain` method is for EVM chains only. Use `connect` with `chainType: "dogecoin"` for Dogecoin.

```typescript
import { useWalletConnect } from "@dogeos/dogeos-sdk";
import { useState, useCallback } from "react";

type WalletType = "embedded" | "external" | "unknown";

function useWalletTypeDetection() {
  const { connect } = useWalletConnect();
  const [detecting, setDetecting] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>("unknown");
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);

  const detectWalletType = useCallback(async () => {
    setDetecting(true);
    try {
      const result = await connect({ chainType: "dogecoin" });
      if (result?.address) {
        setWalletType("embedded");
        setDogeAddress(result.address);
      } else {
        setWalletType("external");
      }
    } catch {
      setWalletType("external");
    } finally {
      setDetecting(false);
    }
  }, [connect]);

  return { detectWalletType, detecting, walletType, dogeAddress };
}
```

### 6.2 Embedded Wallet Flow

After successful Dogecoin connection, the address from `useAccount()` is the Dogecoin address:

```typescript
import { useAccount } from "@dogeos/dogeos-sdk";

function EmbeddedWalletDogeAddress() {
  const { address, chainType } = useAccount();
  const isDogeConnected = chainType === "dogecoin" && !!address;

  if (!isDogeConnected) return <div>Retrieving Dogecoin address...</div>;
  return <div>Dogecoin Address: {address}</div>;
}
```

### 6.3 External Wallet Flow (Manual Input)

For external EVM wallets that don't support Dogecoin, collect the address manually:

```typescript
import { useState } from "react";

const DOGE_ADDRESS_REGEX = /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/;

function validateDogecoinAddress(address: string): boolean {
  return DOGE_ADDRESS_REGEX.test(address);
}

function ManualDogeAddressInput({ onSubmit }: { onSubmit: (address: string) => void }) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!validateDogecoinAddress(address)) {
      setError("Invalid Dogecoin address format");
      return;
    }
    onSubmit(address);
  };

  return (
    <div>
      <p>Your wallet does not support Dogecoin. Enter your address manually.</p>
      <input
        type="text"
        value={address}
        onChange={(e) => { setAddress(e.target.value); setError(null); }}
        placeholder="D..."
      />
      {error && <p>{error}</p>}
      <button onClick={handleSubmit} disabled={!address}>Continue</button>
    </div>
  );
}
```

### 6.4 Complete Step 2 Component

```typescript
import { useState, useEffect } from "react";
import { useWalletConnect } from "@dogeos/dogeos-sdk";

type WalletCapability = "detecting" | "embedded" | "external";

function Step2ObtainDogeAddress({ onComplete }: { onComplete: (address: string) => void }) {
  const { connect } = useWalletConnect();
  const [capability, setCapability] = useState<WalletCapability>("detecting");
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);

  useEffect(() => {
    const detectCapability = async () => {
      try {
        const result = await connect({
          chainType: "dogecoin",
        });

        if (result?.address) {
          setCapability("embedded");
          setDogeAddress(result.address);
        } else {
          setCapability("external");
        }
      } catch {
        setCapability("external");
      }
    };

    detectCapability();
  }, [connect]);

  if (capability === "detecting") {
    return <div>Detecting wallet capabilities...</div>;
  }

  if (capability === "embedded" && dogeAddress) {
    return (
      <div>
        <p>Dogecoin Address: {dogeAddress}</p>
        <button onClick={() => onComplete(dogeAddress)}>Continue</button>
      </div>
    );
  }

  return <ManualDogeAddressInput onSubmit={onComplete} />;
}
```

---

## 7. Step 3: Create PPW (Deposit Address)

The backend uses a **PPW (Predeposit Proxy Wallet)** model. Each user gets a P2SH address where they send their DOGE deposits.

### 7.1 Get Campaign Configuration

```typescript
import { apiClient } from "./api";

interface ConfigResponse {
  ceffuAddress: string;
  confirmationsRequired: number;
  depositsOpen: boolean;
}

async function getConfig(): Promise<ConfigResponse> {
  const { data } = await apiClient.get<ConfigResponse>("/v1/config");
  return data;
}
```

### 7.2 Create PPW

```typescript
import { apiClient } from "./api";

interface CreatePPWRequest {
  requestId: string;       // Idempotency key (UUID)
  refundAddress: string;   // Dogecoin P2PKH address for refunds
}

interface PPWResponse {
  ppwId: string;
  p2shAddress: string;     // This is the deposit address
  redeemScriptVersion: string;
  evmRecipient: string;
  refundAddress: string;
  refundP2pkh: string;
  createdAt: string;
}

async function createPPW(refundAddress: string): Promise<PPWResponse> {
  const { data } = await apiClient.post<PPWResponse>("/v1/ppws", {
    requestId: crypto.randomUUID(),
    refundAddress,
  });
  return data;
}
```

### 7.3 Step 3 Component

```typescript
import { useState, useEffect } from "react";
import { apiClient } from "./api";

function Step3CreatePPW({ 
  dogeAddress, 
  onComplete 
}: { 
  dogeAddress: string; 
  onComplete: (ppw: PPWResponse) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ppw, setPpw] = useState<PPWResponse | null>(null);

  useEffect(() => {
    const fetchPPW = async () => {
      try {
        setLoading(true);
        const data = await createPPW(dogeAddress);
        setPpw(data);
        onComplete(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create deposit address");
      } finally {
        setLoading(false);
      }
    };
    fetchPPW();
  }, [dogeAddress, onComplete]);

  if (loading) return <div>Creating deposit address...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Deposit Address: {ppw?.p2shAddress}</div>;
}
```

---

## 8. Step 4: Balance Check and Deposit Flow

### 8.1 Poll UTXO Status

```typescript
import { apiClient } from "./api";

type UTXOOrigin = "NON_CEFFU" | "CEFFU" | "UNKNOWN";
type UTXOState = 
  | "SEEN_UNCONFIRMED" 
  | "CONFIRMED" 
  | "DEPOSIT_SIGNING" 
  | "DEPOSIT_CONFIRMED" 
  | "REFUND_SIGNING" 
  | "REFUND_CONFIRMED" 
  | "SPENT_EXTERNALLY" 
  | "NEEDS_ATTENTION" 
  | "ORPHANED";

interface UTXO {
  outpoint: string;
  amountSats: string;
  confirmations: number;
  origin: UTXOOrigin;
  state: UTXOState;
}

interface UTXOsResponse {
  ppwId: string;
  utxos: UTXO[];
}

async function getUTXOs(ppwId: string): Promise<UTXOsResponse> {
  const { data } = await apiClient.get<UTXOsResponse>(`/v1/ppws/${ppwId}/utxos`);
  return data;
}
```

### 8.2 Get Summary Totals

```typescript
interface SummaryResponse {
  evmRecipient: string;
  totalInboundToPpwSats: string;
  totalForwardedToCeffuSats: string;
  totalRefundedToUserSats: string;
  rewards: { type: string; amount: string };
}

async function getSummary(evmAddress: string): Promise<SummaryResponse> {
  const { data } = await apiClient.get<SummaryResponse>("/v1/summary", {
    params: { evmRecipient: evmAddress },
  });
  return data;
}
```

### 8.3 Embedded Wallet: Send Deposit

```typescript
import { useAccount } from "@dogeos/dogeos-sdk";
import { useState } from "react";

function satoshiToDoge(satoshi: number): number {
  return satoshi / 100_000_000;
}

function dogeToSatoshi(doge: number): number {
  return Math.floor(doge * 100_000_000);
}

function EmbeddedWalletDeposit({ 
  depositAddress, 
  onDepositSent 
}: { 
  depositAddress: string; 
  onDepositSent: (txHash: string) => void;
}) {
  const { currentProvider, chainType, balance } = useAccount();
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balanceInSatoshi = balance ? parseFloat(balance) * 100_000_000 : 0;

  const handleSend = async () => {
    if (!currentProvider || chainType !== "dogecoin") {
      setError("Dogecoin wallet not connected");
      return;
    }

    const amountSatoshi = dogeToSatoshi(parseFloat(amount));
    
    try {
      setSending(true);
      const txHash = await currentProvider.sendDogecoin({
        to: depositAddress,
        amount: amountSatoshi,
      });
      onDepositSent(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <p>Balance: {satoshiToDoge(balanceInSatoshi)} DOGE</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in DOGE"
      />
      {error && <p>{error}</p>}
      <button onClick={handleSend} disabled={sending || !amount}>
        {sending ? "Sending..." : "Send Deposit"}
      </button>
    </div>
  );
}
```

### 8.4 Insufficient Balance: On-Ramp to Buy Doge

When the user's connected wallet has insufficient balance for the desired deposit amount, the app should prompt them to purchase Doge via an on-ramp service. The on-ramp link is fetched from the backend API, with a fallback to a default URL if the API call fails.

#### On-Ramp Hook Implementation

```typescript
import { useCallback, useContext } from "react";
import { useColorScheme } from "react-native"; // or equivalent for web
import axios from "axios";

// Utility for retrying API calls
async function callWithRetry<T>(
  fn: (...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
}

function logError(error: Error): void {
  console.error("On-ramp error:", error);
}

export function useOnramp() {
  const {
    appContext: { addr },
  } = useContext(AppContext);
  const colorMode = useColorScheme();

  const launchOnramp = useCallback(async () => {
    // Construct unsigned fallback URL with wallet address and theme
    const unsignedUrl = `https://buy.getdoge.com/?addr=${addr}&darkMode=${
      colorMode === "dark"
    }`;
    
    // Attempt to get a signed URL from the backend
    const response = await callWithRetry(
      axios.get,
      `https://api.mydoge.com/onramp?addr=${addr}`
    ).catch(logError);
    
    const signedUrl = response?.data?.destination;
    
    // Use signed URL if available, otherwise fallback to unsigned URL
    const destination = signedUrl || unsignedUrl;
    
    // Open the on-ramp in an external browser
    const result = await openBrowserAsync(
      destination,
      { createTask: false } // Required for Android browser to not close on loss of focus
    );
    
    return result;
  }, [addr, colorMode]);

  return {
    launchOnramp,
  };
}
```

#### Integrating On-Ramp with Deposit Flow

```typescript
import { useAccount } from "@dogeos/dogeos-sdk";
import { useState } from "react";

const MINIMUM_DEPOSIT_DOGE = 100; // Example minimum deposit

function EmbeddedWalletDepositWithOnramp({
  depositAddress,
  onDepositSent,
}: {
  depositAddress: string;
  onDepositSent: (txHash: string) => void;
}) {
  const { currentProvider, chainType, balance, address } = useAccount();
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balanceInDoge = balance ? parseFloat(balance) : 0;
  const requestedAmount = parseFloat(amount) || 0;
  const hasInsufficientBalance = requestedAmount > balanceInDoge;

  const handleLaunchOnramp = async () => {
    // Construct on-ramp URL
    const colorMode = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    const unsignedUrl = `https://buy.getdoge.com/?addr=${address}&darkMode=${
      colorMode === "dark"
    }`;

    try {
      // Attempt to get signed URL from backend
      const response = await fetch(`https://api.mydoge.com/onramp?addr=${address}`);
      const data = await response.json();
      const destination = data?.destination || unsignedUrl;

      // Open on-ramp in new window/tab
      window.open(destination, "_blank", "noopener,noreferrer");
    } catch {
      // Fallback to unsigned URL if API fails
      window.open(unsignedUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSend = async () => {
    if (!currentProvider || chainType !== "dogecoin") {
      setError("Dogecoin wallet not connected");
      return;
    }

    if (hasInsufficientBalance) {
      setError("Insufficient balance");
      return;
    }

    const amountSatoshi = dogeToSatoshi(requestedAmount);

    try {
      setSending(true);
      const txHash = await currentProvider.sendDogecoin({
        to: depositAddress,
        amount: amountSatoshi,
      });
      onDepositSent(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <p>Balance: {balanceInDoge.toFixed(8)} DOGE</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setError(null);
        }}
        placeholder="Amount in DOGE"
      />

      {hasInsufficientBalance && (
        <div>
          <p>Insufficient balance. You need {requestedAmount - balanceInDoge} more DOGE.</p>
          <button onClick={handleLaunchOnramp}>Buy Doge</button>
        </div>
      )}

      {error && <p>{error}</p>}

      <button
        onClick={handleSend}
        disabled={sending || !amount || hasInsufficientBalance}
      >
        {sending ? "Sending..." : "Send Deposit"}
      </button>
    </div>
  );
}
```

#### On-Ramp API Endpoint

The MyDoge API exposes an `/onramp` endpoint that returns a signed on-ramp URL:

```typescript
// MyDoge API endpoint
// GET https://api.mydoge.com/onramp?addr={dogecoinAddress}

interface OnrampResponse {
  destination: string; // Signed URL for the on-ramp service
}
```

If the backend API call fails or is unavailable, the client falls back to the unsigned URL (`https://buy.getdoge.com/?addr={addr}&darkMode={boolean}`).

### 8.5 External Wallet: Display Address and Poll for Deposit

For external wallets, display the deposit address and poll UTXOs for confirmation. External wallet users can also be directed to the on-ramp if they need to purchase DOGE before sending to the deposit address.

```typescript
import { useState, useEffect } from "react";
import { apiClient } from "./api";

function ExternalWalletDeposit({
  ppwId,
  depositAddress,
  onDepositConfirmed,
}: {
  ppwId: string;
  depositAddress: string;
  onDepositConfirmed: () => void;
}) {
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!polling) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data } = await apiClient.get(`/v1/ppws/${ppwId}/utxos`);
        const confirmedDeposit = data.utxos.find(
          (u: UTXO) => u.state === "CONFIRMED" || u.state === "DEPOSIT_SIGNING" || u.state === "DEPOSIT_CONFIRMED"
        );
        if (confirmedDeposit) {
          setPolling(false);
          onDepositConfirmed();
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [polling, ppwId, onDepositConfirmed]);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(depositAddress)}`;

  return (
    <div>
      <p>Send Dogecoin to this address:</p>
      <img src={qrCodeUrl} alt="QR Code" />
      <code>{depositAddress}</code>
      <button onClick={() => navigator.clipboard.writeText(depositAddress)}>Copy</button>
      {polling && <p>Waiting for deposit...</p>}
    </div>
  );
}
```

---

## 9. Contract Signing

### 9.1 Simple Message Signing

```typescript
import { useAccount } from "@dogeos/dogeos-sdk";
import { useState } from "react";

interface ContractSignature {
  message: string;
  signature: string;
  address: string;
  timestamp: number;
}

async function signContract(
  signMessage: (msg: string) => Promise<string>,
  address: string,
  contractTerms: string
): Promise<ContractSignature> {
  const timestamp = Date.now();
  const nonce = crypto.randomUUID();
  
  const message = [
    "DogeOS Validators Pre-Deposit Agreement",
    "",
    "By signing this message, I agree to the following terms:",
    "",
    contractTerms,
    "",
    `Address: ${address}`,
    `Timestamp: ${timestamp}`,
    `Nonce: ${nonce}`,
  ].join("\n");

  const signature = await signMessage(message);

  return { message, signature, address, timestamp };
}

function ContractSigning({ 
  contractTerms, 
  onSigned 
}: { 
  contractTerms: string;
  onSigned: (sig: ContractSignature) => void;
}) {
  const { signMessage, address } = useAccount();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!signMessage || !address) return;

    try {
      setSigning(true);
      const signature = await signContract(signMessage, address, contractTerms);
      onSigned(signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div>
      <pre>{contractTerms}</pre>
      {error && <p>{error}</p>}
      <button onClick={handleSign} disabled={signing || !signMessage}>
        {signing ? "Signing..." : "Sign Agreement"}
      </button>
    </div>
  );
}
```

### 9.2 EIP-712 Typed Data Signing

```typescript
import { useAccount } from "@dogeos/dogeos-sdk";
import { useState } from "react";

const EIP712_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  PreDepositAgreement: [
    { name: "depositor", type: "address" },
    { name: "dogecoinRefundAddress", type: "string" },
    { name: "depositAmount", type: "uint256" },
    { name: "depositAddress", type: "string" },
    { name: "agreementHash", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

async function signEIP712(
  provider: any,
  address: string,
  domain: { name: string; version: string; chainId: number; verifyingContract: string },
  message: Record<string, any>
): Promise<string> {
  const typedData = {
    types: EIP712_TYPES,
    primaryType: "PreDepositAgreement",
    domain,
    message,
  };

  return provider.request({
    method: "eth_signTypedData_v4",
    params: [address, JSON.stringify(typedData)],
  });
}

function EIP712ContractSigning({
  evmAddress,
  dogeAddress,
  depositAddress,
  depositAmount,
  onSigned,
}: {
  evmAddress: string;
  dogeAddress: string;
  depositAddress: string;
  depositAmount: bigint;
  onSigned: (signature: string) => void;
}) {
  const { currentProvider, chainId } = useAccount();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!currentProvider) return;

    try {
      setSigning(true);
      
      const domain = {
        name: "DogeOS Validators",
        version: "1",
        chainId: parseInt(chainId || "1", 16),
        verifyingContract: "0x...", // Contract address
      };

      const message = {
        depositor: evmAddress,
        dogecoinRefundAddress: dogeAddress,
        depositAmount: depositAmount.toString(),
        depositAddress,
        agreementHash: "0x...", // keccak256 of terms
        nonce: Date.now().toString(),
        deadline: (Math.floor(Date.now() / 1000) + 3600).toString(),
      };

      const signature = await signEIP712(currentProvider, evmAddress, domain, message);
      onSigned(signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div>
      <p>Depositor: {evmAddress}</p>
      <p>Refund Address: {dogeAddress}</p>
      {error && <p>{error}</p>}
      <button onClick={handleSign} disabled={signing}>
        {signing ? "Signing..." : "Sign Contract (EIP-712)"}
      </button>
    </div>
  );
}
```

---

## 10. Utility Functions

### 10.1 Address Formatting

```typescript
/**
 * Truncate an address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Validate EVM address format
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Dogecoin address format
 */
export function isValidDogecoinAddress(address: string): boolean {
  // Mainnet addresses start with D and are 34 characters
  return /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/.test(address);
}
```

### 10.2 Amount Conversion

```typescript
/**
 * Convert satoshi to DOGE
 */
export function satoshiToDoge(satoshi: number): number {
  return satoshi / 100_000_000;
}

/**
 * Convert DOGE to satoshi
 */
export function dogeToSatoshi(doge: number): number {
  return Math.floor(doge * 100_000_000);
}

/**
 * Format DOGE amount for display
 */
export function formatDoge(satoshi: number, decimals = 8): string {
  return satoshiToDoge(satoshi).toFixed(decimals);
}

/**
 * Convert wei to ETH
 */
export function weiToEth(wei: bigint): number {
  return Number(wei) / 1e18;
}

/**
 * Convert ETH to wei
 */
export function ethToWei(eth: number): bigint {
  return BigInt(Math.floor(eth * 1e18));
}
```

### 10.3 Polling Helper

```typescript
interface PollingOptions<T> {
  fn: () => Promise<T>;
  validate: (result: T) => boolean;
  interval?: number;
  maxAttempts?: number;
  onAttempt?: (attempt: number) => void;
}

/**
 * Poll a function until validation passes or max attempts reached
 */
export async function poll<T>({
  fn,
  validate,
  interval = 10000,
  maxAttempts = 60,
  onAttempt,
}: PollingOptions<T>): Promise<T> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    onAttempt?.(attempts);

    try {
      const result = await fn();
      if (validate(result)) {
        return result;
      }
    } catch (error) {
      console.error(`Polling attempt ${attempts} failed:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Polling timed out after ${maxAttempts} attempts`);
}

// Usage example
async function waitForDeposit(depositId: string): Promise<DepositStatus> {
  return poll({
    fn: async () => {
      const response = await fetch(`/api/deposits/${depositId}/status`);
      return response.json();
    },
    validate: (result) => result.status === "confirmed",
    interval: 10000,
    maxAttempts: 60,
    onAttempt: (attempt) => console.log(`Checking deposit... attempt ${attempt}`),
  });
}
```

---

## 11. Complete Integration Example

```typescript
"use client";

import { useState } from "react";
import { useWalletConnect, useAccount } from "@dogeos/dogeos-sdk";
import { apiClient } from "./api";

type CampaignStep = 
  | "connect"
  | "authenticate"
  | "get_doge_address"
  | "create_ppw"
  | "deposit"
  | "sign_contract"
  | "complete";

interface CampaignState {
  step: CampaignStep;
  evmAddress: string | null;
  dogeAddress: string | null;
  ppw: PPWResponse | null;
  txHash: string | null;
  signature: string | null;
}

export function PreDepositCampaign() {
  const { isConnected, openModal } = useWalletConnect();
  const { address, chainType, signMessage } = useAccount();

  const [state, setState] = useState<CampaignState>({
    step: "connect",
    evmAddress: null,
    dogeAddress: null,
    ppw: null,
    txHash: null,
    signature: null,
  });

  const handleAuthenticated = () => {
    setState(prev => ({ ...prev, step: "get_doge_address", evmAddress: address! }));
  };

  const handleDogeAddress = (dogeAddress: string) => {
    setState(prev => ({ ...prev, step: "create_ppw", dogeAddress }));
  };

  const handlePPWCreated = (ppw: PPWResponse) => {
    setState(prev => ({ ...prev, step: "deposit", ppw }));
  };

  const handleDepositConfirmed = () => {
    setState(prev => ({ ...prev, step: "sign_contract" }));
  };

  const handleContractSigned = (signature: string) => {
    setState(prev => ({ ...prev, step: "complete", signature }));
  };

  // Render based on current step
  switch (state.step) {
    case "connect":
      return !isConnected 
        ? <button onClick={openModal}>Connect Wallet</button>
        : <button onClick={() => setState(prev => ({ ...prev, step: "authenticate" }))}>Continue</button>;

    case "authenticate":
      return <Step1ConnectAndAuth onComplete={handleAuthenticated} />;

    case "get_doge_address":
      return <Step2ObtainDogeAddress onComplete={handleDogeAddress} />;

    case "create_ppw":
      return <Step3CreatePPW dogeAddress={state.dogeAddress!} onComplete={handlePPWCreated} />;

    case "deposit":
      return <ExternalWalletDeposit 
        ppwId={state.ppw!.ppwId}
        depositAddress={state.ppw!.p2shAddress}
        onDepositConfirmed={handleDepositConfirmed}
      />;

    case "sign_contract":
      return <ContractSigning contractTerms="..." onSigned={handleContractSigned} />;

    case "complete":
      return (
        <div>
          <p>Success! Your deposit is complete.</p>
          <p>EVM Address: {state.evmAddress}</p>
          <p>DOGE Address: {state.dogeAddress}</p>
        </div>
      );
  }
}
```

---

## 12. Error Handling

### 12.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Wallet not connected" | Attempting action before connection | Check `isConnected` before operations |
| "User rejected" | User cancelled in wallet | Show retry option |
| "Chain not supported" | Wallet doesn't support chain | Guide to manual input (DOGE) |
| "Insufficient funds" | Balance too low for deposit | Prompt user to buy DOGE via on-ramp (see Section 8.4) |
| "Provider not available" | Wrong chain type active | Switch chain first |

### 12.2 Error Boundary Component

```typescript
import { Component, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WalletErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 13. Type Definitions

### 13.1 API Types

```typescript
// types/api.ts

// Auth
export interface NonceResponse {
  nonce: string;
  expiresAt: string;
}

export interface VerifyRequest {
  message: string;
  signature: string;
}

export interface VerifyResponse {
  evmAddress: string;
  session: { type: string };
}

// PPW (Predeposit Proxy Wallet)
export interface CreatePPWRequest {
  requestId: string;
  refundAddress: string;
}

export interface PPWResponse {
  ppwId: string;
  p2shAddress: string;
  redeemScriptVersion: string;
  evmRecipient: string;
  refundAddress: string;
  refundP2pkh: string;
  createdAt: string;
}

// UTXOs
export type UTXOOrigin = "NON_CEFFU" | "CEFFU" | "UNKNOWN";

export type UTXOState = 
  | "SEEN_UNCONFIRMED" 
  | "CONFIRMED" 
  | "DEPOSIT_SIGNING" 
  | "DEPOSIT_CONFIRMED" 
  | "REFUND_SIGNING" 
  | "REFUND_CONFIRMED" 
  | "SPENT_EXTERNALLY" 
  | "NEEDS_ATTENTION" 
  | "ORPHANED";

export interface UTXO {
  outpoint: string;
  amountSats: string;
  confirmations: number;
  origin: UTXOOrigin;
  state: UTXOState;
}

export interface UTXOsResponse {
  ppwId: string;
  utxos: UTXO[];
}

// Summary
export interface SummaryResponse {
  evmRecipient: string;
  totalInboundToPpwSats: string;
  totalForwardedToCeffuSats: string;
  totalRefundedToUserSats: string;
  rewards: { type: string; amount: string };
}

// Config
export interface ConfigResponse {
  ceffuAddress: string;
  confirmationsRequired: number;
  depositsOpen: boolean;
}
```

### 13.2 Campaign Types

```typescript
// types/campaign.ts

export type ChainType = "evm" | "dogecoin";

export type WalletType = "embedded" | "external";

export type CampaignStep =
  | "connect"
  | "authenticate"
  | "get_doge_address"
  | "create_ppw"
  | "deposit"
  | "sign_contract"
  | "complete";

export interface CampaignState {
  step: CampaignStep;
  walletType: WalletType | null;
  evmAddress: string | null;
  dogeAddress: string | null;
  ppw: PPWResponse | null;
  txHash: string | null;
  signature: string | null;
}

export interface ContractSignature {
  message: string;
  signature: string;
  address: string;
  timestamp: number;
}
```

---

## Appendix: SDK Method Reference

### useWalletConnect

| Method/Property | Type | Description |
|----------------|------|-------------|
| `openModal()` | `() => void` | Opens wallet selection modal |
| `closeModal()` | `() => void` | Closes the modal |
| `disconnect()` | `() => Promise<void>` | Disconnects wallet |
| `isConnected` | `boolean` | Connection status |
| `isConnecting` | `boolean` | Connection in progress |
| `isOpenModal` | `boolean` | Modal visibility |
| `error` | `Error \| null` | Connection error |

### useAccount

| Method/Property | Type | Description |
|----------------|------|-------------|
| `address` | `string \| undefined` | Wallet address |
| `chainId` | `string \| undefined` | Current chain ID |
| `chainType` | `"evm" \| "dogecoin" \| undefined` | Chain type |
| `balance` | `string \| undefined` | Native token balance |
| `currentProvider` | `object \| undefined` | Chain provider |
| `signMessage()` | `(opts) => Promise<string>` | Sign a message |
| `signInWithWallet()` | `(opts?) => Promise<string>` | SIWE authentication |
| `switchChain()` | `(opts) => Promise<boolean>` | Switch blockchain |

### Dogecoin Provider Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getBalance()` | none | `{ balance: number }` | Balance in satoshi |
| `getAccounts()` | none | `string[]` | Connected accounts |
| `signMessage()` | `{ message: string }` | `string` | Sign message |
| `sendDogecoin()` | `{ to, amount }` | `string` | Send DOGE, returns txHash |

### EVM Provider Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `eth_chainId` | none | `string` | Chain ID (hex) |
| `eth_getBalance` | `[address, block]` | `string` | Balance in wei (hex) |
| `eth_sendTransaction` | `[txObject]` | `string` | Send tx, returns hash |
| `eth_signTypedData_v4` | `[address, data]` | `string` | EIP-712 signature |

---

*End of Specification*

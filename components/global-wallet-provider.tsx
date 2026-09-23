"use client";

import type { WalletConnectKitConfig } from "@dogeos/dogeos-sdk";
import { WalletConnectProvider } from "@dogeos/dogeos-sdk";
import React, { useEffect, useMemo, useState } from "react";
import { mainnet } from "viem/chains";
import { dogeOSTestnet, getDogeOSDemoMetadata, solanaChains } from "./dogeos-testnet";

const DOGEOS_CLIENT_ID =
  process.env.NEXT_PUBLIC_DOGEOS_CLIENT_ID ??
  process.env.NEXT_PUBLIC_CLIENT_ID ??
  "tvmff3fh5I0raW9xMN9zW8wW8WX4uUE9hmYnmwVuzh8rJ7vkglUzsQnzOqeSC8vC39vhPTPUIJFK5DwyHBkRIk4M";
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "44cb8a6aedbe379ba8f2fa4fbc1a461f";

export function GlobalWalletProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getThemeFromDOM = (): "light" | "dark" => {
      const html = document.documentElement;
      if (html.classList.contains("dark")) {
        return "dark";
      }
      if (html.classList.contains("light")) {
        return "light";
      }
      const dataTheme = html.getAttribute("data-theme");
      if (dataTheme === "dark" || dataTheme === "light") {
        return dataTheme;
      }
      return "light";
    };

    const initialTheme = getThemeFromDOM();
    setCurrentTheme(initialTheme);

    const observer = new MutationObserver(() => {
      const theme = getThemeFromDOM();
      setCurrentTheme(theme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const globalConfig = useMemo<WalletConnectKitConfig>(
    () => ({
      clientId: DOGEOS_CLIENT_ID,
      chains: {
        evm: [dogeOSTestnet, mainnet],
        solana: solanaChains,
      },
      metadata: getDogeOSDemoMetadata(),
      login: {
        basicLogins: ["email", "externalWallets"],
        socialLogins: [
          { type: "google" },
          { type: "x" },
        ],
      },
      theme: {
        prefix: "heroui",
        themes: {
          light: {
            colors: {
              foreground: "#000",
              background: "#FFF",
              content1: "#FCFCFD",
              primary: {
                DEFAULT: "#FCD436",
                foreground: "#12122A",
              },
            },
          },
          dark: {
            colors: {
              foreground: "#FFF",
              background: "#000",
              content1: "#1A1A1A",
              primary: {
                DEFAULT: "#FCD436",
                foreground: "#12122A",
              },
            },
          },
        },
        defaultTheme: currentTheme,
      },
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    }),
    [currentTheme],
  );

  return <WalletConnectProvider config={globalConfig}>{children}</WalletConnectProvider>;
}

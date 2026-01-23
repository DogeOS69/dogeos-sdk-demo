"use client";

import type { WalletConnectKitConfig } from "@dogeos/dogeos-sdk";
import { WalletConnectProvider } from "@dogeos/dogeos-sdk";
import React, { useEffect, useMemo, useState } from "react";
import { mainnet } from "viem/chains";

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
      chains: {
        evm: [mainnet],
      },
      login: {
        basicLogins: ["email", "externalWallets"],
        socialLogins: [{ type: "google" }, { type: "x" }],
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
      walletConnectProjectId: "44cb8a6aedbe379ba8f2fa4fbc1a461f",
    }),
    [currentTheme],
  );

  return <WalletConnectProvider config={globalConfig}>{children}</WalletConnectProvider>;
}

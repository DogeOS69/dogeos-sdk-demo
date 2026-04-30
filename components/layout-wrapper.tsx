"use client";

import React from "react";
import { GlobalWalletProvider } from "./global-wallet-provider";

export function LayoutWrapper({ children, content }: { children?: React.ReactNode; content?: React.ReactNode }) {
  return <GlobalWalletProvider>{content ?? children ?? null}</GlobalWalletProvider>;
}

"use client";

import React from "react";
import { GlobalWalletProvider } from "./global-wallet-provider";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <GlobalWalletProvider>{children}</GlobalWalletProvider>;
}

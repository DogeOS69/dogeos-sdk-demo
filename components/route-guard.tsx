"use client";

import { useWalletConnect } from "@dogeos/dogeos-sdk";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const REDIRECT_KEY = "nextra-auth-redirect";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWalletConnect();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isConnected && pathname !== "/") {
      sessionStorage.setItem(REDIRECT_KEY, pathname);
      router.replace("/");
    }
  }, [isConnected, pathname, router]);

  return <>{children}</>;
}

export function getRedirectRoute(): string | null {
  if (typeof window === "undefined") return null;
  const route = sessionStorage.getItem(REDIRECT_KEY);
  if (route) {
    sessionStorage.removeItem(REDIRECT_KEY);
  }
  return route;
}

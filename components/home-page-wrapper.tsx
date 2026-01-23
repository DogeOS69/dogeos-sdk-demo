"use client";

import React from "react";
import dynamic from "next/dynamic";
import { TomoUIProvider } from "@tomo-inc/tomo-ui";

const HomePage = dynamic(() => import("./home-page").then((mod) => ({ default: mod.HomePage })), {
  ssr: false,
});

export function HomePageWrapper() {
  return (
    <TomoUIProvider>
      <HomePage />
    </TomoUIProvider>
  );
}

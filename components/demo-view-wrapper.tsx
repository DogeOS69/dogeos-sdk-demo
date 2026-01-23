"use client";

import { TomoUIProvider } from "@tomo-inc/tomo-ui";
import dynamic from "next/dynamic";
import React from "react";
import { ThemeSync } from "./theme-sync";

const DemoViewWrapperInner = dynamic(
  () => import("./demo-view-wrapper-inner").then((mod) => ({ default: mod.DemoViewWrapperInner })),
  {
    ssr: false,
  },
);

export function DemoViewWrapper() {
  return (
    <TomoUIProvider>
      <ThemeSync />
      <DemoViewWrapperInner />
    </TomoUIProvider>
  );
}

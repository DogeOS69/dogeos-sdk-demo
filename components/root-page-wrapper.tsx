"use client";

import React from "react";
import dynamic from "next/dynamic";

const DemoViewWrapper = dynamic(() => import("./demo-view-wrapper").then((mod) => ({ default: mod.DemoViewWrapper })), {
  ssr: false,
});

export function RootPageWrapper() {
  return <DemoViewWrapper />;
}

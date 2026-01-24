"use client";

import React from "react";
import dynamic from "next/dynamic";

const DemoView = dynamic(() => import("./demo-view").then((mod) => ({ default: mod.DemoView })), {
  ssr: false,
});

export function DemoViewWrapperInner() {
  return <DemoView />;
}

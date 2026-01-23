"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navbar } from "nextra-theme-docs";
import { Image } from "nextra/components";

const NavbarActions = dynamic(() => import("./navbar-actions").then((mod) => ({ default: mod.NavbarActions })), {
  ssr: false,
});

export function NavbarWithActions() {
  return (
    <Navbar
      logo={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Image src="/imgs/dogeos.svg" alt="" width={32} height={32} />
          <b>DogeOS SDK</b>
        </div>
      }
    >
      <NavbarActions />
    </Navbar>
  );
}

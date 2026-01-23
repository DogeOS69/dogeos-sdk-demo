"use client";

import dynamic from "next/dynamic";
import { Layout } from "nextra-theme-docs";
import React from "react";
import { AppFooter } from "./footer";

const LayoutWrapper = dynamic(() => import("./layout-wrapper").then((mod) => ({ default: mod.LayoutWrapper })), {
  ssr: false,
});

const NavbarWithActions = dynamic(
  () => import("./navbar-with-actions").then((mod) => ({ default: mod.NavbarWithActions })),
  {
    ssr: false,
  },
);

const RouteGuard = dynamic(() => import("./route-guard").then((mod) => ({ default: mod.RouteGuard })), {
  ssr: false,
});

interface ClientLayoutProps {
  pageMap: any;
  children: React.ReactNode;
}

export function ClientLayout({ pageMap, children }: ClientLayoutProps) {
  const footer = <AppFooter />;

  return (
    <LayoutWrapper>
      <RouteGuard>
        <Layout
          navbar={<NavbarWithActions />}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/tomo-inc/tomo-wallet/tree/main/packages/wallet-connect-kit#readme"
          footer={footer}
          sidebar={{ autoCollapse: true }}
          darkMode={true}
          search={null}
          nextThemes={{
            attribute: "class",
            defaultTheme: "system",
            disableTransitionOnChange: false,
          }}
        >
          {children}
        </Layout>
      </RouteGuard>
    </LayoutWrapper>
  );
}

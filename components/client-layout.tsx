"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Layout } from "nextra-theme-docs";
import React from "react";
import { AppFooter } from "./footer";
import { NavbarWithActions } from "./navbar-with-actions";

const LayoutWrapper = dynamic(() => import("./layout-wrapper").then((mod) => ({ default: mod.LayoutWrapper })), {
  ssr: false,
});

const RouteGuard = dynamic(() => import("./route-guard").then((mod) => ({ default: mod.RouteGuard })), {
  ssr: false,
});

interface ClientLayoutProps {
  pageMap: any;
  children?: React.ReactNode;
  content?: React.ReactNode;
}

export function ClientLayout({ pageMap, children, content }: ClientLayoutProps) {
  const pathname = usePathname();
  const footer = <AppFooter />;
  const layoutContent = content ?? children ?? null;

  if (pathname === "/") {
    return <>{layoutContent}</>;
  }

  const page = (
    <RouteGuard
      content={
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
          {layoutContent}
        </Layout>
      }
    />
  );

  return <LayoutWrapper content={page} />;
}

import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import React from "react";
import { DocPageWithTabs } from "./components/doc-page-with-tabs";
import { Tabs } from "./components/tabs";
import { MarkdownRenderer } from "./components/markdown-renderer";
import { SignMessagePreview } from "./components/sign-message-preview";

const themeComponents = getThemeComponents();

export function useMDXComponents(components: Record<string, React.ComponentType>) {
  return {
    ...themeComponents,
    ...components,
    DocPageWithTabs,
    Tabs,
    MarkdownRenderer,
    SignMessagePreview,
  };
}

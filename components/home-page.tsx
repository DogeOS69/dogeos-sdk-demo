"use client";

import { WalletConnectEmbed } from "@dogeos/dogeos-sdk";
import { Button } from "@tomo-inc/tomo-ui";
import React, { useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";
import { SdkTests } from "./sdk-tests";

// 图标组件 - 使用 CDN 资源
const Ethereum = ({ className }: { className?: string }) => (
  <img
    src="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
    alt="Ethereum"
    className={className}
  />
);

const Doge = ({ className }: { className?: string }) => (
  <img
    src="https://assets.coingecko.com/coins/images/5/small/dogecoin.png"
    alt="Dogecoin"
    className={className}
  />
);
import { Tabs } from "./tabs";

type BasicLoginType = "email" | "externalWallets";
type SocialLoginType = "google" | "x";

const recommonedChains = {
  dogecoin: [
    {
      name: "Dogecoin",
    },
  ],
};

interface ConfigPanelProps {
  enableEmail: boolean;
  setEnableEmail: (value: boolean) => void;
  enableExternalWallets: boolean;
  setEnableExternalWallets: (value: boolean) => void;
  enableGoogle: boolean;
  setEnableGoogle: (value: boolean) => void;
  enableX: boolean;
  setEnableX: (value: boolean) => void;
  primaryColor: string;
  setPrimaryColor: (value: string) => void;
  primaryTextColor: string;
  setPrimaryTextColor: (value: string) => void;
  enableEvm: boolean;
  setEnableEvm: (value: boolean) => void;
  enableDogecoin: boolean;
  setEnableDogecoin: (value: boolean) => void;
}

type ExpandedSection = "design" | "basic" | "social" | "networks" | null;

function ConfigPanel({
  enableEmail,
  setEnableEmail,
  enableExternalWallets,
  setEnableExternalWallets,
  enableGoogle,
  setEnableGoogle,
  enableX,
  setEnableX,
  primaryColor,
  setPrimaryColor,
  primaryTextColor,
  setPrimaryTextColor,
  enableEvm,
  setEnableEvm,
  enableDogecoin,
  setEnableDogecoin,
}: ConfigPanelProps) {
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>("design");

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-80 bg-background border-r border-content2 flex flex-col overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Customize your Login Screens</h2>
        <p className="text-sm text-foreground/70 mb-6">
          {`Personalize your login screens to reflect your brand's identity. Check our docs for more customization
          options.`}
        </p>

        {/* Design */}
        <div className="mb-4">
          <Button
            onPress={() => toggleSection("design")}
            variant="light"
            className="flex items-center justify-between w-full py-3 text-left font-medium cursor-pointer"
            fullWidth
          >
            <span>Design</span>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === "design" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>

          {expandedSection === "design" && (
            <div className="space-y-4 mt-2">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-semibold mb-2">Primary Color</label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-content2 rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="#0346ff"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg p-1 cursor-pointer border border-content2"
                    />
                  </div>
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  Applies to primary elements like buttons, text links, tabs, focus, spinners, nav tabs
                </p>
              </div>

              {/* Primary Text Color */}
              <div>
                <label className="block text-sm font-semibold mb-2">Primary Text Color</label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={primaryTextColor}
                    onChange={(e) => setPrimaryTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-content2 rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="#ffffff"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryTextColor}
                      onChange={(e) => setPrimaryTextColor(e.target.value)}
                      className="w-10 h-10 rounded-lg p-1 cursor-pointer border border-content2"
                    />
                  </div>
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  Applies to text elements set against the primary color background
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Basic Logins */}
        <div className="mb-4 border-t border-content2 pt-4">
          <Button
            onPress={() => toggleSection("basic")}
            variant="light"
            className="flex items-center justify-between w-full py-3 text-left font-medium cursor-pointer"
            fullWidth
          >
            <span>Basic Logins</span>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === "basic" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>

          {expandedSection === "basic" && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Email Passwordless</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableEmail}
                    onChange={(e) => setEnableEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-content2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-content2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span className="text-sm">External Wallets</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableExternalWallets}
                    onChange={(e) => setEnableExternalWallets(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-content2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-content2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Social Logins */}
        <div className="mb-4 border-t border-content2 pt-4">
          <Button
            onPress={() => toggleSection("social")}
            variant="light"
            className="flex items-center justify-between w-full py-3 text-left font-medium cursor-pointer"
            fullWidth
          >
            <span>Social Logins</span>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === "social" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>

          {expandedSection === "social" && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  <span className="text-sm">Google</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGoogle}
                    onChange={(e) => setEnableGoogle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-content2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-content2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-sm">X (Twitter)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableX}
                    onChange={(e) => setEnableX(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-content2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-content2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Networks */}
        <div className="mb-4 border-t border-content2 pt-4">
          <Button
            onPress={() => toggleSection("networks")}
            variant="light"
            className="flex items-center justify-between w-full py-3 text-left font-medium cursor-pointer"
            fullWidth
          >
            <span>Networks</span>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === "networks" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>

          {expandedSection === "networks" && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-full">
                    <Ethereum className="w-full h-full" />
                  </div>
                  <span className="text-sm">EVM</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableEvm}
                    onChange={(e) => setEnableEvm(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-content2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-content2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-full">
                    <Doge className="w-full h-full" />
                  </div>
                  <span className="text-sm">Dogecoin</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDogecoin}
                    onChange={(e) => setEnableDogecoin(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-content2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-content2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface HomePageProps {
  configPanel: React.ReactNode;
  configCode: string;
}

export function HomePage({ configPanel, configCode }: HomePageProps) {
  const [isolatedColors, setIsolatedColors] = useState({
    background: "#FFFFFF",
    foreground: "#000000",
    content2: "#E4E4E7",
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const getThemeFromDOM = (): "light" | "dark" => {
      const html = document.documentElement;
      if (html.classList.contains("dark")) return "dark";
      if (html.classList.contains("light")) return "light";
      const dataTheme = html.getAttribute("data-theme");
      if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
      return "light";
    };

    const updateColors = () => {
      const theme = getThemeFromDOM();
      const isDark = theme === "dark";
      setIsolatedColors({
        background: isDark ? "#000000" : "#FFFFFF",
        foreground: isDark ? "#FFFFFF" : "#000000",
        content2: isDark ? "#27272A" : "#E4E4E7",
      });
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const loginTabItems = [
    {
      key: "preview",
      label: "Preview",
      content: (
        <div className="p-4">
          <div className="flex flex-1 items-center justify-center min-h-[400px]">
            <WalletPreview />
          </div>
        </div>
      ),
    },
    {
      key: "code",
      label: "Code",
      content: (
        <div className="p-4 overflow-auto">
          <MarkdownRenderer content={configCode} />
        </div>
      ),
    },
    {
      key: "tests",
      label: "Tests",
      content: (
        <div className="p-4 overflow-auto">
          <SdkTests />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Right: Login Section (with preview/code tabs) - Takes most space */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div
          className="flex-1 flex flex-col overflow-hidden p-8"
          style={{ backgroundColor: isolatedColors.background }}
        >
          <h2 className="text-2xl font-bold mb-4 flex-shrink-0" style={{ color: isolatedColors.foreground }}>
            Log in or sign up
          </h2>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs items={loginTabItems} />
          </div>
        </div>
      </div>

      {/* Left: Config Panel - Takes small portion */}
      <div className="flex-shrink-0 w-80 max-w-sm border-l" style={{ borderColor: isolatedColors.content2 }}>
        {configPanel}
      </div>
    </div>
  );
}

function WalletPreview() {
  return <WalletConnectEmbed className="shadow-lg" />;
}

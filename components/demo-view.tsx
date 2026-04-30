"use client";

import type { Chain, WalletConnectKitConfig } from "@dogeos/dogeos-sdk";
import { ChainTypeEnum, useWalletConnect, WalletConnectProvider } from "@dogeos/dogeos-sdk";
import { Button, useTheme } from "@tomo-inc/tomo-ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { arbitrum, base, bsc, linea, mainnet, optimism, polygon } from "viem/chains";
import { HomePage } from "./home-page";

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

type BasicLoginType = "email" | "externalWallets";
type SocialLoginType = "google" | "x";

const DOGEOS_CLIENT_ID =
  process.env.NEXT_PUBLIC_DOGEOS_CLIENT_ID ??
  "mSzQLiebxpwV64barnRZpCGZTwB38kSiuszi42Cqq41fkRH8KM99dqG4pFNnvaVA4DV7zHsic0or0pd8tlMIt9vc";
const DOGEOS_GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_DOGEOS_GOOGLE_CLIENT_ID ??
  "362812706401-eppkpnqocdaejaf45ics815t22oe0j7l.apps.googleusercontent.com";
const DOGEOS_X_CLIENT_ID =
  process.env.NEXT_PUBLIC_DOGEOS_X_CLIENT_ID ?? "cTQxTUlSZXhwOXF6T2hnTHJVRzI6MTpjaQ";
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "44cb8a6aedbe379ba8f2fa4fbc1a461f";

const recommonedChains = {
  dogecoin: [
    {
      name: "Dogecoin",
    },
  ],
};

export function DemoView() {
  const { theme } = useTheme();
  const [nextTheme, setNextTheme] = useState<string>("light");
  const [hasHydratedConfig, setHasHydratedConfig] = useState(false);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableExternalWallets, setEnableExternalWallets] = useState(true);
  const [enableGoogle, setEnableGoogle] = useState(true);
  const [enableX, setEnableX] = useState(true);
  const [lightPrimaryColor, setLightPrimaryColor] = useState("#FCD436");
  const [darkPrimaryColor, setDarkPrimaryColor] = useState("#FCD436");
  const [lightPrimaryTextColor, setLightPrimaryTextColor] = useState("#12122A");
  const [darkPrimaryTextColor, setDarkPrimaryTextColor] = useState("#12122A");
  const [lightBackgroundColor, setLightBackgroundColor] = useState("#FFF");
  const [lightForegroundColor, setLightForegroundColor] = useState("#000");
  const [darkBackgroundColor, setDarkBackgroundColor] = useState("#000");
  const [darkForegroundColor, setDarkForegroundColor] = useState("#FFF");
  const [enableEvm, setEnableEvm] = useState(true);
  const [enableDogecoin, setEnableDogecoin] = useState(true);

  const handleSetTheme = (newTheme: string) => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(newTheme);
    html.setAttribute("data-theme", newTheme);
    setNextTheme(newTheme);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedConfigRaw = localStorage.getItem("dogeos-sdk-demo-config");
    if (!storedConfigRaw) {
      setHasHydratedConfig(true);
      return;
    }

    try {
      const storedConfig = JSON.parse(storedConfigRaw) as Record<string, unknown>;
      if (typeof storedConfig.enableEmail === "boolean") setEnableEmail(storedConfig.enableEmail);
      if (typeof storedConfig.enableExternalWallets === "boolean") {
        setEnableExternalWallets(storedConfig.enableExternalWallets);
      }
      if (typeof storedConfig.enableGoogle === "boolean") setEnableGoogle(storedConfig.enableGoogle);
      if (typeof storedConfig.enableX === "boolean") setEnableX(storedConfig.enableX);
      const storedLightPrimaryColor =
        typeof storedConfig.lightPrimaryColor === "string"
          ? storedConfig.lightPrimaryColor
          : typeof storedConfig.primaryColor === "string"
            ? storedConfig.primaryColor
            : null;
      if (storedLightPrimaryColor) setLightPrimaryColor(storedLightPrimaryColor);

      const storedDarkPrimaryColor =
        typeof storedConfig.darkPrimaryColor === "string"
          ? storedConfig.darkPrimaryColor
          : typeof storedConfig.primaryColor === "string"
            ? storedConfig.primaryColor
            : null;
      if (storedDarkPrimaryColor) setDarkPrimaryColor(storedDarkPrimaryColor);

      const storedLightPrimaryTextColor =
        typeof storedConfig.lightPrimaryTextColor === "string"
          ? storedConfig.lightPrimaryTextColor
          : typeof storedConfig.primaryTextColor === "string"
            ? storedConfig.primaryTextColor
            : null;
      if (storedLightPrimaryTextColor) setLightPrimaryTextColor(storedLightPrimaryTextColor);

      const storedDarkPrimaryTextColor =
        typeof storedConfig.darkPrimaryTextColor === "string"
          ? storedConfig.darkPrimaryTextColor
          : typeof storedConfig.primaryTextColor === "string"
            ? storedConfig.primaryTextColor
            : null;
      if (storedDarkPrimaryTextColor) setDarkPrimaryTextColor(storedDarkPrimaryTextColor);
      if (typeof storedConfig.lightBackgroundColor === "string") {
        setLightBackgroundColor(storedConfig.lightBackgroundColor);
      }
      if (typeof storedConfig.lightForegroundColor === "string") {
        setLightForegroundColor(storedConfig.lightForegroundColor);
      }
      if (typeof storedConfig.darkBackgroundColor === "string") {
        setDarkBackgroundColor(storedConfig.darkBackgroundColor);
      }
      if (typeof storedConfig.darkForegroundColor === "string") {
        setDarkForegroundColor(storedConfig.darkForegroundColor);
      }
      if (typeof storedConfig.enableEvm === "boolean") setEnableEvm(storedConfig.enableEvm);
      if (typeof storedConfig.enableDogecoin === "boolean") {
        setEnableDogecoin(storedConfig.enableDogecoin);
      }
      if (storedConfig.currentTheme === "light" || storedConfig.currentTheme === "dark") {
        handleSetTheme(storedConfig.currentTheme);
      }
    } catch (error) {
      console.warn("Failed to read stored config:", error);
    } finally {
      setHasHydratedConfig(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getThemeFromDOM = (): string => {
      const html = document.documentElement;
      if (html.classList.contains("dark")) {
        return "dark";
      }
      if (html.classList.contains("light")) {
        return "light";
      }
      const dataTheme = html.getAttribute("data-theme");
      if (dataTheme === "dark" || dataTheme === "light") {
        return dataTheme;
      }
      return "light";
    };

    const initialTheme = getThemeFromDOM();
    setNextTheme(initialTheme);

    const observer = new MutationObserver(() => {
      const currentTheme = getThemeFromDOM();
      setNextTheme(currentTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedConfig) return;
    const storedConfig = {
      enableEmail,
      enableExternalWallets,
      enableGoogle,
      enableX,
      lightPrimaryColor,
      darkPrimaryColor,
      lightPrimaryTextColor,
      darkPrimaryTextColor,
      lightBackgroundColor,
      lightForegroundColor,
      darkBackgroundColor,
      darkForegroundColor,
      enableEvm,
      enableDogecoin,
      currentTheme: nextTheme,
    };
    localStorage.setItem("dogeos-sdk-demo-config", JSON.stringify(storedConfig));
  }, [
    hasHydratedConfig,
    enableEmail,
    enableExternalWallets,
    enableGoogle,
    enableX,
    lightPrimaryColor,
    darkPrimaryColor,
    lightPrimaryTextColor,
    darkPrimaryTextColor,
    lightBackgroundColor,
    lightForegroundColor,
    darkBackgroundColor,
    darkForegroundColor,
    enableEvm,
    enableDogecoin,
    nextTheme,
  ]);

  const config = useMemo((): WalletConnectKitConfig => {
    const basicLogins: BasicLoginType[] = [];
    if (enableEmail) basicLogins.push("email");
    if (enableExternalWallets) basicLogins.push("externalWallets");

    const socialLogins: Array<{ type: SocialLoginType; clientId?: string }> = [];
    if (enableGoogle) socialLogins.push({ type: "google", clientId: DOGEOS_GOOGLE_CLIENT_ID });
    if (enableX) socialLogins.push({ type: "x", clientId: DOGEOS_X_CLIENT_ID });

    const chains: WalletConnectKitConfig["chains"] = {};
    if (enableEvm) {
      chains.evm = [
        mainnet,
        bsc,
        optimism,
        arbitrum,
        linea,
        base,
        polygon,
      ] as unknown as Chain[];
    }
    if (enableDogecoin) {
      (chains as Record<string, unknown>).dogecoin = recommonedChains.dogecoin;
    }

    return {
      clientId: DOGEOS_CLIENT_ID,
      chains,
      login: {
        basicLogins,
        socialLogins,
      },
      theme: {
        prefix: "heroui",
        themes: {
          light: {
            colors: {
              foreground: lightForegroundColor,
              background: lightBackgroundColor,
              content1: "#FCFCFD",
              primary: {
                DEFAULT: lightPrimaryColor,
                foreground: lightPrimaryTextColor,
                50: "#F8F7F7",
                100: "#F2EDF0",
                200: "#E8D9E0",
                300: "#DDB0C7",
                400: "#DE7CAD",
                500: lightPrimaryColor,
                600: "#FF0A85",
                700: "#D6006B",
                800: "#A30052",
                900: "#700038",
              },
            },
          },
          dark: {
            colors: {
              foreground: darkForegroundColor,
              background: darkBackgroundColor,
              content1: "#1A1A1A",
              primary: {
                DEFAULT: darkPrimaryColor,
                foreground: darkPrimaryTextColor,
                50: "#700038",
                100: "#A30052",
                200: "#D6006B",
                300: "#FF0A85",
                400: darkPrimaryColor,
                500: darkPrimaryColor,
                600: "#FF0A85",
                700: "#D6006B",
                800: "#A30052",
                900: "#700038",
              },
            },
          },
        },
        defaultTheme: theme === "dark" ? ("dark" as const) : ("light" as const),
      },
      defaultConnectChain: ChainTypeEnum.EVM,
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    };
  }, [
    theme,
    enableEmail,
    enableExternalWallets,
    enableGoogle,
    enableX,
    lightPrimaryColor,
    darkPrimaryColor,
    lightPrimaryTextColor,
    darkPrimaryTextColor,
    lightBackgroundColor,
    lightForegroundColor,
    darkBackgroundColor,
    darkForegroundColor,
    enableEvm,
    enableDogecoin,
  ]);

  const configCodeMarkdown = useMemo(() => {
    const basicLogins: BasicLoginType[] = [];
    if (enableEmail) basicLogins.push("email");
    if (enableExternalWallets) basicLogins.push("externalWallets");

    const socialLogins: Array<{ type: SocialLoginType; clientId: string }> = [];
    if (enableGoogle) socialLogins.push({ type: "google", clientId: "YOUR_GOOGLE_CLIENT_ID" });
    if (enableX) socialLogins.push({ type: "x", clientId: "YOUR_X_CLIENT_ID" });

    const chainsConfig: Record<string, unknown> = {};
    if (enableEvm) {
      chainsConfig.evm = [mainnet, bsc, optimism, arbitrum, linea, base, polygon].map((chain) => ({
        id: chain.id,
        name: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: chain.rpcUrls,
      }));
    }
    if (enableDogecoin) {
      chainsConfig.dogecoin = recommonedChains.dogecoin;
    }

    const configObject: Record<string, unknown> = {
      login: {
        basicLogins,
        socialLogins,
      },
      theme: {
        prefix: "heroui",
        themes: {
          light: {
            colors: {
              foreground: lightForegroundColor,
              background: lightBackgroundColor,
              content1: "#FCFCFD",
              primary: {
                DEFAULT: lightPrimaryColor,
                foreground: lightPrimaryTextColor,
                50: "#F8F7F7",
                100: "#F2EDF0",
                200: "#E8D9E0",
                300: "#DDB0C7",
                400: "#DE7CAD",
                500: lightPrimaryColor,
                600: "#FF0A85",
                700: "#D6006B",
                800: "#A30052",
                900: "#700038",
              },
            },
          },
          dark: {
            colors: {
              foreground: darkForegroundColor,
              background: darkBackgroundColor,
              content1: "#1A1A1A",
              primary: {
                DEFAULT: darkPrimaryColor,
                foreground: darkPrimaryTextColor,
                50: "#700038",
                100: "#A30052",
                200: "#D6006B",
                300: "#FF0A85",
                400: darkPrimaryColor,
                500: darkPrimaryColor,
                600: "#FF0A85",
                700: "#D6006B",
                800: "#A30052",
                900: "#700038",
              },
            },
          },
        },
      },
      walletConnectProjectId: "YOUR_WALLETCONNECT_PROJECT_ID",
      clientId: "YOUR_DOGEOS_CLIENT_ID",
      metadata: {
        name: "Wallet Connect Demo",
        description: "Wallet Connect Demo",
        url: "https://www.mydoge.com",
        icons: ["/imgs/dogeos.svg"],
        terms: "https://www.mydoge.com/terms",
        privacyPolicy: "https://www.mydoge.com/privacy",
      },
    };

    if (Object.keys(chainsConfig).length > 0) {
      configObject.chains = chainsConfig;
    }

    const jsonString = JSON.stringify(configObject, null, 2);

    return `# Configuration JSON

The DogeOS SDK can be configured with a JSON object. Here's the complete configuration structure:

\`\`\`json
${jsonString}
\`\`\`

## Configuration Options

### login
- **basicLogins**: Array of basic login methods (\`"email"\`, \`"externalWallets"\`)
- **socialLogins**: Array of social login providers with provider client IDs

### theme
- **prefix**: CSS prefix for theme classes (default: \`"heroui"\`)
- **themes**: Theme configuration object with \`light\` and \`dark\` variants
  - **colors**: Color palette configuration
    - **foreground**: Text color
    - **background**: Background color
    - **content1**: Content background color
    - **primary**: Primary color palette with shades (50-900) and foreground

### chains
Network chains configuration (EVM, Dogecoin)

### clientId
Your SDK client ID (required)

### walletConnectProjectId
Your WalletConnect project ID (required)

### metadata
App metadata for WalletConnect
- **name**: App name
- **description**: App description
- **url**: App URL
- **icons**: Array of icon URLs
- **terms**: Terms of service URL
- **privacyPolicy**: Privacy policy URL
`;
  }, [
    enableEmail,
    enableExternalWallets,
    enableGoogle,
    enableX,
    lightPrimaryColor,
    darkPrimaryColor,
    lightPrimaryTextColor,
    darkPrimaryTextColor,
    lightBackgroundColor,
    lightForegroundColor,
    darkBackgroundColor,
    darkForegroundColor,
    enableEvm,
    enableDogecoin,
  ]);

  return (
    <WalletConnectProvider config={config}>
      <LoginRedirectHandler />
      <div className="h-screen flex flex-col overflow-hidden relative">
        {/* <Header /> */}

        {/* Body - Takes remaining space */}
        <div className="flex-1 flex overflow-hidden relative">
          <WalletDemo
            enableEmail={enableEmail}
            enableExternalWallets={enableExternalWallets}
            enableGoogle={enableGoogle}
            enableX={enableX}
            setEnableEmail={setEnableEmail}
            setEnableExternalWallets={setEnableExternalWallets}
            setEnableGoogle={setEnableGoogle}
            setEnableX={setEnableX}
            lightPrimaryColor={lightPrimaryColor}
            setLightPrimaryColor={setLightPrimaryColor}
            darkPrimaryColor={darkPrimaryColor}
            setDarkPrimaryColor={setDarkPrimaryColor}
            lightPrimaryTextColor={lightPrimaryTextColor}
            setLightPrimaryTextColor={setLightPrimaryTextColor}
            darkPrimaryTextColor={darkPrimaryTextColor}
            setDarkPrimaryTextColor={setDarkPrimaryTextColor}
            lightBackgroundColor={lightBackgroundColor}
            setLightBackgroundColor={setLightBackgroundColor}
            lightForegroundColor={lightForegroundColor}
            setLightForegroundColor={setLightForegroundColor}
            darkBackgroundColor={darkBackgroundColor}
            setDarkBackgroundColor={setDarkBackgroundColor}
            darkForegroundColor={darkForegroundColor}
            setDarkForegroundColor={setDarkForegroundColor}
            currentTheme={nextTheme || "light"}
            setTheme={handleSetTheme}
            enableEvm={enableEvm}
            setEnableEvm={setEnableEvm}
            enableDogecoin={enableDogecoin}
            setEnableDogecoin={setEnableDogecoin}
            configCode={configCodeMarkdown}
          />
        </div>
      </div>
    </WalletConnectProvider>
  );
}

function LoginRedirectHandler() {
  const { isConnected } = useWalletConnect();
  const router = useRouter();

  // useEffect(() => {
  //   if (typeof window === "undefined" || !isConnected) return;

  //   const redirectRoute = sessionStorage.getItem("nextra-auth-redirect");

  //   if (redirectRoute) {
  //     sessionStorage.removeItem("nextra-auth-redirect");
  //     router.push(redirectRoute);
  //   } else {
  //     router.push("/introduction");
  //   }
  // }, [isConnected, router]);

  return null;
}

interface WalletDemoProps {
  enableEmail: boolean;
  enableExternalWallets: boolean;
  enableGoogle: boolean;
  enableX: boolean;
  setEnableEmail: (value: boolean) => void;
  setEnableExternalWallets: (value: boolean) => void;
  setEnableGoogle: (value: boolean) => void;
  setEnableX: (value: boolean) => void;
  lightPrimaryColor: string;
  setLightPrimaryColor: (value: string) => void;
  darkPrimaryColor: string;
  setDarkPrimaryColor: (value: string) => void;
  lightPrimaryTextColor: string;
  setLightPrimaryTextColor: (value: string) => void;
  darkPrimaryTextColor: string;
  setDarkPrimaryTextColor: (value: string) => void;
  lightBackgroundColor: string;
  setLightBackgroundColor: (value: string) => void;
  lightForegroundColor: string;
  setLightForegroundColor: (value: string) => void;
  darkBackgroundColor: string;
  setDarkBackgroundColor: (value: string) => void;
  darkForegroundColor: string;
  setDarkForegroundColor: (value: string) => void;
  currentTheme: string | undefined;
  setTheme: (theme: string) => void;
  enableEvm: boolean;
  setEnableEvm: (value: boolean) => void;
  enableDogecoin: boolean;
  setEnableDogecoin: (value: boolean) => void;
  configCode: string;
}

function WalletDemo({
  enableEmail,
  enableExternalWallets,
  enableGoogle,
  enableX,
  setEnableEmail,
  setEnableExternalWallets,
  setEnableGoogle,
  setEnableX,
  lightPrimaryColor,
  setLightPrimaryColor,
  darkPrimaryColor,
  setDarkPrimaryColor,
  lightPrimaryTextColor,
  setLightPrimaryTextColor,
  darkPrimaryTextColor,
  setDarkPrimaryTextColor,
  lightBackgroundColor,
  setLightBackgroundColor,
  lightForegroundColor,
  setLightForegroundColor,
  darkBackgroundColor,
  setDarkBackgroundColor,
  darkForegroundColor,
  setDarkForegroundColor,
  currentTheme,
  setTheme,
  enableEvm,
  setEnableEvm,
  enableDogecoin,
  setEnableDogecoin,
  configCode,
}: WalletDemoProps) {
  const configPanel = (
    <ConfigPanel
      enableEmail={enableEmail}
      setEnableEmail={setEnableEmail}
      enableExternalWallets={enableExternalWallets}
      setEnableExternalWallets={setEnableExternalWallets}
      enableGoogle={enableGoogle}
      setEnableGoogle={setEnableGoogle}
      enableX={enableX}
      setEnableX={setEnableX}
      lightPrimaryColor={lightPrimaryColor}
      setLightPrimaryColor={setLightPrimaryColor}
      darkPrimaryColor={darkPrimaryColor}
      setDarkPrimaryColor={setDarkPrimaryColor}
      lightPrimaryTextColor={lightPrimaryTextColor}
      setLightPrimaryTextColor={setLightPrimaryTextColor}
      darkPrimaryTextColor={darkPrimaryTextColor}
      setDarkPrimaryTextColor={setDarkPrimaryTextColor}
      lightBackgroundColor={lightBackgroundColor}
      setLightBackgroundColor={setLightBackgroundColor}
      lightForegroundColor={lightForegroundColor}
      setLightForegroundColor={setLightForegroundColor}
      darkBackgroundColor={darkBackgroundColor}
      setDarkBackgroundColor={setDarkBackgroundColor}
      darkForegroundColor={darkForegroundColor}
      setDarkForegroundColor={setDarkForegroundColor}
      currentTheme={currentTheme}
      setTheme={setTheme}
      enableEvm={enableEvm}
      setEnableEvm={setEnableEvm}
      enableDogecoin={enableDogecoin}
      setEnableDogecoin={setEnableDogecoin}
    />
  );

  return <HomePage configPanel={configPanel} configCode={configCode} />;
}

interface ConfigPanelProps {
  enableEmail: boolean;
  setEnableEmail: (value: boolean) => void;
  enableExternalWallets: boolean;
  setEnableExternalWallets: (value: boolean) => void;
  enableGoogle: boolean;
  setEnableGoogle: (value: boolean) => void;
  enableX: boolean;
  setEnableX: (value: boolean) => void;
  lightPrimaryColor: string;
  setLightPrimaryColor: (value: string) => void;
  darkPrimaryColor: string;
  setDarkPrimaryColor: (value: string) => void;
  lightPrimaryTextColor: string;
  setLightPrimaryTextColor: (value: string) => void;
  darkPrimaryTextColor: string;
  setDarkPrimaryTextColor: (value: string) => void;
  lightBackgroundColor: string;
  setLightBackgroundColor: (value: string) => void;
  lightForegroundColor: string;
  setLightForegroundColor: (value: string) => void;
  darkBackgroundColor: string;
  setDarkBackgroundColor: (value: string) => void;
  darkForegroundColor: string;
  setDarkForegroundColor: (value: string) => void;
  currentTheme: string | undefined;
  setTheme: (theme: string) => void;
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
  lightPrimaryColor,
  setLightPrimaryColor,
  darkPrimaryColor,
  setDarkPrimaryColor,
  lightPrimaryTextColor,
  setLightPrimaryTextColor,
  darkPrimaryTextColor,
  setDarkPrimaryTextColor,
  lightBackgroundColor,
  setLightBackgroundColor,
  lightForegroundColor,
  setLightForegroundColor,
  darkBackgroundColor,
  setDarkBackgroundColor,
  darkForegroundColor,
  setDarkForegroundColor,
  currentTheme,
  setTheme,
  enableEvm,
  setEnableEvm,
  enableDogecoin,
  setEnableDogecoin,
}: ConfigPanelProps) {
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>("design");

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Get current theme to determine isolated colors
  const isDark = currentTheme === "dark";
  const isolatedBackground = isDark ? "#000000" : "#FFFFFF";
  const isolatedForeground = isDark ? "#FFFFFF" : "#000000";
  const isolatedForegroundMuted = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const isolatedForegroundSubtle = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)";
  const isolatedContent2 = isDark ? "#27272A" : "#E4E4E7";
  const activePrimaryColor = isDark ? darkPrimaryColor : lightPrimaryColor;
  const activePrimaryTextColor = isDark ? darkPrimaryTextColor : lightPrimaryTextColor;
  const lightButtonTextColor = currentTheme === "light" ? lightPrimaryTextColor : isolatedForeground;
  const darkButtonTextColor = currentTheme === "dark" ? darkPrimaryTextColor : isolatedForeground;

  return (
    <div
      className="w-full h-full min-h-full flex flex-col overflow-y-auto"
      style={{
        backgroundColor: isolatedBackground,
        color: isolatedForeground,
      }}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2" style={{ color: isolatedForeground }}>
          Customize your Login Screens
        </h2>
        <p className="text-sm mb-6" style={{ color: isolatedForegroundMuted }}>
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
              {/* Theme Mode Toggle */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: isolatedForeground }}>
                  Theme Mode
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    onPress={() => setTheme("light")}
                    color={currentTheme === "light" ? "primary" : "default"}
                    variant={currentTheme === "light" ? "solid" : "bordered"}
                    size="sm"
                    className="flex-1"
                    style={{
                      color: lightButtonTextColor,
                    }}
                  >
                    Light
                  </Button>
                  <Button
                    onPress={() => setTheme("dark")}
                    color={currentTheme === "dark" ? "primary" : "default"}
                    variant={currentTheme === "dark" ? "solid" : "bordered"}
                    size="sm"
                    className="flex-1"
                    style={{
                      color: darkButtonTextColor,
                    }}
                  >
                    Dark
                  </Button>
                </div>
                <p className="text-xs mt-1" style={{ color: isolatedForegroundSubtle }}>
                  Switch between light and dark mode for the entire project
                </p>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: isolatedForeground }}>
                  Primary Color
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={activePrimaryColor}
                    onChange={(e) => {
                      if (isDark) {
                        setDarkPrimaryColor(e.target.value);
                      } else {
                        setLightPrimaryColor(e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{
                      backgroundColor: isolatedBackground,
                      color: isolatedForeground,
                      borderColor: isolatedContent2,
                    }}
                    placeholder="#0346ff"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={activePrimaryColor}
                      onChange={(e) => {
                        if (isDark) {
                          setDarkPrimaryColor(e.target.value);
                        } else {
                          setLightPrimaryColor(e.target.value);
                        }
                      }}
                      className="w-10 h-10 rounded-lg p-1 cursor-pointer border"
                      style={{ borderColor: isolatedContent2 }}
                    />
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: isolatedForegroundSubtle }}>
                  Applies to primary elements like buttons, text links, tabs, focus, spinners, nav tabs
                </p>
              </div>

              {/* Primary Text Color */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: isolatedForeground }}>
                  Primary Text Color
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={activePrimaryTextColor}
                    onChange={(e) => {
                      if (isDark) {
                        setDarkPrimaryTextColor(e.target.value);
                      } else {
                        setLightPrimaryTextColor(e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{
                      backgroundColor: isolatedBackground,
                      color: isolatedForeground,
                      borderColor: isolatedContent2,
                    }}
                    placeholder="#ffffff"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={activePrimaryTextColor}
                      onChange={(e) => {
                        if (isDark) {
                          setDarkPrimaryTextColor(e.target.value);
                        } else {
                          setLightPrimaryTextColor(e.target.value);
                        }
                      }}
                      className="w-10 h-10 rounded-lg p-1 cursor-pointer border"
                      style={{ borderColor: isolatedContent2 }}
                    />
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: isolatedForegroundSubtle }}>
                  Applies to text elements set against the primary color background
                </p>
              </div>

              {/* Background Color - Dynamic based on theme mode */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: isolatedForeground }}>
                  Background ({currentTheme === "light" ? "Light Mode" : "Dark Mode"})
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={currentTheme === "light" ? lightBackgroundColor : darkBackgroundColor}
                    onChange={(e) => {
                      if (currentTheme === "light") {
                        setLightBackgroundColor(e.target.value);
                      } else {
                        setDarkBackgroundColor(e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{
                      backgroundColor: isolatedBackground,
                      color: isolatedForeground,
                      borderColor: isolatedContent2,
                    }}
                    placeholder={currentTheme === "light" ? "#FFF" : "#000"}
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={currentTheme === "light" ? lightBackgroundColor : darkBackgroundColor}
                      onChange={(e) => {
                        if (currentTheme === "light") {
                          setLightBackgroundColor(e.target.value);
                        } else {
                          setDarkBackgroundColor(e.target.value);
                        }
                      }}
                      className="w-10 h-10 rounded-lg p-1 cursor-pointer border"
                      style={{ borderColor: isolatedContent2 }}
                    />
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: isolatedForegroundSubtle }}>
                  Background color for {currentTheme === "light" ? "light" : "dark"} mode (only affects
                  @dogeos/dogeos-sdk provider)
                </p>
              </div>

              {/* Foreground Color - Dynamic based on theme mode */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: isolatedForeground }}>
                  Foreground ({currentTheme === "light" ? "Light Mode" : "Dark Mode"})
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={currentTheme === "light" ? lightForegroundColor : darkForegroundColor}
                    onChange={(e) => {
                      if (currentTheme === "light") {
                        setLightForegroundColor(e.target.value);
                      } else {
                        setDarkForegroundColor(e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{
                      backgroundColor: isolatedBackground,
                      color: isolatedForeground,
                      borderColor: isolatedContent2,
                    }}
                    placeholder={currentTheme === "light" ? "#000" : "#FFF"}
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={currentTheme === "light" ? lightForegroundColor : darkForegroundColor}
                      onChange={(e) => {
                        if (currentTheme === "light") {
                          setLightForegroundColor(e.target.value);
                        } else {
                          setDarkForegroundColor(e.target.value);
                        }
                      }}
                      className="w-10 h-10 rounded-lg p-1 cursor-pointer border"
                      style={{ borderColor: isolatedContent2 }}
                    />
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: isolatedForegroundSubtle }}>
                  Foreground color for {currentTheme === "light" ? "light" : "dark"} mode (only affects
                  @dogeos/dogeos-sdk provider)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Basic Logins */}
        <div className="mb-4 border-t pt-4" style={{ borderColor: isolatedContent2 }}>
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
                  <span className="text-sm" style={{ color: isolatedForeground }}>
                    Email Passwordless
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableEmail}
                    onChange={(e) => setEnableEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"
                    style={{
                      backgroundColor: isolatedContent2,
                    }}
                  ></div>
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
                  <span className="text-sm" style={{ color: isolatedForeground }}>
                    External Wallets
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableExternalWallets}
                    onChange={(e) => setEnableExternalWallets(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"
                    style={{
                      backgroundColor: isolatedContent2,
                    }}
                  ></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Social Logins */}
        <div className="mb-4 border-t pt-4" style={{ borderColor: isolatedContent2 }}>
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
                  <span className="text-sm" style={{ color: isolatedForeground }}>
                    Google
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGoogle}
                    onChange={(e) => setEnableGoogle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"
                    style={{
                      backgroundColor: isolatedContent2,
                    }}
                  ></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-sm" style={{ color: isolatedForeground }}>
                    X (Twitter)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableX}
                    onChange={(e) => setEnableX(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"
                    style={{
                      backgroundColor: isolatedContent2,
                    }}
                  ></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Networks */}
        <div className="mb-4 border-t pt-4" style={{ borderColor: isolatedContent2 }}>
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
                  <span className="text-sm" style={{ color: isolatedForeground }}>
                    EVM
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableEvm}
                    onChange={(e) => setEnableEvm(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"
                    style={{
                      backgroundColor: isolatedContent2,
                    }}
                  ></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-full">
                    <Doge className="w-full h-full" />
                  </div>
                  <span className="text-sm" style={{ color: isolatedForeground }}>
                    Dogecoin
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDogecoin}
                    onChange={(e) => setEnableDogecoin(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"
                    style={{
                      backgroundColor: isolatedContent2,
                    }}
                  ></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

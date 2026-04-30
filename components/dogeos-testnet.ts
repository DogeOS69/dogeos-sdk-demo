import type { Chain } from "@dogeos/dogeos-sdk";

export const DOGEOS_DEMO_ICON_URL =
  "https://raw.githubusercontent.com/DogeOS69/dogeos-sdk-demo/main/public/imgs/dogeos.svg";

export const getDogeOSDemoMetadata = () => ({
  name: "DogeOS SDK Demo",
  description: "DogeOS SDK demo",
  url: typeof window === "undefined" ? "https://github.com/DogeOS69/dogeos-sdk-demo" : window.location.origin,
  icons: [DOGEOS_DEMO_ICON_URL],
});

export const dogeOSTestnet = {
  id: 6281971,
  name: "DogeOS Chikyū Testnet",
  nativeCurrency: {
    name: "DOGE",
    symbol: "DOGE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.dogeos.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "DogeOS Chikyū Testnet",
      url: "https://blockscout.testnet.dogeos.com",
    },
  },
  testnet: true,
} as const satisfies Chain;

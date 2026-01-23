import dynamic from "next/dynamic";
import "nextra-theme-docs/style.css";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";

const ClientLayout = dynamic(() =>
  import("../components/client-layout").then((mod) => ({ default: mod.ClientLayout })),
);

export const metadata = {};

export default async function RootLayout({ children }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
        color={{
          hue: 48,
          saturation: 97,
          lightness: {
            light: 60,
            dark: 60,
          },
        }}
        backgroundColor={{
          light: "#FFFFFF",
          dark: "#000000",
        }}
      >
        <link rel="icon" href="/imgs/dogeos.svg" />
      </Head>
      <body>
        <ClientLayout pageMap={pageMap}>{children}</ClientLayout>
      </body>
    </html>
  );
}

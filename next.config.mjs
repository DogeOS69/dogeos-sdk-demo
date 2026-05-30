import nextra from "nextra";
import { createRequire } from "module";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

export default function nextConfig(phase) {
  const withNextra = nextra({
    contentDirBasePath: "/",
    search: false,
  });

  return withNextra({
    transpilePackages: [
      "@tomo-inc/tomo-ui",
      "@dogeos/dogeos-sdk",
      "@tomo-inc/embedded-wallet-providers",
      "@tomo-inc/oidc-auth",
    ],
    typescript: {
      ignoreBuildErrors: true,
    },
    turbopack: {
      root: resolve(__dirname, ".."),
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const createHashPath = require.resolve("create-hash");
        config.resolve.alias["create-hash"] = createHashPath;
        const safeBufferPath = require.resolve("safe-buffer");
        config.resolve.alias["safe-buffer"] = safeBufferPath;
        const tslibPath = require.resolve("tslib");
        config.resolve.alias["tslib"] = tslibPath;
      }

      config.resolve.symlinks = false;

      return config;
    },
  });
}

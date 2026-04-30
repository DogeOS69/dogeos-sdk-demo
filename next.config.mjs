import nextra from "nextra";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

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

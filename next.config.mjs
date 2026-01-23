import nextra from "nextra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      config.resolve.alias = {
        ...config.resolve.alias,
        "@tomo-inc/oidc-auth": path.resolve(__dirname, "../../packages/oidc-auth"),
        "@tomo-inc/embedded-wallet-providers": path.resolve(
          __dirname,
          "../../packages/embedded-wallet-providers"
        ),
      };

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

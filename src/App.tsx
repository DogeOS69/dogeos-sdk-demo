import type { SignInParams } from "@dogeos/dogeos-sdk";
import {
  useAccount,
  useWalletConnect,
  WalletConnectEmbed,
  WalletConnectProvider,
} from "@dogeos/dogeos-sdk";
import { useMemo, useState } from "react";
import { fromHex, numberToHex, parseEther, toHex } from "viem";

const TOMO_SDK_CLIENT_ID = "mSzQLiebxpwV64barnRZpCGZTwB38kSiuszi42Cqq41fkRH8KM99dqG4pFNnvaVA4DV7zHsic0or0pd8tlMIt9vc";

export function App() {

  const [walletBaseUrl, setWalletBaseUrl] = useState<string>("https://dogeos.dev-embedded-wallet.tomo.inc/embed");
  const [clientId, setClientId] = useState<string>(TOMO_SDK_CLIENT_ID);
  const [name, setName] = useState<string>("Dogeos Social Wallet");
  const [logo, setLogo] = useState<string>("https://getdoge.com/cdn/shop/files/Symbol_1.png?v=1681939190&width=200");

  const config = useMemo(() => {
    return {};
  }, []);

  return (
    <WalletConnectProvider config={config}>
      <div className="size-full min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex w-full items-center justify-between bg-app-white p-4 dark:bg-app-gray-900 sm:px-8 sm:py-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Wallet Connect SDK
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              A comprehensive wallet connection SDK with React hooks and modal support
            </p>
          </div>
          {/* <button
            onClick={toggleTheme}
            className=""
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <span>{theme === "light" ? "Dark" : "Light"} Mode</span>
          </button> */}
        </header>

        {/* Main Content - Full Width */}
        <WalletDemo
          logo={logo}
          setLogo={setLogo}
          name={name}
          setName={setName}
          clientId={clientId}
          setClientId={setClientId}
          walletBaseUrl={walletBaseUrl}
          setWalletBaseUrl={setWalletBaseUrl}
        />
      </div>
    </WalletConnectProvider>
  );
}

interface WalletDemoProps {
  logo: string;
  setLogo: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  clientId: string;
  setClientId: (value: string) => void;
  walletBaseUrl: string;
  setWalletBaseUrl: (value: string) => void;
}

const WalletDemo = ({
  logo,
  setLogo,
  name,
  setName,
  clientId,
  setClientId,
  walletBaseUrl,
  setWalletBaseUrl,
}: WalletDemoProps) => {
  const { isConnected, openModal, disconnect } = useWalletConnect();
  const { address, chainType, signInWithWallet, signMessage, currentProvider } = useAccount();

  const [signedMessage, setSignedMessage] = useState<string>("");
  const [signedSignInMessage, setSignedSignInMessage] = useState<string>("");
  const [testResult, setTestResult] = useState<Record<string, unknown>>({});

  const handleSignIn = async () => {
    try {
      const params: SignInParams = {
        scheme: "https",
        domain: window.location.host,
        statement: "Requesting Connection",
        version: "1",
        nonce: Math.random().toString(36).slice(2),
        issuedAt: new Date().toISOString(),
        resources: ["https://example.com"],
      };
      const signature = await signInWithWallet(params);
      handleSignMessageResponse(signature, true);
    } catch (error) {
      console.error("Sign in failed:", error);
      // alert("Sign in failed: " + (error as Error).message);
    }
  };

  const handleSignMessage = async () => {
    try {
      if (!signMessage) {
        throw new Error("signMessage is not available yet");
      }
      const signature = await signMessage({
        message: "Hello from Tomo Wallet Connect",
        nonce: Math.random().toString(36).slice(2),
      });
      handleSignMessageResponse(signature);
    } catch (error) {
      console.error("Sign message failed:", error);
      // alert("Sign message failed: " + (error as Error).message);
    }
  };

  const uint8ToBase64 = (uint8: Uint8Array) => {
    let binary = "";
    uint8.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  };

  const handleSignMessageResponse = (signature: string | Uint8Array, isSignIn: boolean = false) => {
    let signatureString: string = (signature as string) || "";
    if (signature instanceof Uint8Array) {
      signatureString = uint8ToBase64(signature);
    }

    if (isSignIn) {
      setSignedSignInMessage(signatureString);
    } else {
      setSignedMessage(signatureString);
    }
    console.log("Signature:", signature);
    // alert(`Signed successfully: ${signatureString?.substring?.(0, 20)}...`);
  };

  const getChainId = async () => {
    if (!currentProvider) {
      // alert("Provider not available");
      return;
    }
    try {
      const res = await currentProvider.request({ method: "eth_chainId" });
      setTestResult({
        method: "getChainId/eth_chainId",
        res,
      });
      console.log("Chain ID:", res);
    } catch (error: unknown) {
      setTestResult({
        method: "getChainId/eth_chainId",
        error: error instanceof Error ? error.message : "Failed",
      });
    }
  };

  const switchChain = async () => {
    if (!currentProvider) {
      // alert("Provider not available");
      return;
    }
    try {
      const currentChainId = await currentProvider.request({ method: "eth_chainId" });
      let chainId = "0x1";
      if (currentChainId === chainId) {
        chainId = "0x2105"; // Base
      }
      const res = await currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      setTestResult({
        method: "wallet_switchEthereumChain",
        res,
      });
      console.log("Switch chain result:", res);
    } catch (error: unknown) {
      setTestResult({
        method: "wallet_switchEthereumChain",
        error: error instanceof Error ? error.message : "Failed",
      });
    }
  };

  const signTypedData = async () => {
    if (!currentProvider || !address) {
      // alert("Provider or address not available");
      return;
    }
    try {
      const chainIdHex = (await currentProvider.request({ method: "eth_chainId" })) || "0x1";
      const chainId = fromHex(chainIdHex as `0x${string}`, "number");

      const types = {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      };

      const domain = {
        name: "Ether Mail",
        version: "1",
        chainId: chainId,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      };

      const message = {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      };

      const params = [
        address,
        {
          types,
          primaryType: "Mail",
          domain,
          message,
        },
      ];

      const signature = await currentProvider.request({
        method: "eth_signTypedData_v4",
        params,
      });

      setTestResult({
        method: "eth_signTypedData_v4",
        res: signature,
      });
      console.log("Typed data signature:", signature);
      // alert(`Signed typed data: ${(signature as string).substring(0, 20)}...`);
    } catch (error: unknown) {
      setTestResult({
        method: "eth_signTypedData_v4",
        error: error instanceof Error ? error.message : "Failed",
      });
      console.error("Sign typed data failed:", error);
    }
  };

  const eth_signTransaction = async () => {
    if (!currentProvider || !address) {
      // alert("Provider or address not available");
      return;
    }
    try {
      const amount = 0.0001;
      const value = toHex(parseEther(amount.toString()));
      const chainId = await currentProvider.request({ method: "eth_chainId" });

      const transactionParameters = {
        to: address,
        value,
        from: address,
        data: toHex("sign tx test"),
        gasLimit: numberToHex(30000),
        chainId,
      };

      const res = await currentProvider.request({
        method: "eth_signTransaction",
        params: [transactionParameters],
      });

      setTestResult({
        method: "eth_signTransaction",
        tx: transactionParameters,
        res,
      });
      console.log("Signed transaction:", res);
      // alert("Transaction signed successfully");
    } catch (error: unknown) {
      setTestResult({
        method: "eth_signTransaction",
        error: error instanceof Error ? error.message : "Failed",
      });
      console.error("Sign transaction failed:", error);
    }
  };

  const sendTransaction = async () => {
    if (!currentProvider || !address) {
      // alert("Provider or address not available");
      return;
    }
    try {
      const amount = 0.0001;
      const value = toHex(parseEther(amount.toString()));
      const transactionParameters = {
        to: address,
        value,
        from: address,
      };

      const txHash = await currentProvider.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      setTestResult({
        method: "eth_sendTransaction",
        tx: transactionParameters,
        res: txHash,
      });
      console.log("Transaction hash:", txHash);
      // alert(`Transaction sent: ${txHash}`);
    } catch (error: unknown) {
      setTestResult({
        method: "eth_sendTransaction",
        error: error instanceof Error ? error.message : "Failed",
      });
      console.error("Send transaction failed:", error);
    }
  };

  return (
    <>
      {!isConnected ? (
        <>
          <div className="mobile-connect-button flex-1 items-center justify-center bg-[#f3f4f6] z-10">
            <button
              onClick={openModal}
              className="px-8 py-4 rounded-full border border-gray-200 bg-white text-gray-700 font-medium text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 shadow-lg"
            >
              Connect Wallet
            </button>
          </div>

          <div className="desktop-connect-content relative flex-1 items-center justify-center bg-[#f3f4f6]">
            <div className="mx-0 flex size-full flex-col gap-4 p-4">
              <div className="flex w-full flex-1 items-center justify-between">
                <div className="desktop-config-content md:flex flex-col w-[368px] h-[700px] bg-white border border-gray-200 rounded-xl shadow-lg p-6 gap-4 overflow-y-auto">
                  <h3 className="text-lg font-semibold">Configuration</h3>

                  {/* Logo URL */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Logo URL</label>
                    <input
                      type="text"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="px-3 py-2 rounded-md border text-sm"
                    />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-3 py-2 rounded-md border text-sm"
                    />
                  </div>

                  {/* Wallet Base URL */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Wallet Base URL</label>
                    <input
                      type="text"
                      value={walletBaseUrl}
                      onChange={(e) => setWalletBaseUrl(e.target.value)}
                      className="px-3 py-2 rounded-md border text-sm"
                    />
                  </div>

                  {/* Tomo Client ID */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Tomo Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="px-3 py-2 rounded-md border text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center self-center">
                  <WalletConnectEmbed className="shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 flex-1 size-full bg-[#f3f4f6]">
          <div className="flex flex-col md:flex-row items-start gap-4 responsive-layout">
            <div className="flex w-full md:flex-1 md:max-w-[30%] flex-col bg-white border border-gray-200 rounded-xl shadow-lg p-6 gap-4 overflow-y-auto">
              {/* Connection Status  */}
              <div className="break-all">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    Connection Status
                  </h2>
                </div>
                <div className="info-item">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      Connection Status
                    </span>
                    <span className="badge badge-success">✓ Connected</span>
                  </div>
                </div>
              </div>

              {/* Wallet Information  */}
              <div className="break-all">
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Wallet Information
                </h3>
                <div className="space-y-3">
                  <div className="info-item">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        Address
                      </span>
                      <code className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                        {address}
                      </code>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        Chain Type
                      </span>
                      <span
                        onClick={() => openModal()}
                        className="badge"
                        style={{ cursor: "pointer", background: "var(--accent-primary)" }}
                      >
                        {chainType?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {signedMessage && (
                    <div className="info-item">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                          Last Signed Message
                        </span>
                        <code className="text-xs font-mono break-all" style={{ color: "var(--text-primary)" }}>
                          {signedMessage}
                        </code>
                      </div>
                    </div>
                  )}

                  {signedSignInMessage && (
                    <div className="info-item">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                          Sign-in Signature
                        </span>
                        <code className="text-xs font-mono break-all" style={{ color: "var(--text-primary)" }}>
                          {signedSignInMessage}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full md:flex-1 md:max-w-[30%] flex-col bg-white border border-gray-200 rounded-xl shadow-lg p-6 gap-4 overflow-y-auto">
              <div className="break-all">
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Actions
                </h3>
                <div className="flex flex-col gap-2.5">
                  <button
                    className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                    onClick={openModal}
                  >
                    Open Wallet Modal
                  </button>
                  <button
                    className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                    onClick={handleSignMessage}
                  >
                    Sign Message
                  </button>
                  <button
                    className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                    onClick={handleSignIn}
                  >
                    Sign-in with Wallet
                  </button>
                  <button
                    className="w-full h-[35px] px-5 py-3 rounded-full border border-red-200 bg-white text-red-600 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-red-50 hover:border-red-300"
                    onClick={disconnect}
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* EVM Test Functions */}
              {chainType === "evm" && (
                <div className="">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    EVM Test Functions
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <button
                      className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                      onClick={getChainId}
                    >
                      Get Chain ID
                    </button>
                    <button
                      className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                      onClick={switchChain}
                    >
                      Switch Chain
                    </button>
                    <button
                      className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                      onClick={signTypedData}
                    >
                      Sign Typed Data
                    </button>
                    <button
                      className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                      onClick={eth_signTransaction}
                    >
                      Sign Transaction
                    </button>
                    <button
                      className="w-full h-[35px] px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-normal text-base flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                      onClick={sendTransaction}
                    >
                      Send Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full md:flex-1 md:max-w-[30%] flex-col bg-white border border-gray-200 rounded-xl shadow-lg p-6 gap-4 overflow-y-auto">
              <div className="break-all">
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Test Result
                </h3>
                {Object.keys(testResult).length > 0 ? (
                  <div
                    className="code-block border p-5 rounded-2xl break-all"
                    style={{
                      borderColor: testResult.error ? "var(--danger)" : "var(--border-color)",
                    }}
                  >
                    <pre
                      className="text-xs w-full break-all max-h-96 overflow-auto"
                      style={{
                        color: "var(--text-primary)",
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                    >
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    No test results yet. Click any action button to see results here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

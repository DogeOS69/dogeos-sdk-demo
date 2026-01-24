"use client";

import type { Chain } from "@dogeos/dogeos-sdk";
import { getChains, getConnectors, useAccount, useWalletConnect } from "@dogeos/dogeos-sdk";
import { Button } from "@tomo-inc/tomo-ui";
import { useState } from "react";
import { polygon } from "viem/chains";

type TestLogEntry = {
  id: string;
  title: string;
  status: "success" | "error";
  timestamp: string;
  payload?: unknown;
};

type ChainsResult = Awaited<ReturnType<typeof getChains>>;

const createLogId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatPayload = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(
      value,
      (_key, val) => (typeof val === "bigint" ? val.toString() : val),
      2,
    );
  } catch (error) {
    return String(error ?? value);
  }
};

export function SdkTests() {
  const { openModal, closeModal, disconnect, isConnected, isConnecting, isOpenModal, error } = useWalletConnect();
  const { address, balance, chainId, chainType, signMessage, signInWithWallet, switchChain, currentProvider } =
    useAccount();
  const [logs, setLogs] = useState<TestLogEntry[]>([]);
  const [chains, setChains] = useState<ChainsResult | null>(null);
  const [messageToSign, setMessageToSign] = useState("Hello DogeOS");
  const [messageNonce, setMessageNonce] = useState("");
  const [evmToAddress, setEvmToAddress] = useState("");
  const [evmValue, setEvmValue] = useState("0x0");
  const [dogeMessage, setDogeMessage] = useState("Hello Dogecoin");
  const [dogePsbt, setDogePsbt] = useState("");
  const [dogeToAddress, setDogeToAddress] = useState("");
  const [dogeAmount, setDogeAmount] = useState("");

  const appendLog = (entry: Omit<TestLogEntry, "id" | "timestamp">) => {
    setLogs((prev) => [
      {
        id: createLogId(),
        timestamp: new Date().toLocaleTimeString(),
        ...entry,
      },
      ...prev,
    ]);
  };

  const runTest = async (title: string, action: () => Promise<unknown> | unknown) => {
    try {
      const payload = await action();
      appendLog({ title, status: "success", payload });
      return payload;
    } catch (err) {
      appendLog({
        title,
        status: "error",
        payload: err instanceof Error ? err.message : err,
      });
      return null;
    }
  };

  const ensureEvmProvider = () => {
    if (
      chainType !== "evm" ||
      !currentProvider ||
      typeof (currentProvider as { request?: unknown }).request !== "function"
    ) {
      throw new Error("Connect an EVM wallet to run this test.");
    }
    return currentProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  };

  const ensureDogecoinProvider = () => {
    if (chainType !== "dogecoin" || !currentProvider) {
      throw new Error("Connect a Dogecoin wallet to run this test.");
    }
    return currentProvider as Record<string, (...args: unknown[]) => Promise<unknown>>;
  };

  const ensureAddress = (title: string) => {
    if (!address) {
      appendLog({
        title,
        status: "error",
        payload: "No address found. Connect a wallet first.",
      });
      return false;
    }
    return true;
  };

  const handleGetChains = async () => {
    await runTest("getChains()", async () => {
      const data = await getChains();
      setChains(data);
      return {
        chainTypes: Object.keys(data ?? {}),
        evmChains: data?.evm?.length ?? 0,
        dogecoinChains: data?.dogecoin?.length ?? 0,
      };
    });
  };

  const handleGetConnectors = async () => {
    await runTest("getConnectors()", async () => {
      const data = await getConnectors();
      return {
        count: data.length,
        names: data.map((item) => item.name ?? item.id),
      };
    });
  };

  const handleSignMessage = async () => {
    await runTest("signMessage()", async () => {
      if (!signMessage) {
        throw new Error("signMessage is unavailable. Connect a wallet first.");
      }
      return signMessage({
        message: messageToSign,
        nonce: messageNonce || undefined,
      });
    });
  };

  const handleSignIn = async () => {
    await runTest("signInWithWallet()", async () => {
      if (!signInWithWallet) {
        throw new Error("signInWithWallet is unavailable. Connect a wallet first.");
      }
      if (typeof window === "undefined") {
        return signInWithWallet();
      }
      const scheme = window.location.protocol === "https:" ? "https" : "http";
      const domain = window.location.host;
      const uri = window.location.origin;
      const normalizedChainId =
        chainType === "evm" && chainId
          ? chainId.startsWith("0x")
            ? Number.parseInt(chainId, 16).toString()
            : chainId
          : undefined;
      return signInWithWallet({
        scheme,
        domain,
        uri,
        chainId: normalizedChainId,
        address,
        statement: "Sign in with DogeOS SDK",
        nonce: Math.random().toString(36).slice(2),
      });
    });
  };

  const handleSwitchChain = async () => {
    await runTest("switchChain()", async () => {
      if (!switchChain) {
        throw new Error("switchChain is unavailable. Connect a wallet first.");
      }
      return switchChain({ chainType: "evm", chainInfo: polygon });
    });
  };

  const resolveDogecoinChain = async (): Promise<Chain> => {
    let dogecoinChains = chains?.dogecoin as Chain[] | undefined;
    if (!dogecoinChains || dogecoinChains.length === 0) {
      const data = await getChains();
      setChains(data);
      dogecoinChains = data?.dogecoin as Chain[] | undefined;
    }
    if (!dogecoinChains || dogecoinChains.length === 0) {
      throw new Error("No Dogecoin chains are configured.");
    }
    return dogecoinChains[0];
  };

  const handleSwitchDogecoin = async () => {
    await runTest("switchChain(dogecoin)", async () => {
      if (!switchChain) {
        throw new Error("switchChain is unavailable. Connect a wallet first.");
      }
      const dogecoinChain = await resolveDogecoinChain();
      return switchChain({ chainType: "dogecoin", chainInfo: dogecoinChain });
    });
  };

  const handleEvmRequest = async (title: string, method: string, params?: unknown[]) => {
    await runTest(title, async () => {
      const provider = ensureEvmProvider();
      return provider.request({ method, params });
    });
  };

  const handleDogecoinRequest = async (title: string, method: string, args?: unknown[]) => {
    await runTest(title, async () => {
      const provider = ensureDogecoinProvider();
      const fn = provider[method];
      if (typeof fn !== "function") {
        throw new Error(`${method} is not available on the Dogecoin provider.`);
      }
      return fn(...(args ?? []));
    });
  };

  const resolvedEvmTo = evmToAddress || address || "";
  const chainIdNumber = chainId ? Number.parseInt(chainId, 16) || 1 : 1;

  return (
    <div className="max-w-5xl mx-auto text-foreground">
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* Left Column - All Test Widgets */}
        <div style={{ flex: "2 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Status Cards */}
          <div className="flex flex-wrap gap-2">
            <div className="rounded-lg border border-content2 bg-content1 px-3 py-2">
              <div className="text-[10px] font-medium text-foreground/60 mb-0.5">Connection</div>
              <div className="text-xs font-medium">{isConnected ? "Connected" : "Not connected"}</div>
            </div>
            <div className="rounded-lg border border-content2 bg-content1 px-3 py-2">
              <div className="text-[10px] font-medium text-foreground/60 mb-0.5">Account</div>
              <div className="text-xs font-medium">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "—"}</div>
            </div>
            <div className="rounded-lg border border-content2 bg-content1 px-3 py-2">
              <div className="text-[10px] font-medium text-foreground/60 mb-0.5">Chain</div>
              <div className="text-xs font-medium">{chainType ? `${chainType} / ${chainId ?? "—"}` : "—"}</div>
            </div>
            <div className="rounded-lg border border-content2 bg-content1 px-3 py-2">
              <div className="text-[10px] font-medium text-foreground/60 mb-0.5">Balance</div>
              <div className="text-xs font-medium">{balance ?? "—"}</div>
            </div>
            {error && (
              <div className="rounded-lg border border-danger bg-danger/10 px-3 py-2">
                <div className="text-[10px] font-medium text-danger mb-0.5">Error</div>
                <div className="text-xs text-danger">{error}</div>
              </div>
            )}
          </div>

          {/* Wallet Connect Controls */}
          <section className="rounded-lg border border-content2 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">WalletConnect Controls</h3>
                <p className="text-xs text-foreground/60">useWalletConnect hook</p>
              </div>
              <Button size="sm" variant="bordered" onPress={() => setLogs([])}>
                Clear Logs
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" color="primary" onPress={() => runTest("openModal()", () => openModal())}>
                Open Modal
              </Button>
              <Button size="sm" variant="bordered" onPress={() => runTest("closeModal()", () => closeModal())}>
                Close Modal
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="bordered"
                onPress={() => runTest("disconnect()", () => disconnect())}
              >
                Disconnect
              </Button>
            </div>
          </section>

          {/* SDK Helpers */}
          <section className="rounded-lg border border-content2 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">SDK Helpers</h3>
              <p className="text-xs text-foreground/60">getChains / getConnectors</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="bordered" onPress={handleGetChains}>
                Fetch Chains
              </Button>
              <Button size="sm" variant="bordered" onPress={handleGetConnectors}>
                Fetch Connectors
              </Button>
            </div>
          </section>

          {/* Account Actions */}
          <section className="rounded-lg border border-content2 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Account Actions</h3>
              <p className="text-xs text-foreground/60">useAccount hook</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={messageToSign}
                onChange={(event) => setMessageToSign(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Message to sign"
              />
              <input
                type="text"
                value={messageNonce}
                onChange={(event) => setMessageNonce(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Optional nonce"
              />
              <Button size="sm" color="primary" onPress={handleSignMessage}>
                Sign Message
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="bordered" onPress={handleSignIn}>
                Sign In With Wallet
              </Button>
              <Button size="sm" variant="bordered" onPress={handleSwitchChain}>
                Switch to Polygon
              </Button>
              <Button size="sm" variant="bordered" onPress={handleSwitchDogecoin}>
                Switch to Dogecoin
              </Button>
            </div>
          </section>

          {/* EVM Provider Methods */}
          <section className="rounded-lg border border-content2 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">EVM Provider Methods</h3>
              <p className="text-xs text-foreground/60">currentProvider.request</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={evmToAddress}
                onChange={(event) => setEvmToAddress(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={address ? `Recipient (default ${address.slice(0, 6)}...)` : "Recipient address"}
              />
              <input
                type="text"
                value={evmValue}
                onChange={(event) => setEvmValue(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Value in hex (e.g. 0x0)"
              />
              <Button
                size="sm"
                color="primary"
                onPress={() => {
                  if (!ensureAddress("eth_sendTransaction")) return;
                  if (!resolvedEvmTo) {
                    appendLog({
                      title: "eth_sendTransaction",
                      status: "error",
                      payload: "Recipient address is required.",
                    });
                    return;
                  }
                  handleEvmRequest("eth_sendTransaction", "eth_sendTransaction", [
                    {
                      from: address,
                      to: resolvedEvmTo,
                      value: evmValue || "0x0",
                    },
                  ]);
                }}
              >
                Send Transaction
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="bordered" onPress={() => handleEvmRequest("eth_chainId", "eth_chainId")}>
                eth_chainId
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onPress={() => {
                  if (!ensureAddress("eth_getBalance")) return;
                  handleEvmRequest("eth_getBalance", "eth_getBalance", [address, "latest"]);
                }}
              >
                eth_getBalance
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onPress={() => {
                  if (!ensureAddress("eth_signTransaction")) return;
                  handleEvmRequest("eth_signTransaction", "eth_signTransaction", [
                    {
                      from: address,
                      to: resolvedEvmTo,
                      value: evmValue || "0x0",
                      gas: "0x5208",
                      chainId: chainId || "0x1",
                    },
                  ]);
                }}
              >
                eth_signTransaction
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onPress={() => {
                  if (!ensureAddress("eth_signTypedData_v4")) return;
                  handleEvmRequest("eth_signTypedData_v4", "eth_signTypedData_v4", [
                    address,
                    JSON.stringify({
                      types: {
                        EIP712Domain: [
                          { name: "name", type: "string" },
                          { name: "version", type: "string" },
                          { name: "chainId", type: "uint256" },
                        ],
                        Person: [
                          { name: "name", type: "string" },
                          { name: "wallet", type: "address" },
                        ],
                      },
                      primaryType: "Person",
                      domain: { name: "DogeOS Demo", version: "1", chainId: chainIdNumber },
                      message: { name: "DogeOS Tester", wallet: address },
                    }),
                  ]);
                }}
              >
                eth_signTypedData_v4
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onPress={() =>
                  handleEvmRequest("wallet_addEthereumChain", "wallet_addEthereumChain", [
                    {
                      chainId: "0x89",
                      chainName: "Polygon Mainnet",
                      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                      rpcUrls: ["https://polygon-rpc.com"],
                      blockExplorerUrls: ["https://polygonscan.com"],
                    },
                  ])
                }
              >
                wallet_addEthereumChain
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onPress={() => {
                  if (!ensureAddress("eth_estimateGas")) return;
                  handleEvmRequest("eth_estimateGas", "eth_estimateGas", [
                    { from: address, to: resolvedEvmTo, value: evmValue || "0x0" },
                  ]);
                }}
              >
                eth_estimateGas
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onPress={() => {
                  if (!ensureAddress("eth_getTransactionCount")) return;
                  handleEvmRequest("eth_getTransactionCount", "eth_getTransactionCount", [address, "latest"]);
                }}
              >
                eth_getTransactionCount
              </Button>
            </div>
          </section>

          {/* Dogecoin Provider Methods */}
          <section className="rounded-lg border border-content2 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Dogecoin Provider Methods</h3>
              <p className="text-xs text-foreground/60">currentProvider methods</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={dogeMessage}
                onChange={(event) => setDogeMessage(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Message to sign"
              />
              <input
                type="text"
                value={dogePsbt}
                onChange={(event) => setDogePsbt(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="PSBT hex string"
              />
              <Button
                size="sm"
                variant="bordered"
                onPress={() =>
                  handleDogecoinRequest("signMessage", "signMessage", [
                    {
                      message: dogeMessage,
                    },
                  ])
                }
              >
                signMessage
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={dogeToAddress}
                onChange={(event) => setDogeToAddress(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Recipient Dogecoin address"
              />
              <input
                type="text"
                value={dogeAmount}
                onChange={(event) => setDogeAmount(event.target.value)}
                className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Amount in satoshi"
              />
              <Button
                size="sm"
                color="primary"
                onPress={() => {
                  if (!dogeToAddress || !dogeAmount) {
                    appendLog({
                      title: "sendDogecoin",
                      status: "error",
                      payload: "Recipient and amount are required.",
                    });
                    return;
                  }
                  const parsedAmount = Number(dogeAmount);
                  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                    appendLog({
                      title: "sendDogecoin",
                      status: "error",
                      payload: "Amount must be a positive number.",
                    });
                    return;
                  }
                  handleDogecoinRequest("sendDogecoin", "sendDogecoin", [{ to: dogeToAddress, amount: parsedAmount }]);
                }}
              >
                sendDogecoin
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="bordered"
                onPress={() => handleDogecoinRequest("requestAccounts", "requestAccounts")}
              >
                requestAccounts
              </Button>
              <Button size="sm" variant="bordered" onPress={() => handleDogecoinRequest("getAccounts", "getAccounts")}>
                getAccounts
              </Button>
              <Button size="sm" variant="bordered" onPress={() => handleDogecoinRequest("getBalance", "getBalance")}>
                getBalance
              </Button>
              <Button
                size="sm"
                variant="bordered"
                onPress={() => {
                  if (!dogePsbt) {
                    appendLog({
                      title: "signPSBT",
                      status: "error",
                      payload: "PSBT hex is required.",
                    });
                    return;
                  }
                  handleDogecoinRequest("signPSBT", "signPSBT", [{ psbt: dogePsbt }]);
                }}
              >
                signPSBT
              </Button>
            </div>
          </section>
        </div>

        {/* Test Output Panel */}
        <div style={{ flex: "1 1 0%", minWidth: 0 }}>
          <section className="rounded-lg border border-content2 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Test Output</h3>
                <p className="text-xs text-foreground/60">Latest results appear first</p>
              </div>
              {logs.length > 0 && (
                <span className="text-xs text-foreground/50">{logs.length} result{logs.length !== 1 ? "s" : ""}</span>
              )}
            </div>
            {logs.length === 0 ? (
              <div className="text-sm text-foreground/50 py-8 text-center">No tests run yet.</div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`rounded-lg border p-3 text-xs ${
                    log.status === "success"
                      ? "border-success/30 bg-success/5"
                      : "border-danger/30 bg-danger/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{log.title}</span>
                    <span className={`text-xs ${log.status === "success" ? "text-success" : "text-danger"}`}>
                      {log.status.toUpperCase()} • {log.timestamp}
                    </span>
                  </div>
                  {log.payload !== undefined && (
                    <pre className="mt-2 whitespace-pre-wrap break-words text-foreground/70 bg-background/50 p-2 rounded border border-content2 overflow-x-auto">
                      {formatPayload(log.payload)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
          </section>
        </div>
      </div>
    </div>
  );
}

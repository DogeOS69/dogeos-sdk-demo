"use client";

import type { Chain } from "@dogeos/dogeos-sdk";
import { ChainTypeEnum, getChains, getConnectors, useAccount, useWalletConnect } from "@dogeos/dogeos-sdk";
import { Button } from "@tomo-inc/tomo-ui";
import { useState } from "react";
import { polygon } from "viem/chains";
import { dogeOSTestnet } from "./dogeos-testnet";

type TestLogEntry = {
  id: string;
  title: string;
  status: "success" | "error";
  timestamp: string;
  payload?: unknown;
};

type ChainsResult = Awaited<ReturnType<typeof getChains>>;

const createLogId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getSwitchableEvmChains = (source?: Chain[]) => {
  const byId = new Map<string, Chain>();
  [dogeOSTestnet, ...(source ?? [])].forEach((chain) => {
    byId.set(String(chain.id), chain);
  });
  return [...byId.values()];
};

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
  const {
    openModal,
    closeModal,
    disconnect,
    connect,
    isConnected,
    isConnecting,
    isDisconnected,
    connectionStatus,
    walletStatus,
    isWalletReady,
    isWalletLoading,
    error,
  } = useWalletConnect();
  const { address, balance, chainId, chainType, signMessage, signInWithWallet, switchChain, currentProvider, currentWallet } =
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
  const [selectedWalletActionId, setSelectedWalletActionId] = useState("openModal");
  const [selectedSdkActionId, setSelectedSdkActionId] = useState("fetchChains");
  const [selectedAccountActionId, setSelectedAccountActionId] = useState("signMessage");
  const [selectedEvmActionId, setSelectedEvmActionId] = useState("evmChainId");
  const [selectedDogeActionId, setSelectedDogeActionId] = useState("dogeRequest");
  const [selectedSwitchChainId, setSelectedSwitchChainId] = useState<string>(String(dogeOSTestnet.id));
  const [isFetchingChains, setIsFetchingChains] = useState(false);

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
    return currentProvider as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>;
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

  const resolveChains = async () => {
    if (chains?.evm && chains.evm.length > 0) {
      return chains;
    }
    setIsFetchingChains(true);
    try {
      const data = await getChains();
      setChains(data);
      return data;
    } finally {
      setIsFetchingChains(false);
    }
  };

  const handleSelectSwitchChainAction = () => {
    setSelectedAccountActionId("switchChain");
    if (!chains?.evm || chains.evm.length === 0) {
      resolveChains();
    }
  };

  const handleSwitchChain = async () => {
    await runTest("switchChain()", async () => {
      if (!switchChain) {
        throw new Error("switchChain is unavailable. Connect a wallet first.");
      }
      if (!selectedSwitchChainId) {
        throw new Error("Select a chain from the dropdown first.");
      }
      const resolvedChains = await resolveChains();
      const evmChains = getSwitchableEvmChains(resolvedChains?.evm as Chain[] | undefined);
      const selectedChain = evmChains?.find(
        (c) => String(c.id) === selectedSwitchChainId || c.id === Number(selectedSwitchChainId)
      );
      if (!selectedChain) {
        throw new Error(`Chain ${selectedSwitchChainId} not found in available chains.`);
      }
      return switchChain({ chainType: ChainTypeEnum.EVM, chainInfo: selectedChain });
    });
  };

  const handleConnectDogecoin = async () => {
    await runTest("connect(dogecoin)", async () => {
      if (!currentWallet) {
        throw new Error("No wallet connected. Connect a wallet first.");
      }
      return connect({ wallet: currentWallet, chainType: ChainTypeEnum.DOGECOIN });
    });
  };

  const handleConnectEvm = async () => {
    await runTest("connect(evm)", async () => {
      if (!currentWallet) {
        throw new Error("No wallet connected. Connect a wallet first.");
      }
      return connect({ wallet: currentWallet, chainType: ChainTypeEnum.EVM });
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
  const handleOpenModal = () => runTest("openModal()", () => openModal());
  const handleCloseModal = () => runTest("closeModal()", () => closeModal());
  const handleDisconnect = () => runTest("disconnect()", () => disconnect());

  const handleEvmSendTransaction = () => {
    if (!ensureAddress("eth_sendTransaction")) return;
    if (!resolvedEvmTo) {
      appendLog({
        title: "eth_sendTransaction",
        status: "error",
        payload: "Recipient address is required.",
      });
      return;
    }
    return handleEvmRequest("eth_sendTransaction", "eth_sendTransaction", [
      {
        from: address,
        to: resolvedEvmTo,
        value: evmValue || "0x0",
      },
    ]);
  };

  const handleEvmGetBalance = () => {
    if (!ensureAddress("eth_getBalance")) return;
    return handleEvmRequest("eth_getBalance", "eth_getBalance", [address, "latest"]);
  };

  const handleEvmSignTransaction = () => {
    if (!ensureAddress("eth_signTransaction")) return;
    return handleEvmRequest("eth_signTransaction", "eth_signTransaction", [
      {
        from: address,
        to: resolvedEvmTo,
        value: evmValue || "0x0",
        gas: "0x5208",
        chainId: chainId || "0x1",
      },
    ]);
  };

  const handleEvmSignTypedData = () => {
    if (!ensureAddress("eth_signTypedData_v4")) return;
    return handleEvmRequest("eth_signTypedData_v4", "eth_signTypedData_v4", [
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
  };

  const handleEvmAddChain = () =>
    handleEvmRequest("wallet_addEthereumChain", "wallet_addEthereumChain", [
      {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com"],
      },
    ]);

  const handleEvmEstimateGas = () => {
    if (!ensureAddress("eth_estimateGas")) return;
    return handleEvmRequest("eth_estimateGas", "eth_estimateGas", [
      { from: address, to: resolvedEvmTo, value: evmValue || "0x0" },
    ]);
  };

  const handleEvmGetTransactionCount = () => {
    if (!ensureAddress("eth_getTransactionCount")) return;
    return handleEvmRequest("eth_getTransactionCount", "eth_getTransactionCount", [address, "latest"]);
  };

  const handleDogeSignMessage = () =>
    handleDogecoinRequest("signMessage", "signMessage", [
      dogeMessage,
    ]);

  const handleDogeSignPSBT = () => {
    if (!dogePsbt) {
      appendLog({
        title: "signPsbt",
        status: "error",
        payload: "PSBT hex is required.",
      });
      return;
    }
    return handleDogecoinRequest("signPsbt", "signPsbt", [dogePsbt]);
  };

  const handleDogeSendDogecoin = () => {
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
    return handleDogecoinRequest("sendDogecoin", "sendDogecoin", [dogeToAddress, parsedAmount]);
  };

  const walletActions = [
    { id: "openModal", label: "Open Modal", run: handleOpenModal },
    { id: "closeModal", label: "Close Modal", run: handleCloseModal },
    { id: "disconnect", label: "Disconnect", run: handleDisconnect },
  ];

  const sdkActions = [
    { id: "fetchChains", label: "Fetch Chains", run: handleGetChains },
    { id: "fetchConnectors", label: "Fetch Connectors", run: handleGetConnectors },
  ];

  const accountActions = [
    { id: "signMessage", label: "Sign Message", run: handleSignMessage },
    { id: "signIn", label: "Sign In", run: handleSignIn },
    { id: "switchChain", label: "Switch Chain", run: handleSwitchChain },
    { id: "connectDogecoin", label: "Connect Dogecoin", run: handleConnectDogecoin },
    { id: "connectEvm", label: "Connect EVM", run: handleConnectEvm },
  ];

  const evmActions = [
    { id: "evmChainId", label: "EVM: chainId", run: () => handleEvmRequest("eth_chainId", "eth_chainId") },
    { id: "evmBalance", label: "EVM: balance", run: handleEvmGetBalance },
    { id: "evmSend", label: "EVM: sendTx", run: handleEvmSendTransaction },
    { id: "evmSignTx", label: "EVM: signTx", run: handleEvmSignTransaction },
    { id: "evmSignTyped", label: "EVM: signTyped", run: handleEvmSignTypedData },
    { id: "evmAddChain", label: "EVM: addChain", run: handleEvmAddChain },
    { id: "evmEstimateGas", label: "EVM: estimateGas", run: handleEvmEstimateGas },
    { id: "evmTxCount", label: "EVM: txCount", run: handleEvmGetTransactionCount },
  ];

  const dogeActions = [
    { id: "dogeRequest", label: "DOGE: requestAccounts", run: () => handleDogecoinRequest("requestAccounts", "requestAccounts") },
    { id: "dogeAccounts", label: "DOGE: getAccounts", run: () => handleDogecoinRequest("getAccounts", "getAccounts") },
    { id: "dogeBalance", label: "DOGE: getBalance", run: () => handleDogecoinRequest("getBalance", "getBalance") },
    { id: "dogeSign", label: "DOGE: signMessage", run: handleDogeSignMessage },
    { id: "dogeSignPsbt", label: "DOGE: signPsbt", run: handleDogeSignPSBT },
    { id: "dogeSend", label: "DOGE: send", run: handleDogeSendDogecoin },
  ];

  const selectorButtonClass = "px-2 py-0.5 text-xs";
  const selectorLabelClass = "inline-flex items-center gap-1";
  const selectorBorderStyle = {
    borderWidth: "0.5px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.2)",
  };
  const selectorSelectedBorderStyle = {
    borderWidth: "0.5px",
    borderStyle: "solid",
    borderColor: "var(--heroui-content2)",
  };

  const runSelectedAction = async (
    label: string,
    actions: { id: string; label: string; run: () => Promise<unknown> | void }[],
    selectedId: string,
  ) => {
    const selectedAction = actions.find((action) => action.id === selectedId);
    if (!selectedAction) {
      appendLog({
        title: label,
        status: "error",
        payload: "Select an action to run.",
      });
      return;
    }
    await selectedAction.run();
  };

  return (
    <div className="max-w-5xl mx-auto text-foreground">
      <div className="grid gap-6" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Left Column - All Test Widgets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Status Cards */}
          <div className="flex flex-wrap gap-2">
            <div className="rounded-lg border border-content2 bg-content1 px-3 py-2">
              <div className="text-[10px] font-medium text-foreground/60 mb-0.5">Connection</div>
              <div className="text-xs font-medium">{connectionStatus}</div>
            </div>
            <div className="rounded-lg border border-content2 bg-content1 px-3 py-2">
              <div className="text-[10px] font-medium text-foreground/60 mb-0.5">Wallet</div>
              <div className="text-xs font-medium">{walletStatus}</div>
            </div>
            <div className="rounded-lg border border-content2 bg-content1 px-3 py-2">
              <div className="text-[10px] font-medium text-foreground/60 mb-0.5">Ready</div>
              <div className="text-xs font-medium">
                {isWalletReady ? "ready" : isWalletLoading ? "loading" : isConnecting ? "connecting" : isDisconnected ? "disconnected" : "idle"}
              </div>
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

          <section className="rounded-lg border border-content2 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">WalletConnect Controls</h3>
              <p className="text-xs text-foreground/60">Modal and connection actions.</p>
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="WalletConnect actions">
              {walletActions.map((action) => {
                const isSelected = selectedWalletActionId === action.id;
                return (
                  <Button
                    key={action.id}
                    size="sm"
                    color="default"
                    variant={isSelected ? "flat" : "bordered"}
                    onPress={() => setSelectedWalletActionId(action.id)}
                    aria-pressed={isSelected}
                    className={selectorButtonClass}
                    style={isSelected ? selectorSelectedBorderStyle : selectorBorderStyle}
                  >
                    <span className={selectorLabelClass}>
                      {isSelected ? <span aria-hidden="true">✓</span> : null}
                      {action.label}
                    </span>
                  </Button>
                );
              })}
            </div>
            <div>
              <Button
                size="sm"
                color="primary"
                onPress={() => runSelectedAction("Execute WalletConnect", walletActions, selectedWalletActionId)}
              >
                Execute
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-content2 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">SDK Helpers</h3>
              <p className="text-xs text-foreground/60">Fetch chains and connectors.</p>
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="SDK helper actions">
              {sdkActions.map((action) => {
                const isSelected = selectedSdkActionId === action.id;
                return (
                  <Button
                    key={action.id}
                    size="sm"
                    color="default"
                    variant={isSelected ? "flat" : "bordered"}
                    onPress={() => setSelectedSdkActionId(action.id)}
                    aria-pressed={isSelected}
                    className={selectorButtonClass}
                    style={isSelected ? selectorSelectedBorderStyle : selectorBorderStyle}
                  >
                    <span className={selectorLabelClass}>
                      {isSelected ? <span aria-hidden="true">✓</span> : null}
                      {action.label}
                    </span>
                  </Button>
                );
              })}
            </div>
            <div>
              <Button
                size="sm"
                color="primary"
                onPress={() => runSelectedAction("Execute SDK Helper", sdkActions, selectedSdkActionId)}
              >
                Execute
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-content2 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Account Actions</h3>
              <p className="text-xs text-foreground/60">Sign and switch actions.</p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
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
              {selectedAccountActionId === "switchChain" && (
                <select
                  value={selectedSwitchChainId}
                  onChange={(event) => setSelectedSwitchChainId(event.target.value)}
                  className="w-full rounded-lg border border-content2 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
                  disabled={isFetchingChains}
                >
                  <option value="">{isFetchingChains ? "Loading chains..." : "Select chain to switch..."}</option>
                  {getSwitchableEvmChains(chains?.evm as Chain[] | undefined).map((chain) => (
                    <option key={chain.id} value={String(chain.id)}>
                      {chain.name} ({chain.id})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Account actions">
              {accountActions.map((action) => {
                const isSelected = selectedAccountActionId === action.id;
                return (
                  <Button
                    key={action.id}
                    size="sm"
                    color="default"
                    variant={isSelected ? "flat" : "bordered"}
                    onPress={() => action.id === "switchChain" ? handleSelectSwitchChainAction() : setSelectedAccountActionId(action.id)}
                    aria-pressed={isSelected}
                    className={selectorButtonClass}
                    style={isSelected ? selectorSelectedBorderStyle : selectorBorderStyle}
                  >
                    <span className={selectorLabelClass}>
                      {isSelected ? <span aria-hidden="true">✓</span> : null}
                      {action.label}
                    </span>
                  </Button>
                );
              })}
            </div>
            <div>
              <Button
                size="sm"
                color="primary"
                onPress={() => runSelectedAction("Execute Account", accountActions, selectedAccountActionId)}
              >
                Execute
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-content2 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">EVM Provider Methods</h3>
              <p className="text-xs text-foreground/60">RPC calls for the EVM provider.</p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
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
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="EVM actions">
              {evmActions.map((action) => {
                const isSelected = selectedEvmActionId === action.id;
                return (
                  <Button
                    key={action.id}
                    size="sm"
                    color="default"
                    variant={isSelected ? "flat" : "bordered"}
                    onPress={() => setSelectedEvmActionId(action.id)}
                    aria-pressed={isSelected}
                    className={selectorButtonClass}
                    style={isSelected ? selectorSelectedBorderStyle : selectorBorderStyle}
                  >
                    <span className={selectorLabelClass}>
                      {isSelected ? <span aria-hidden="true">✓</span> : null}
                      {action.label}
                    </span>
                  </Button>
                );
              })}
            </div>
            <div>
              <Button
                size="sm"
                color="primary"
                onPress={() => runSelectedAction("Execute EVM", evmActions, selectedEvmActionId)}
              >
                Execute
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-content2 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Dogecoin Provider Methods</h3>
              <p className="text-xs text-foreground/60">RPC calls for the Dogecoin provider.</p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
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
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Dogecoin actions">
              {dogeActions.map((action) => {
                const isSelected = selectedDogeActionId === action.id;
                return (
                  <Button
                    key={action.id}
                    size="sm"
                    color="default"
                    variant={isSelected ? "flat" : "bordered"}
                    onPress={() => setSelectedDogeActionId(action.id)}
                    aria-pressed={isSelected}
                    className={selectorButtonClass}
                    style={isSelected ? selectorSelectedBorderStyle : selectorBorderStyle}
                  >
                    <span className={selectorLabelClass}>
                      {isSelected ? <span aria-hidden="true">✓</span> : null}
                      {action.label}
                    </span>
                  </Button>
                );
              })}
            </div>
            <div>
              <Button
                size="sm"
                color="primary"
                onPress={() => runSelectedAction("Execute Dogecoin", dogeActions, selectedDogeActionId)}
              >
                Execute
              </Button>
            </div>
          </section>
        </div>

        {/* Test Output Panel */}
        <div className="h-fit sticky top-4">
          <section className="rounded-lg border border-content2 p-4 space-y-3 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold">Test Output</h3>
                <p className="text-xs text-foreground/60">Latest results appear first</p>
              </div>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <span className="text-xs text-foreground/50">
                    {logs.length} result{logs.length !== 1 ? "s" : ""}
                  </span>
                )}
                <Button size="sm" variant="bordered" onPress={() => setLogs([])}>
                  Clear Logs
                </Button>
              </div>
            </div>
            {logs.length === 0 ? (
              <div className="text-sm text-foreground/50 py-8 text-center">No tests run yet.</div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-content2 bg-content1/40 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{log.title}</span>
                      <span className={`text-xs ${log.status === "success" ? "text-success" : "text-danger"}`}>
                        {log.status.toUpperCase()} • {log.timestamp}
                      </span>
                    </div>
                    {log.payload !== undefined && (
                      <pre className="mt-2 whitespace-pre-wrap break-words text-foreground/70 bg-background/50 p-2 rounded border border-content2 overflow-x-auto" style={{ borderWidth: "0.5px" }}>
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

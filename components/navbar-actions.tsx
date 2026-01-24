"use client";

import { Button } from "@tomo-inc/tomo-ui";
import { useAccount, useWalletConnect } from "@dogeos/dogeos-sdk";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { AddressDisplay } from "./address-display";

export function NavbarActions() {
  const { isConnected, disconnect, openModal } = useWalletConnect();
  const { address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  const handleAddressClick = () => {
    if (isConnected) {
      openModal();
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      if (typeof window !== "undefined") {
        if (pathname !== "/") {
          window.location.href = "/";
        } else {
          router.replace("/");
        }
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div onClick={handleAddressClick} className="cursor-pointer">
        <AddressDisplay address={address} onClick={handleAddressClick} />
      </div>
      <Button onPress={handleDisconnect} color="primary" variant="light" size="sm" className="cursor-pointer">
        Disconnect
      </Button>
    </div>
  );
}

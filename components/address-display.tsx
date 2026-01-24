"use client";

import React, { useState } from "react";
import { Button } from "@tomo-inc/tomo-ui";

interface AddressDisplayProps {
  address: string;
  className?: string;
  onClick?: () => void;
}

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

export function AddressDisplay({ address, className = "", onClick }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!address) {
    return null;
  }

  const formatAddress = (addr: string): string => {
    if (addr.length <= 8) {
      return addr;
    }
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      <span className="font-mono text-sm text-foreground">{formatAddress(address)}</span>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handleCopy}
        className="min-w-6 w-6 h-6"
        title={copied ? "Copied!" : "Copy address"}
      >
        {copied ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4 text-foreground/60" />}
      </Button>
    </div>
  );
}

"use client";

import { Button } from "@tomo-inc/tomo-ui";
import React, { useEffect, useState } from "react";

interface TestResult {
  success?: boolean;
  data?: unknown;
  error?: string;
  timestamp?: number;
}

interface TestResultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResult | null;
}

export function TestResultDrawer({ isOpen, onClose, result }: TestResultDrawerProps) {
  const [isolatedColors, setIsolatedColors] = useState({
    background: "#FFFFFF",
    foreground: "#000000",
    content2: "#E4E4E7",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getThemeFromDOM = (): "light" | "dark" => {
      const html = document.documentElement;
      if (html.classList.contains("dark")) return "dark";
      if (html.classList.contains("light")) return "light";
      const dataTheme = html.getAttribute("data-theme");
      if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
      return "light";
    };

    const updateColors = () => {
      const theme = getThemeFromDOM();
      const isDark = theme === "dark";
      setIsolatedColors({
        background: isDark ? "#000000" : "#FFFFFF",
        foreground: isDark ? "#FFFFFF" : "#000000",
        content2: isDark ? "#27272A" : "#E4E4E7",
      });
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  if (!isOpen || !result) return null;

  const resultString = JSON.stringify(result, null, 2);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-96 z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col"
        style={{
          backgroundColor: isolatedColors.background,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 flex items-center justify-between p-4 border-b"
          style={{ borderColor: isolatedColors.content2 }}
        >
          <h3 className="text-lg font-semibold" style={{ color: isolatedColors.foreground }}>
            Test Result
          </h3>
          <Button onPress={onClose} variant="light" size="sm">
            Close
          </Button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <pre
            className="p-4 rounded-lg overflow-x-auto text-sm"
            style={{
              backgroundColor: isolatedColors.content2,
              color: isolatedColors.foreground,
            }}
          >
            {resultString}
          </pre>
        </div>
      </div>
    </>
  );
}

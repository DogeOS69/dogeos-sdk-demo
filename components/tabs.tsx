"use client";

import React, { useEffect, useState } from "react";

interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  className?: string;
  onTabChange?: (key: string) => void;
}

export function Tabs({ items, defaultActiveKey, className = "", onTabChange }: TabsProps) {
  const [activeKey, setActiveKey] = useState<string>(defaultActiveKey || items[0]?.key || "");

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    onTabChange?.(key);
  };
  const [isolatedColors, setIsolatedColors] = useState({
    background: "#FFFFFF",
    foreground: "#000000",
    foregroundMuted: "rgba(0, 0, 0, 0.7)",
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
        foregroundMuted: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
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

  const activeItem = items.find((item) => item.key === activeKey) || items[0];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div
        className="flex-shrink-0 flex border-b"
        style={{
          backgroundColor: isolatedColors.background,
          borderColor: isolatedColors.content2,
        }}
      >
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabChange(item.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeKey === item.key ? "border-b-2 border-primary" : "hover:border-b-2"
            }`}
            style={{
              color: activeKey === item.key ? undefined : isolatedColors.foregroundMuted,
              borderBottomColor: activeKey === item.key ? undefined : isolatedColors.content2,
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: isolatedColors.background }}>
        {activeItem?.content}
      </div>
    </div>
  );
}

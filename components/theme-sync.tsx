"use client";

import { useEffect } from "react";
import { useTheme as useTomoTheme } from "@tomo-inc/tomo-ui";

export function ThemeSync() {
  const { setTheme: setTomoTheme } = useTomoTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getThemeFromDOM = (): "light" | "dark" => {
      const html = document.documentElement;
      if (html.classList.contains("dark")) {
        return "dark";
      }
      if (html.classList.contains("light")) {
        return "light";
      }
      const dataTheme = html.getAttribute("data-theme");
      if (dataTheme === "dark" || dataTheme === "light") {
        return dataTheme;
      }
      return "light";
    };

    const initialTheme = getThemeFromDOM();
    setTomoTheme(initialTheme);

    const observer = new MutationObserver(() => {
      const currentTheme = getThemeFromDOM();
      setTomoTheme(currentTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, [setTomoTheme]);

  return null;
}

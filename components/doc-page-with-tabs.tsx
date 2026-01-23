"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Tabs } from "./tabs";
import { TestResultDrawer } from "./test-result-drawer";

interface TestResult {
  success?: boolean;
  data?: unknown;
  error?: string;
  timestamp?: number;
}

interface DocPageContextType {
  setTestResult: (result: TestResult | null) => void;
  openTestResult: () => void;
  closeTestResult: () => void;
  isTestResultOpen: boolean;
}

const DocPageContext = createContext<DocPageContextType | null>(null);

export function useDocPage() {
  const context = useContext(DocPageContext);
  if (!context) {
    throw new Error("useDocPage must be used within DocPageWithTabs");
  }
  return context;
}

interface DocPageWithTabsProps {
  children: React.ReactNode;
  previewContent: React.ReactNode;
  codeContent: string;
}

export function DocPageWithTabs({ children, previewContent, codeContent }: DocPageWithTabsProps) {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestResultOpen, setIsTestResultOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const lastResultRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeTab !== "preview") {
      setIsTestResultOpen(false);
    }
  }, [activeTab]);

  const handleSetTestResult = useCallback(
    (result: TestResult | null) => {
      const resultString = JSON.stringify(result);
      const hasChanged = resultString !== lastResultRef.current;

      setTestResult(result);
      lastResultRef.current = resultString;

      if (result && hasChanged && activeTab === "preview") {
        setIsTestResultOpen(true);
      }
    },
    [activeTab],
  );

  const openTestResult = useCallback(() => {
    if (testResult) {
      setIsTestResultOpen(true);
    }
  }, [testResult]);

  const closeTestResult = useCallback(() => {
    setIsTestResultOpen(false);
  }, []);

  const tabItems = [
    {
      key: "preview",
      label: "Preview",
      content: (
        <div className="p-4">
          <DocPageContext.Provider
            value={{
              setTestResult: handleSetTestResult,
              openTestResult,
              closeTestResult,
              isTestResultOpen,
            }}
          >
            {previewContent}
          </DocPageContext.Provider>
        </div>
      ),
    },
    {
      key: "code",
      label: "Code",
      content: (
        <div className="p-4 overflow-auto">
          <pre className="p-4 rounded-lg overflow-x-auto text-sm bg-content1 text-foreground">
            <code>{codeContent}</code>
          </pre>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {children}
          <Tabs items={tabItems} defaultActiveKey={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
      <TestResultDrawer isOpen={isTestResultOpen} onClose={closeTestResult} result={testResult} />
    </>
  );
}

"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlockWithCopy({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-3 py-1.5 text-xs font-medium rounded-md bg-content2 text-foreground hover:bg-content1 transition-colors opacity-0 group-hover:opacity-100"
        type="button"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="bg-content1 text-foreground p-4 rounded-lg overflow-x-auto border border-content2">
        <code className={`language-${language || "text"}`}>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <style>{`
        .prose pre {
          background: var(--heroui-content1);
          color: var(--heroui-foreground);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          position: relative;
          border: 1px solid var(--heroui-content2);
        }
        .prose code {
          background: var(--heroui-content2);
          color: var(--heroui-foreground);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .prose pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
        }
        .prose th,
        .prose td {
          border: 1px solid var(--heroui-content2);
          padding: 0.5rem;
        }
        .prose th {
          background: var(--heroui-content1);
        }
        .prose h1 {
          font-size: 2.25em;
          line-height: 1.2;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          font-weight: 700;
          color: var(--heroui-foreground);
        }
        .prose h2 {
          font-size: 1.875em;
          line-height: 1.3;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          font-weight: 700;
          color: var(--heroui-foreground);
        }
        .prose h3 {
          font-size: 1.5em;
          line-height: 1.4;
          margin-top: 1.25em;
          margin-bottom: 0.625em;
          font-weight: 600;
          color: var(--heroui-foreground);
        }
        .prose h4 {
          font-size: 1.25em;
          line-height: 1.5;
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
          color: var(--heroui-foreground);
        }
        .prose h5, .prose h6 {
          font-size: 1.125em;
          line-height: 1.5;
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
          color: var(--heroui-foreground);
        }
        .prose p {
          font-size: 0.9375em;
          line-height: 1.75;
          margin-top: 0.875em;
          margin-bottom: 0.875em;
          color: var(--heroui-foreground);
          opacity: 0.85;
        }
        .prose ul, .prose ol {
          margin-top: 1em;
          margin-bottom: 1em;
          padding-left: 1.5em;
        }
        .prose li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose blockquote {
          border-left: 4px solid var(--heroui-content2);
          padding-left: 1em;
          margin: 1em 0;
          color: var(--heroui-foreground);
          opacity: 0.7;
        }
        .prose a {
          color: var(--heroui-primary);
          text-decoration: underline;
        }
        .prose a:hover {
          color: var(--heroui-primary);
          opacity: 0.8;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className || !match;

            const extractText = (node: unknown): string => {
              if (typeof node === "string") return node;
              if (typeof node === "number") return String(node);
              if (node === null || node === undefined) return "";
              if (Array.isArray(node)) {
                return node.map(extractText).join("");
              }
              if (typeof node === "object" && node !== null) {
                const nodeObj = node as Record<string, unknown>;
                if (
                  "props" in nodeObj &&
                  nodeObj.props &&
                  typeof nodeObj.props === "object" &&
                  nodeObj.props !== null
                ) {
                  const props = nodeObj.props as Record<string, unknown>;
                  if ("children" in props) {
                    return extractText(props.children);
                  }
                }
                return "";
              }
              return "";
            };

            const codeString = extractText(children);
            const code = codeString.replace(/\n$/, "");

            if (!isInline && code) {
              return <CodeBlockWithCopy code={code} language={language} />;
            }

            const inlineCodeText = extractText(children);

            return (
              <code className={className} {...props}>
                {inlineCodeText || children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

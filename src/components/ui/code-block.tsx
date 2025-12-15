"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showCopy?: boolean
  className?: string
}

function ReactLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
    >
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.4">
        <ellipse cx="12" cy="12" rx="9.5" ry="4.2" />
        <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(120 12 12)" />
      </g>
    </svg>
  )
}

function LanguageLogo({ language }: { language: string }) {
  const normalized = language.trim().toLowerCase()

  if (normalized === "tsx" || normalized === "jsx") {
    return <ReactLogo className="text-[#61dafb]" />
  }

  const config =
    normalized === "ts"
      ? { label: "TS", bg: "bg-[#3178c6]" }
      : normalized === "js" || normalized === "javascript"
        ? { label: "JS", bg: "bg-[#f7df1e]", fg: "text-black" }
        : normalized === "css"
          ? { label: "CSS", bg: "bg-[#2965f1]" }
          : normalized === "html"
            ? { label: "HTML", bg: "bg-[#e34c26]" }
            : normalized === "json"
              ? { label: "{}", bg: "bg-muted" }
              : { label: normalized.slice(0, 3).toUpperCase() || "TXT", bg: "bg-muted" }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 items-center justify-center rounded px-1.5 text-[10px] font-bold tracking-wide",
        config.bg,
        config.fg ?? "text-white"
      )}
    >
      {config.label}
    </span>
  )
}

export function CodeBlock({
  code,
  language = "tsx",
  filename,
  showCopy = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 900)
    } catch {
      setCopied(false)
    }
  }

  const customStyle = {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-muted/30 overflow-hidden",
        className
      )}
    >
      {filename && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <LanguageLogo language={language} />
            <span className="text-sm text-muted-foreground font-mono">
              {filename}
            </span>
          </div>
          {showCopy && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 px-2"
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>
      )}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={customStyle}
          wrapLines={true}
          showLineNumbers={false}
        >
          {code}
        </SyntaxHighlighter>
        {!filename && showCopy && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute right-2 top-2"
            onClick={handleCopy}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
    </div>
  )
}

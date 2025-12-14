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
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-muted-foreground/20" />
              <div className="size-3 rounded-full bg-muted-foreground/20" />
              <div className="size-3 rounded-full bg-muted-foreground/20" />
            </div>
            <span className="text-sm text-muted-foreground font-mono ml-2">
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

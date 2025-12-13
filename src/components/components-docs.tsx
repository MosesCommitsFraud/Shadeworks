"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModernSlider } from "@/components/ui/modern-slider"

type ComponentEntry = {
  id: string
  name: string
  description: string
  code: string
  Preview: () => React.ReactNode
}

function useComponentRegistry() {
  return useMemo<ComponentEntry[]>(
    () => [
      {
        id: "modern-slider",
        name: "Modern Slider",
        description: "Custom slider with connected pill end-cap and smooth pointer dragging.",
        code: `<ModernSlider
  label="Strength"
  value={value}
  min={0}
  max={100}
  step={1}
  onChange={setValue}
/>`,
        Preview: function Preview() {
          const [value, setValue] = useState(55)
          return (
            <div className="max-w-sm">
              <ModernSlider label="Strength" value={value} min={0} max={100} step={1} onChange={setValue} />
            </div>
          )
        },
      },
      {
        id: "buttons",
        name: "Buttons",
        description: "Baseline shadcn buttons (primary/secondary/ghost).",
        code: `<div className="flex gap-2">
  <Button>Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
</div>`,
        Preview: function Preview() {
          return (
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          )
        },
      },
    ],
    []
  )
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-sm">
        <code className="text-foreground/90">{code}</code>
      </pre>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="absolute right-2 top-2"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 900)
          } catch {
            setCopied(false)
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}

export function ComponentsDocs() {
  const registry = useComponentRegistry()
  const [activeId, setActiveId] = useState(registry[0]?.id ?? "")

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="sticky top-20 self-start">
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Browse</div>
          <nav className="grid gap-1">
            {registry.map((entry) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                className={cn(
                  "rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted",
                  activeId === entry.id ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setActiveId(entry.id)}
              >
                {entry.name}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="space-y-8">
        {registry.map((entry) => (
          <section
            key={entry.id}
            id={entry.id}
            className="scroll-mt-24"
            onMouseEnter={() => setActiveId(entry.id)}
            onFocus={() => setActiveId(entry.id)}
          >
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">{entry.name}</CardTitle>
                <CardDescription>{entry.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border bg-background p-5">
                  <entry.Preview />
                </div>
                <CodeBlock code={entry.code} />
              </CardContent>
            </Card>
          </section>
        ))}
      </div>
    </div>
  )
}

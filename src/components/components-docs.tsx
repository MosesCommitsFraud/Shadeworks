"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
        id: "slider",
        name: "Slider",
        description: "Smooth animated slider with track height transitions and glow effects.",
        code: `<Slider
  label="Strength"
  showValue
  unit="%"
  value={[value]}
  onValueChange={([v]) => setValue(v)}
  min={0}
  max={100}
  step={1}
/>`,
        Preview: function Preview() {
          const [value, setValue] = useState(55)
          return (
            <div className="max-w-sm">
              <Slider
                label="Strength"
                showValue
                unit="%"
                value={[value]}
                onValueChange={([v]) => setValue(v)}
                min={0}
                max={100}
                step={1}
              />
            </div>
          )
        },
      },
      {
        id: "buttons",
        name: "Buttons",
        description: "Baseline shadcn buttons with smooth click animations.",
        code: `<div className="flex gap-2">
  <Button>Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>
</div>`,
        Preview: function Preview() {
          return (
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          )
        },
      },
      {
        id: "dropdown",
        name: "Dropdown Menu",
        description: "Action menu with smooth animations, nested submenus, and keyboard shortcut hints.",
        code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuGroup>
      <DropdownMenuItem>
        Profile
        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Settings
        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Email</DropdownMenuItem>
          <DropdownMenuItem>Message</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Support</DropdownMenuItem>
    <DropdownMenuItem disabled>API</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      Sign Out
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
        Preview: function Preview() {
          return (
            <div className="flex items-center justify-center py-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      Profile
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Billing
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Email</DropdownMenuItem>
                        <DropdownMenuItem>Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>More...</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                      New Team
                      <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>GitHub</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuItem disabled>API</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Sign Out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
      {
        id: "select",
        name: "Select",
        description: "Polished select with accent border highlights, smooth animations, and sliding text on hover.",
        code: `<div className="space-y-2">
  <Label>Dithering Algorithm</Label>
  <Select value={value} onValueChange={setValue}>
    <SelectTrigger>
      <SelectValue placeholder="Choose an algorithm" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="floyd">Floyd-Steinberg</SelectItem>
      <SelectItem value="atkinson">Atkinson</SelectItem>
      <SelectItem value="ordered">Ordered (Bayer)</SelectItem>
      <SelectItem value="stucki">Stucki</SelectItem>
      <SelectItem value="sierra">Sierra</SelectItem>
    </SelectContent>
  </Select>
</div>`,
        Preview: function Preview() {
          const [value, setValue] = useState("floyd")
          return (
            <div className="max-w-xs space-y-2">
              <Label>Dithering Algorithm</Label>
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="floyd">Floyd-Steinberg</SelectItem>
                  <SelectItem value="atkinson">Atkinson</SelectItem>
                  <SelectItem value="ordered">Ordered (Bayer)</SelectItem>
                  <SelectItem value="stucki">Stucki</SelectItem>
                  <SelectItem value="sierra">Sierra</SelectItem>
                  <SelectItem value="jarvis">Jarvis-Judice-Ninke</SelectItem>
                  <SelectItem value="burkes">Burkes</SelectItem>
                  <SelectItem value="false">False Floyd-Steinberg</SelectItem>
                </SelectContent>
              </Select>
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

"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock as StyledCodeBlock } from "@/components/ui/code-block"
import { ArrowLeft, ArrowRight } from "lucide-react"

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
      {
        id: "tabs",
        name: "Tabs",
        description: "Tab navigation with moving secondary background highlight and smooth content transitions.",
        code: `<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <div className="rounded-lg border bg-background p-6">
      <p className="text-sm text-muted-foreground">
        Account settings here.
      </p>
    </div>
  </TabsContent>
  <TabsContent value="password">
    <div className="rounded-lg border bg-background p-6">
      <p className="text-sm text-muted-foreground">
        Password settings here.
      </p>
    </div>
  </TabsContent>
</Tabs>`,
        Preview: function Preview() {
          return (
            <div className="max-w-md">
              <Tabs defaultValue="account">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <div className="rounded-lg border bg-background p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <input
                        id="name"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:border-foreground/20 focus:bg-muted/30"
                        defaultValue="Pedro Duarte"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <input
                        id="username"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:border-foreground/20 focus:bg-muted/30"
                        defaultValue="@peduarte"
                      />
                    </div>
                    <Button>Save changes</Button>
                  </div>
                </TabsContent>
                <TabsContent value="password">
                  <div className="rounded-lg border bg-background p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Current password</Label>
                      <input
                        id="current"
                        type="password"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:border-foreground/20 focus:bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">New password</Label>
                      <input
                        id="new"
                        type="password"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:border-foreground/20 focus:bg-muted/30"
                      />
                    </div>
                    <Button>Save password</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )
        },
      },
      {
        id: "code-block",
        name: "Code Block",
        description: "Styled code block with syntax highlighting, copy button, and optional filename header.",
        code: `<StyledCodeBlock
  code={\`function hello() {
  console.log("Hello, World!")
}\`}
  language="tsx"
  filename="example.tsx"
/>`,
        Preview: function Preview() {
          const sampleCode = `'use client'

import * as React from 'react'

type MyComponentProps = {
  myProps: string
} & React.ComponentProps<'div'>

function MyComponent(props: MyComponentProps) {
  return (
    <div {...props}>
      <p>My Component</p>
    </div>
  )
}

export { MyComponent, type MyComponentProps }`

          return (
            <div className="max-w-2xl">
              <StyledCodeBlock
                code={sampleCode}
                language="tsx"
                filename="my-component.tsx"
              />
            </div>
          )
        },
      },
    ],
    []
  )
}

export function ComponentsDocs() {
  const registry = useComponentRegistry()
  const [activeId, setActiveId] = useState(registry[0]?.id ?? "")

  const currentIndex = registry.findIndex((entry) => entry.id === activeId)
  const prevComponent = currentIndex > 0 ? registry[currentIndex - 1] : null
  const nextComponent = currentIndex < registry.length - 1 ? registry[currentIndex + 1] : null

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavigate = (id: string) => {
    setActiveId(id)
    scrollToTop()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="sticky top-20 self-start">
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Browse</div>
          <nav className="grid gap-1">
            {registry.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={cn(
                  "rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted text-left",
                  activeId === entry.id ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
                onClick={() => handleNavigate(entry.id)}
              >
                {entry.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="space-y-8">
        {registry
          .filter((entry) => entry.id === activeId)
          .map((entry) => (
            <section
              key={entry.id}
              id={entry.id}
              className="scroll-mt-24"
            >
              <div className="space-y-6">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">{entry.name}</CardTitle>
                    <CardDescription>{entry.description}</CardDescription>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="preview">
                  <TabsList>
                    <TabsTrigger value="preview">
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      Code
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview">
                    <div className="rounded-lg border bg-background p-6">
                      <entry.Preview />
                    </div>
                  </TabsContent>
                  <TabsContent value="code">
                    <StyledCodeBlock code={entry.code} language="tsx" filename={`${entry.id}.tsx`} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-8">
                {prevComponent ? (
                  <Button
                    variant="outline"
                    onClick={() => handleNavigate(prevComponent.id)}
                  >
                    <ArrowLeft className="mr-2" />
                    {prevComponent.name}
                  </Button>
                ) : (
                  <div />
                )}

                {nextComponent ? (
                  <Button
                    variant="outline"
                    onClick={() => handleNavigate(nextComponent.id)}
                  >
                    {nextComponent.name}
                    <ArrowRight className="ml-2" />
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </section>
          ))}
      </div>
    </div>
  )
}

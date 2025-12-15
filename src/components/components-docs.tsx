"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
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
import { ArrowLeft, ArrowRight, Download, Heart, Settings } from "lucide-react"
import { AnimateCursorApiReference, AnimateCursorFollowPreview, AnimateCursorMinimalPreview } from "@/components/animate-ui/docs/animate-cursor-docs"
import { PropsTable, type PropRow } from "@/components/docs/props-table"

type PreviewVariant = {
  id: string
  name: string
  description?: string
  code: string
  Preview: () => React.ReactNode
}

type ComponentEntry = {
  id: string
  name: string
  description: string
  code: string
  previewVariants?: PreviewVariant[]
  Preview: () => React.ReactNode
  ApiReference?: () => React.ReactNode
}

function useComponentRegistry() {
  return useMemo<ComponentEntry[]>(
    () => [
      {
        id: "animate-cursor",
        name: "Cursor",
        description: "Animated cursor + optional follow label (Animate UI).",
        code: `'use client'

import { CursorProvider, Cursor } from "@/components/animate-ui/components/animate/cursor"

export function Demo() {
  return (
    <div className="relative overflow-hidden rounded-lg border">
      <div className="p-10">
        <p className="text-sm text-muted-foreground">Move your cursor here.</p>
      </div>

      <CursorProvider className="absolute inset-0">
        <Cursor className="text-foreground" />
      </CursorProvider>
    </div>
  )
}`,
        previewVariants: [
          {
            id: "minimal",
            name: "Minimal",
            description: "Barebones cursor inside a container.",
            code: `import { CursorProvider, Cursor } from "@/components/animate-ui/components/animate/cursor"

export function Example() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background min-h-[320px]">
      <div className="p-10">
        <p className="text-sm text-muted-foreground">Move your cursor here.</p>
      </div>
      <CursorProvider className="absolute inset-0">
        <Cursor className="text-foreground" />
      </CursorProvider>
    </div>
  )
}`,
            Preview: function Preview() {
              return <AnimateCursorMinimalPreview />
            },
          },
          {
            id: "follow",
            name: "Follow Label",
            description: "Cursor with a follow label tooltip.",
            code: `import { CursorProvider, Cursor, CursorFollow } from "@/components/animate-ui/components/animate/cursor"

export function Example() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background min-h-[320px]">
      <div className="p-10">
        <p className="text-sm text-muted-foreground">Move your cursor here.</p>
      </div>
      <CursorProvider className="absolute inset-0">
        <Cursor className="text-foreground" />
        <CursorFollow>Cursor Follow</CursorFollow>
      </CursorProvider>
    </div>
  )
}`,
            Preview: function Preview() {
              return <AnimateCursorFollowPreview />
            },
          },
        ],
        Preview: function Preview() {
          return <AnimateCursorFollowPreview />
        },
        ApiReference: function ApiReference() {
          return <AnimateCursorApiReference />
        },
      },
      {
        id: "buttons",
        name: "Button",
        description: "Interactive buttons with smooth click animations and multiple style variants.",
        code: `'use client'

import { Button } from "@/components/ui/button"

export function Example() {
  return <Button>Button</Button>
}`,
        previewVariants: [
          {
            id: "wrap",
            name: "Wrap",
            description: "Buttons in a wrapping row.",
            code: `<div className="flex flex-wrap gap-2">
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
            id: "toolbar",
            name: "Toolbar",
            description: "Icon-style buttons in a dense toolbar.",
            code: `<div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2">
  <Button size="icon" variant="outline" aria-label="Like">
    <Heart className="size-4" />
  </Button>
  <Button size="icon" variant="outline" aria-label="Download">
    <Download className="size-4" />
  </Button>
  <Button size="icon" variant="outline" aria-label="Settings">
    <Settings className="size-4" />
  </Button>
  <div className="w-px self-stretch bg-border mx-1" />
  <Button variant="secondary">Share</Button>
</div>`,
            Preview: function Preview() {
              return (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2">
                  <Button size="icon" variant="outline" aria-label="Like">
                    <Heart className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" aria-label="Download">
                    <Download className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" aria-label="Settings">
                    <Settings className="size-4" />
                  </Button>
                  <div className="w-px self-stretch bg-border mx-1" />
                  <Button variant="secondary">Share</Button>
                </div>
              )
            },
          },
        ],
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
        ApiReference: function ApiReference() {
          const rows: PropRow[] = [
            {
              prop: "variant",
              type: `"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"`,
              defaultValue: `"default"`,
              description: "Visual variant from `buttonVariants`.",
            },
            {
              prop: "size",
              type: `"default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"`,
              defaultValue: `"default"`,
              description: "Size variant from `buttonVariants`.",
            },
            {
              prop: "asChild",
              type: "boolean",
              defaultValue: "false",
              description: "Renders a Radix `Slot` instead of a `button`.",
            },
            {
              prop: "...props",
              type: `React.ComponentProps<"button">`,
              defaultValue: "—",
              description: "All standard button props.",
            },
          ]

          return (
            <PropsTable title="Button" rows={rows} />
          )
        },
      },
      {
        id: "code-block",
        name: "Code Block",
        description: "Styled code block with syntax highlighting, copy button, and optional filename header.",
        code: `'use client'

import { CodeBlock } from "@/components/ui/code-block"

export function Example() {
  return <CodeBlock code={\`console.log("Hello")\`} language="tsx" />
}`,
        previewVariants: [
          {
            id: "filename",
            name: "With Filename",
            code: `const sampleCode = \`console.log("Hello")\`

<CodeBlock
  code={sampleCode}
  language="tsx"
  filename="my-component.tsx"
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
                <StyledCodeBlock
                  code={sampleCode}
                  language="tsx"
                  filename="my-component.tsx"
                />
              )
            },
          },
          {
            id: "overlay",
            name: "Overlay Copy",
            description: "No filename (copy button overlays the code).",
            code: `<CodeBlock code={\`console.log("copy me")\`} language="tsx" />`,
            Preview: function Preview() {
              return (
                <StyledCodeBlock
                  code={`console.log("copy me")\n`}
                  language="tsx"
                />
              )
            },
          },
        ],
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
            <StyledCodeBlock
              code={sampleCode}
              language="tsx"
              filename="my-component.tsx"
            />
          )
        },
        ApiReference: function ApiReference() {
          const rows: PropRow[] = [
            { prop: "code", type: "string", defaultValue: "—", description: "Code string to render." },
            { prop: "language", type: "string", defaultValue: `"tsx"`, description: "Syntax highlighter language." },
            { prop: "filename", type: "string", defaultValue: "—", description: "Optional filename header." },
            { prop: "showCopy", type: "boolean", defaultValue: "true", description: "Shows the copy button." },
            { prop: "className", type: "string", defaultValue: "—", description: "Wrapper className." },
          ]

          return (
            <PropsTable title="CodeBlock" rows={rows} />
          )
        },
      },
      {
        id: "dropdown",
        name: "Dropdown Menu",
        description: "Action menu with smooth animations, nested submenus, and keyboard shortcut hints.",
        code: `'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`,
        previewVariants: [
          {
            id: "simple",
            name: "Simple",
            code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-48">
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
            Preview: function Preview() {
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            },
          },
          {
            id: "groups",
            name: "With Groups",
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
        Billing
        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Settings
        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Support</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
            Preview: function Preview() {
              return (
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
                    <DropdownMenuItem>Support</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            },
          },
        ],
        Preview: function Preview() {
          return (
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
          )
        },
        ApiReference: function ApiReference() {
          const contentRows: PropRow[] = [
            {
              prop: "sideOffset",
              type: "number",
              defaultValue: "4",
              description: "Passed to Radix `DropdownMenuPrimitive.Content`.",
            },
            {
              prop: "className",
              type: "string",
              defaultValue: "—",
              description: "Merged into the default content classes.",
            },
            {
              prop: "...props",
              type: "React.ComponentProps<typeof DropdownMenuPrimitive.Content>",
              defaultValue: "—",
              description: "All Radix content props.",
            },
          ]

          const itemRows: PropRow[] = [
            { prop: "inset", type: "boolean", defaultValue: "—", description: "Adds left padding when true." },
            {
              prop: "variant",
              type: `"default" | "destructive"`,
              defaultValue: `"default"`,
              description: "Styles the item via `data-variant`.",
            },
            {
              prop: "...props",
              type: "React.ComponentProps<typeof DropdownMenuPrimitive.Item>",
              defaultValue: "—",
              description: "All Radix item props.",
            },
          ]

          return (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                This file is a thin wrapper around `@radix-ui/react-dropdown-menu` primitives.
              </div>
              <PropsTable title="DropdownMenuContent" rows={contentRows} />
              <PropsTable title="DropdownMenuItem" rows={itemRows} />
            </div>
          )
        },
      },
      {
        id: "select",
        name: "Select",
        description: "Polished select with border highlights, smooth animations, and sliding text on hover.",
        code: `'use client'

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Example() {
  const [value, setValue] = useState("one")

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">One</SelectItem>
      </SelectContent>
    </Select>
  )
}`,
        previewVariants: [
          {
            id: "compact",
            name: "Compact",
            code: `<div className="w-64 space-y-2">
  <Label>Algorithm</Label>
  <Select value={value} onValueChange={setValue}>
    <SelectTrigger>
      <SelectValue placeholder="Choose an algorithm" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="floyd">Floyd-Steinberg</SelectItem>
      <SelectItem value="atkinson">Atkinson</SelectItem>
      <SelectItem value="ordered">Ordered</SelectItem>
    </SelectContent>
  </Select>
</div>`,
            Preview: function Preview() {
              const [value, setValue] = useState("floyd")
              return (
                <div className="w-64 space-y-2">
                  <Label>Algorithm</Label>
                  <Select value={value} onValueChange={setValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="floyd">Floyd-Steinberg</SelectItem>
                      <SelectItem value="atkinson">Atkinson</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )
            },
          },
          {
            id: "form",
            name: "In Form",
            description: "Select inside a form-like card.",
            code: `<div className="w-96 rounded-lg border bg-muted/10 p-6 space-y-4">
  <div className="space-y-2">
    <Label>Algorithm</Label>
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue placeholder="Choose an algorithm" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="floyd">Floyd-Steinberg</SelectItem>
        <SelectItem value="atkinson">Atkinson</SelectItem>
        <SelectItem value="ordered">Ordered</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <p className="text-xs text-muted-foreground">This value is used by the editor.</p>
</div>`,
            Preview: function Preview() {
              const [value, setValue] = useState("floyd")
              return (
                <div className="w-96 rounded-lg border bg-muted/10 p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Algorithm</Label>
                    <Select value={value} onValueChange={setValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floyd">Floyd-Steinberg</SelectItem>
                        <SelectItem value="atkinson">Atkinson</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">This value is used by the editor.</p>
                </div>
              )
            },
          },
        ],
        Preview: function Preview() {
          const [value, setValue] = useState("floyd")
          return (
            <div className="w-80 space-y-2">
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
        ApiReference: function ApiReference() {
          const triggerRows: PropRow[] = [
            {
              prop: "...props",
              type: "React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>",
              defaultValue: "—",
              description: "All Radix trigger props (forwardRef).",
            },
          ]

          const contentRows: PropRow[] = [
            {
              prop: "position",
              type: "string",
              defaultValue: `"popper"`,
              description: "Forwarded to Radix content; affects layout classes.",
            },
            {
              prop: "...props",
              type: "React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>",
              defaultValue: "—",
              description: "All Radix content props (forwardRef).",
            },
          ]

          const itemRows: PropRow[] = [
            {
              prop: "...props",
              type: "React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>",
              defaultValue: "—",
              description: "All Radix item props (forwardRef).",
            },
          ]

          return (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                `Select` is a re-export of Radix `SelectPrimitive.Root`; the other exports are forwardRef wrappers.
              </div>
              <PropsTable title="SelectTrigger" rows={triggerRows} />
              <PropsTable title="SelectContent" rows={contentRows} />
              <PropsTable title="SelectItem" rows={itemRows} />
            </div>
          )
        },
      },
      {
        id: "slider",
        name: "Slider",
        description: "Smooth animated slider with track height transitions and glow effects.",
        code: `'use client'

import { useState } from "react"
import { Slider } from "@/components/ui/slider"

export function Example() {
  const [value, setValue] = useState(50)

  return (
    <Slider
      value={[value]}
      onValueChange={([v]) => setValue(v)}
    />
  )
}`,
        previewVariants: [
          {
            id: "labeled",
            name: "Labeled",
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
                <div className="w-96">
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
            id: "disabled",
            name: "Disabled",
            description: "Non-interactive state.",
            code: `<Slider label="Strength" showValue unit="%" value={[55]} disabled />`,
            Preview: function Preview() {
              return (
                <div className="w-96">
                  <Slider label="Strength" showValue unit="%" value={[55]} disabled />
                </div>
              )
            },
          },
        ],
        Preview: function Preview() {
          const [value, setValue] = useState(55)
          return (
            <div className="w-96">
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
        ApiReference: function ApiReference() {
          const rows: PropRow[] = [
            { prop: "min", type: "number", defaultValue: "0", description: "Minimum value." },
            { prop: "max", type: "number", defaultValue: "100", description: "Maximum value." },
            { prop: "step", type: "number", defaultValue: "1", description: "Step increment." },
            { prop: "defaultValue", type: "number | number[]", defaultValue: "50", description: "Initial value." },
            { prop: "value", type: "number | number[]", defaultValue: "—", description: "Controlled value." },
            { prop: "onChange", type: "(value: number) => void", defaultValue: "—", description: "Called with the normalized number value." },
            { prop: "onValueChange", type: "(value: number[]) => void", defaultValue: "—", description: "Called with a 1-length array value." },
            { prop: "label", type: "string", defaultValue: "—", description: "Optional label used for aria-label and UI." },
            { prop: "showValue", type: "boolean", defaultValue: "false", description: "Shows the current value in the header." },
            { prop: "unit", type: "string", defaultValue: "—", description: "Optional unit shown next to the value." },
            { prop: "className", type: "string", defaultValue: "—", description: "Wrapper className." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "Disables interaction." },
          ]

          return (
            <PropsTable title="Slider" rows={rows} />
          )
        },
      },
      {
        id: "tabs",
        name: "Tabs",
        description: "Tab navigation with moving background highlight and smooth content transitions.",
        code: `'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Example() {
  return (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Content</TabsContent>
    </Tabs>
  )
}`,
        previewVariants: [
          {
            id: "simple",
            name: "Simple",
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
                <div className="w-[450px]">
                  <Tabs defaultValue="account">
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
                  </Tabs>
                </div>
              )
            },
          },
          {
            id: "form",
            name: "Form",
            description: "Tabs wrapping a settings form.",
            code: `<div className="w-[450px]">
  <Tabs defaultValue="account">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      <div className="rounded-lg border bg-background p-6 space-y-4">
        {/* form fields */}
      </div>
    </TabsContent>
  </Tabs>
</div>`,
            Preview: function Preview() {
              return (
                <div className="w-[450px]">
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
        ],
        Preview: function Preview() {
          return (
            <div className="w-[450px]">
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
        ApiReference: function ApiReference() {
          const triggerRows: PropRow[] = [
            {
              prop: "onTabChange",
              type: "(value: string) => void",
              defaultValue: "—",
              description: "Internal prop used by `TabsList` to animate the highlight.",
            },
            {
              prop: "registerRef",
              type: "(value: string, ref: HTMLButtonElement | null) => void",
              defaultValue: "—",
              description: "Internal prop used by `TabsList` to measure triggers.",
            },
            {
              prop: "...props",
              type: "React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>",
              defaultValue: "—",
              description: "All Radix trigger props (forwardRef).",
            },
          ]

          return (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                `Tabs` itself is a re-export of Radix `TabsPrimitive.Root`; wrappers add highlight behavior in `TabsList` + `TabsTrigger`.
              </div>
              <PropsTable title="TabsTrigger" rows={triggerRows} />
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
  const [activeId, setActiveId] = useState("introduction")
  const [activePreviewVariantId, setActivePreviewVariantId] = useState<string>("")

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

  const activeEntry = registry.find((entry) => entry.id === activeId)

  useEffect(() => {
    if (!activeEntry?.previewVariants?.length) {
      setActivePreviewVariantId("")
      return
    }
    setActivePreviewVariantId(activeEntry.previewVariants[0].id)
  }, [activeId, activeEntry?.previewVariants])

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="sticky top-20 self-start">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-foreground mb-2">Sections</div>
            <nav className="grid gap-1 pl-2">
              <button
                type="button"
                className={cn(
                  "rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted text-left",
                  activeId === "introduction" ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
                onClick={() => handleNavigate("introduction")}
              >
                Introduction
              </button>
            </nav>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground mb-2">Components</div>
            <nav className="grid gap-1 pl-2">
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
        </div>
      </aside>

      <div className="space-y-8">
        {activeId === "introduction" ? (
          <section className="scroll-mt-24">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Introduction</h2>
              <p className="text-muted-foreground">
                A living documentation page for Shadeworks UI components you can reuse across tools.
              </p>
              <p className="text-muted-foreground">
                Each component is designed with smooth animations, consistent styling, and a muted color palette. Browse the components in the sidebar to see interactive previews and copy the code snippets.
              </p>
              <p className="text-muted-foreground">
                Some entries mirror the Animate UI primitives that power parts of Shadeworks (for example, the Cursor component).
              </p>
            </div>
          </section>
        ) : activeEntry ? (
          <section
            key={activeEntry.id}
            id={activeEntry.id}
            className="scroll-mt-24"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{activeEntry.name}</h2>
                <p className="text-muted-foreground">{activeEntry.description}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Preview</h3>
                {(() => {
                  const previewVariants: PreviewVariant[] =
                    activeEntry.previewVariants?.length
                      ? activeEntry.previewVariants
                      : [
                        {
                          id: "default",
                          name: "Default",
                          code: activeEntry.code,
                          Preview: activeEntry.Preview,
                        },
                      ]

                  const selectedVariant =
                    previewVariants.find((variant) => variant.id === activePreviewVariantId) ??
                    previewVariants[0]

                  return (
                    <div className="space-y-4">
                      {previewVariants.length > 1 ? (
                        <Tabs value={selectedVariant.id} onValueChange={setActivePreviewVariantId}>
                          <TabsList>
                            {previewVariants.map((variant) => (
                              <TabsTrigger key={variant.id} value={variant.id}>
                                {variant.name}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      ) : null}

                      {selectedVariant.description ? (
                        <p className="text-sm text-muted-foreground">{selectedVariant.description}</p>
                      ) : null}

                      <Tabs defaultValue="preview">
                        <TabsList>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="code">Code</TabsTrigger>
                        </TabsList>
                        <TabsContent value="preview">
                          <div className="rounded-lg border bg-background p-12 flex items-center justify-center min-h-[300px]">
                            <selectedVariant.Preview />
                          </div>
                        </TabsContent>
                        <TabsContent value="code">
                          <div className="w-full">
                            <StyledCodeBlock
                              code={selectedVariant.code}
                              language="tsx"
                              filename={`${activeEntry.id}.${selectedVariant.id}.tsx`}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )
                })()}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Usage</h3>
                <div className="w-full">
                  <StyledCodeBlock code={activeEntry.code} language="tsx" filename={`${activeEntry.id}.tsx`} />
                </div>
              </div>

              {activeEntry.ApiReference ? (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold tracking-tight">API Reference</h3>
                  <activeEntry.ApiReference />
                </div>
              ) : null}
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
        ) : null}
      </div>
    </div>
  )
}

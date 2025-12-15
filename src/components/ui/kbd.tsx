import * as React from "react"

import { cn } from "@/lib/utils"

type MacKey =
  | "command"
  | "shift"
  | "option"
  | "control"
  | "tab"
  | "return"
  | "enter"

type KbdProps = React.ComponentProps<"kbd"> & {
  /**
   * Optional list of keys to render.
   * Falls back to parsing string children into a single token.
   */
  keys?: Array<React.ReactNode>
}

const KEY_ALIASES: Record<string, MacKey> = {
  "⌘": "command",
  cmd: "command",
  command: "command",
  meta: "command",
  mod: "command",
  "⇧": "shift",
  shift: "shift",
  "⌥": "option",
  option: "option",
  alt: "option",
  "⌃": "control",
  control: "control",
  ctrl: "control",
  "⇥": "tab",
  tab: "tab",
  "↩": "return",
  "↵": "return",
  return: "return",
  enter: "enter",
}

const iconStrokeWidth = 1.9

const MacCommandIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
  </svg>
)

const MacShiftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="m12 4 7 8h-4v8h-6v-8H5z" />
  </svg>
)

const MacOptionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M4 5h7l6 14h3" />
    <path d="M14 5h6" />
  </svg>
)

const MacControlIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M5 16 12 8l7 8" />
  </svg>
)

const MacTabIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M4 8v8" />
    <path d="M4 12h12" />
    <path d="m13 8 5 4-5 4" />
  </svg>
)

const MacReturnIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <polyline points="10 10 5 15 10 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H5" />
  </svg>
)

const KEY_ICONS: Record<MacKey, (props: React.SVGProps<SVGSVGElement>) => JSX.Element> = {
  command: MacCommandIcon,
  shift: MacShiftIcon,
  option: MacOptionIcon,
  control: MacControlIcon,
  tab: MacTabIcon,
  return: MacReturnIcon,
  enter: MacReturnIcon,
}

function normalizeKeys(keys?: Array<React.ReactNode>, children?: React.ReactNode) {
  if (keys && keys.length > 0) {
    return keys
  }

  if (typeof children === "string") {
    const trimmed = children.trim()
    if (!trimmed) return []
    return trimmed.split(/\s+/).filter(Boolean)
  }

  return React.Children.toArray(children)
}

function renderKey(key: React.ReactNode, index: number) {
  if (typeof key === "string") {
    const normalized = KEY_ALIASES[key.toLowerCase()]

    if (normalized) {
      const Icon = KEY_ICONS[normalized]
      return <Icon className="h-[1em] w-[1em] shrink-0" key={`${normalized}-${index}`} />
    }

    return (
      <span className="leading-none" key={`${key}-${index}`}>
        {key}
      </span>
    )
  }

  return <React.Fragment key={index}>{key}</React.Fragment>
}

function KbdBase({
  className,
  keys,
  children,
  dataSlot,
  spacing = "gap-1.5 px-3 py-1.5",
  ...props
}: KbdProps & { dataSlot: string; spacing?: string }) {
  const content = normalizeKeys(keys, children)

  return (
    <kbd
      data-slot={dataSlot}
      className={cn(
        "inline-flex items-center rounded-[8px] border border-white/3 bg-neutral-900/80 text-sm font-medium leading-none text-neutral-100 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur select-none",
        spacing,
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background",
        "dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )}
      {...props}
    >
      {content.map(renderKey)}
    </kbd>
  )
}

function Kbd({ className, keys, children, ...props }: KbdProps) {
  return (
    <KbdBase className={className} dataSlot="kbd" keys={keys} spacing="gap-0.5 px-2 py-1" {...props}>
      {children}
    </KbdBase>
  )
}

function KbdGroup({ className, keys, children, ...props }: KbdProps) {
  return (
    <KbdBase className={className} dataSlot="kbd-group" keys={keys} spacing="gap-0.5 px-2 py-1" {...props}>
      {children}
    </KbdBase>
  )
}

export { Kbd, KbdGroup }

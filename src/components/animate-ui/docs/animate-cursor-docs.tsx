"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

import { Cursor, CursorFollow, CursorProvider } from "@/components/animate-ui/components/animate/cursor"
import { PropsTable, type PropRow } from "@/components/docs/props-table"

type CursorFollowSide = "top" | "right" | "bottom" | "left"
type CursorFollowAlign = "start" | "center" | "end"

export function AnimateCursorMinimalPreview() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background min-h-[320px] w-full">
      <div className="p-10 space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Preview Area</h3>
        <p className="text-sm text-muted-foreground">Move your cursor here.</p>
      </div>
      <CursorProvider className="absolute inset-0">
        <Cursor className="text-foreground" />
      </CursorProvider>
    </div>
  )
}

export function AnimateCursorFollowPreview() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background min-h-[320px] w-full">
      <div className="p-10 space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Preview Area</h3>
        <p className="text-sm text-muted-foreground">Move your cursor here.</p>
      </div>
      <CursorProvider className="absolute inset-0">
        <Cursor className="text-foreground" />
        <CursorFollow>Cursor Follow</CursorFollow>
      </CursorProvider>
    </div>
  )
}

export function AnimateCursorPreview() {
  const [followEnabled, setFollowEnabled] = useState(true)
  const [followText, setFollowText] = useState("Cursor Follow")
  const [side, setSide] = useState<CursorFollowSide>("bottom")
  const [align, setAlign] = useState<CursorFollowAlign>("end")

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Follow</Label>
            <div className="flex items-center gap-2">
              <Toggle
                pressed={followEnabled}
                onPressedChange={setFollowEnabled}
                variant="outline"
                aria-label="Toggle follow label"
              >
                {followEnabled ? "On" : "Off"}
              </Toggle>
              <div className={cn("w-48", !followEnabled && "opacity-50 pointer-events-none")}>
                <Input
                  value={followText}
                  onChange={(e) => setFollowText(e.target.value)}
                  placeholder="Follow text"
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <div className={cn("space-y-2", !followEnabled && "opacity-50 pointer-events-none")}>
            <Label>Side</Label>
            <Select value={side} onValueChange={(v) => setSide(v as CursorFollowSide)}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={cn("space-y-2", !followEnabled && "opacity-50 pointer-events-none")}>
            <Label>Align</Label>
            <Select value={align} onValueChange={(v) => setAlign(v as CursorFollowAlign)}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Tip: the native cursor is hidden only while your pointer is inside the preview area.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-lg border bg-background min-h-[320px] w-full">
        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">Preview Area</h3>
            <p className="text-sm text-muted-foreground">
              Move your cursor here. The custom cursor is confined to this container.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="text-sm font-medium">Card</div>
              <div className="text-xs text-muted-foreground mt-1">
                Any content works.
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="text-sm font-medium">Hover</div>
              <div className="text-xs text-muted-foreground mt-1">
                Cursor stays smooth.
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="text-sm font-medium">Click</div>
              <div className="text-xs text-muted-foreground mt-1">
                Nothing special needed.
              </div>
            </div>
          </div>
        </div>

        <CursorProvider className="absolute inset-0">
          <Cursor className="text-foreground" />
          {followEnabled ? (
            <CursorFollow side={side} align={align}>
              {followText}
            </CursorFollow>
          ) : null}
        </CursorProvider>
      </div>
    </div>
  )
}

export function AnimateCursorApiReference() {
  const providerProps: PropRow[] = useMemo(
    () => [
      {
        prop: "global",
        type: "boolean",
        defaultValue: "false",
        description:
          "Tracks cursor globally (fixed positioning). When active, hides the native cursor for the whole document.",
      },
      {
        prop: "className",
        type: "string",
        defaultValue: "—",
        description: "Applied to the underlying cursor container element.",
      },
      {
        prop: "children",
        type: "ReactNode",
        defaultValue: "—",
        description: "Usually includes <Cursor /> and optional <CursorFollow />.",
      },
    ],
    []
  )

  const cursorProps: PropRow[] = useMemo(
    () => [
      {
        prop: "className",
        type: "string",
        defaultValue: "—",
        description: "Applied to the default SVG cursor.",
      },
      {
        prop: "style",
        type: "CSSProperties",
        defaultValue: "—",
        description: "Merged onto the positioned cursor element.",
      },
      {
        prop: "...motion props",
        type: "HTMLMotionProps<'div'>",
        defaultValue: "—",
        description: "Animation + event props forwarded to the motion element.",
      },
    ],
    []
  )

  const followProps: PropRow[] = useMemo(
    () => [
      {
        prop: "side",
        type: `"top" | "right" | "bottom" | "left"`,
        defaultValue: '"bottom"',
        description: "Where the follower sits relative to the cursor.",
      },
      {
        prop: "align",
        type: `"start" | "center" | "end"`,
        defaultValue: '"end"',
        description: "How the follower aligns on the chosen side.",
      },
      {
        prop: "sideOffset",
        type: "number",
        defaultValue: "0",
        description: "Distance from the cursor along the side axis.",
      },
      {
        prop: "alignOffset",
        type: "number",
        defaultValue: "0",
        description: "Distance along the alignment axis.",
      },
      {
        prop: "transition",
        type: "SpringOptions",
        defaultValue: "{ stiffness: 500, damping: 50, bounce: 0 }",
        description: "Spring config for the follow animation.",
      },
      {
        prop: "children",
        type: "ReactNode",
        defaultValue: "—",
        description: "The follow content.",
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PropsTable title="CursorProvider" rows={providerProps} />
      <PropsTable title="Cursor" rows={cursorProps} />
      <PropsTable title="CursorFollow" rows={followProps} />
    </div>
  )
}

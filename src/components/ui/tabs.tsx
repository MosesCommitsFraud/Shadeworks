"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState<string>("")
  const [highlightStyle, setHighlightStyle] = React.useState<React.CSSProperties>({})
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const listRef = React.useRef<HTMLDivElement>(null)
  const initializedRef = React.useRef(false)

  React.useEffect(() => {
    const updateHighlight = () => {
      const activeButton = tabRefs.current.get(activeTab)
      if (activeButton && listRef.current) {
        const listRect = listRef.current.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()

        setHighlightStyle({
          width: buttonRect.width,
          height: buttonRect.height,
          transform: `translateX(${buttonRect.left - listRect.left}px)`,
        })
      }
    }

    if (activeTab) {
      updateHighlight()
    } else if (!initializedRef.current && tabRefs.current.size > 0) {
      // Initialize with first active tab if none set
      const firstActive = Array.from(tabRefs.current.entries()).find(([_, button]) =>
        button.getAttribute('data-state') === 'active'
      )
      if (firstActive) {
        setActiveTab(firstActive[0])
        initializedRef.current = true
      }
    }

    window.addEventListener('resize', updateHighlight)
    return () => window.removeEventListener('resize', updateHighlight)
  }, [activeTab])

  return (
    <TabsPrimitive.List
      ref={(node) => {
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
        if (node) (listRef as React.MutableRefObject<HTMLDivElement>).current = node
      }}
      className={cn(
        "relative inline-flex h-9 w-fit items-center justify-center gap-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {activeTab && (
        <div
          className="absolute z-0 top-0 left-0 rounded-md bg-secondary transition-all duration-500 ease-out"
          style={highlightStyle}
        />
      )}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onTabChange: setActiveTab,
            registerRef: (value: string, ref: HTMLButtonElement | null) => {
              if (ref) {
                tabRefs.current.set(value, ref)
                // Trigger initialization check after first ref is registered
                if (!initializedRef.current) {
                  setTimeout(() => {
                    const firstActive = Array.from(tabRefs.current.entries()).find(([_, button]) =>
                      button.getAttribute('data-state') === 'active'
                    )
                    if (firstActive && !activeTab) {
                      setActiveTab(firstActive[0])
                      initializedRef.current = true
                    }
                  }, 0)
                }
              } else {
                tabRefs.current.delete(value)
              }
            },
          })
        }
        return child
      })}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    onTabChange?: (value: string) => void
    registerRef?: (value: string, ref: HTMLButtonElement | null) => void
  }
>(({ className, onTabChange, registerRef, value, ...props }, ref) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (value && registerRef) {
      registerRef(value as string, buttonRef.current)
    }
    return () => {
      if (value && registerRef) {
        registerRef(value as string, null)
      }
    }
  }, [value, registerRef])

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
        if (node) (buttonRef as React.MutableRefObject<HTMLButtonElement>).current = node
      }}
      value={value}
      className={cn(
        "relative z-10 inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground",
        className
      )}
      onMouseDown={() => {
        if (value && onTabChange) {
          onTabChange(value as string)
        }
      }}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95 transition-all duration-200",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ComponentsDocs } from "@/components/components-docs"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function ComponentsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        rightContent={
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </Button>
          </div>
        }
      />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <ComponentsDocs
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuChange={setMobileMenuOpen}
          />
        </div>
      </main>
    </div>
  )
}


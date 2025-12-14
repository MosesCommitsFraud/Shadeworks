import Link from "next/link"
import { Header } from "@/components/header"
import { ComponentsDocs } from "@/components/components-docs"
import { Button } from "@/components/ui/button"

export default function ComponentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
              <p className="text-muted-foreground">
                A living docs page for Shadeworks UI pieces you can reuse across tools.
              </p>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link href="/board">Back to tools</Link>
            </Button>
          </div>

          <div className="mt-10">
            <ComponentsDocs />
          </div>
        </div>
      </main>
    </div>
  )
}


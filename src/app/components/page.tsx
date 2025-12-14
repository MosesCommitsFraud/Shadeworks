import { Header } from "@/components/header"
import { ComponentsDocs } from "@/components/components-docs"

export default function ComponentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <ComponentsDocs />
        </div>
      </main>
    </div>
  )
}


import Image from "next/image"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-transparent sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-start gap-10 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-text-sw-white.svg"
              alt="shadeworks"
              width={160}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6 pt-[1px]">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent focus:outline-none">
                  Tools
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/board">Whiteboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dither">Dither Editor</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <a href="/about" className="text-sm font-medium transition-colors hover:text-accent">
                About
              </a>

              <a href="/docs" className="text-sm font-medium transition-colors hover:text-accent">
                Docs
              </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

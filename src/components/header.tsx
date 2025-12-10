import Image from "next/image"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Pencil, Grip, Eraser, ImageIcon } from "lucide-react"

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
                    <Link href="/board" className="flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Whiteboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dither" className="flex items-center gap-2">
                      <Grip className="h-4 w-4" />
                      Dither Editor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/removebg" className="flex items-center gap-2">
                      <Eraser className="h-4 w-4" />
                      Background Remover
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/editor" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image Editor
                    </Link>
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

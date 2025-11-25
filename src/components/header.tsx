import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-transparent sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-start gap-10 h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image 
              src="/logo-text-sw-white.svg" 
              alt="shadeworks" 
              width={160} 
              height={32} 
              className="h-8 w-auto"
              priority
            />
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6 pt-[01px]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Tools
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Image Editor</DropdownMenuItem>
                  <DropdownMenuItem>Vector Tools</DropdownMenuItem>
                  <DropdownMenuItem>Color Palette</DropdownMenuItem>
                  <DropdownMenuItem>Typography</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm">
                About
              </Button>

              <Button variant="ghost" size="sm">
                Docs
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

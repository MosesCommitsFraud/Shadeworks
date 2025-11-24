import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-transparent sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-center gap-10 h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image 
              src="/logo-text-sw-white.svg" 
              alt="shadeworks" 
              width={100} 
              height={20} 
              className="h-5 w-auto"
              priority
            />
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6 pt-[5px]">
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

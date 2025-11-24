export function Footer() {
  return (
    <footer className="border-t py-12 bg-card/30 border-transparent">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <span className="w-1 h-1 bg-border rounded-full" />
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="italic">made out of boredom</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} shadeworks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

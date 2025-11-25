import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Geist_Mono, Exo as V0_Font_Exo, Geist_Mono as V0_Font_Geist_Mono } from 'next/font/google'

// Initialize fonts
const _exo = V0_Font_Exo({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "shadeworks - Design Tools for Creators",
  description: "A collection of powerful graphic design features crafted for personal projects",
  generator: "v0.app",
  icons: {
    icon: "/logo-sw-white.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

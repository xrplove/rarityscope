import type { Metadata, Viewport } from 'next'
import { Work_Sans, Inter, Space_Mono } from 'next/font/google'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Signature } from '@/components/Signature'
import { MethodProvider } from '@/context/MethodContext'
import { config } from '@/config'
import { upstreamArtUrls } from '@/lib/rarity'
import './globals.css'

// Warm the TLS connections to the direct art gateways (primary + fallbacks) before the first
// image request — they back the client-side fallback ladder even when the /api/art proxy is on
// (the proxy is same-origin, so it needs no preconnect). Relative templates (bundled art, like
// the demo collection) are same-origin too, so they're filtered out rather than crashing new URL.
// React 19 hoists these <link>s into <head>.
const ART_ORIGINS = [...new Set(upstreamArtUrls(1, 64).filter((u) => URL.canParse(u)).map((u) => new URL(u).origin))]

const workSans = Work_Sans({ variable: '--font-display', subsets: ['latin'], display: 'swap' })
const inter = Inter({ variable: '--font-body', subsets: ['latin'], display: 'swap' })
const spaceMono = Space_Mono({ variable: '--font-mono', subsets: ['latin'], weight: ['400', '700'], display: 'swap' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: config.branding.siteTitle,
  description: config.branding.tagline,
  keywords: config.branding.keywords,
  // Emits <meta name="generator"> — the RarityScope signature.
  generator: `RarityScope · ${config.branding.credit.label}`,
  icons: {
    icon: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/favicon.ico`, sizes: '32x32' }],
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/apple-touch-icon.png`,
  },
  openGraph: {
    title: config.branding.siteTitle,
    description: config.branding.tagline,
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111112',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${inter.variable} ${spaceMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-dark text-text-primary font-body">
        {ART_ORIGINS.map((origin) => (
          <link key={origin} rel="preconnect" href={origin} />
        ))}
        <MethodProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </MethodProvider>
        <Signature />
      </body>
    </html>
  )
}

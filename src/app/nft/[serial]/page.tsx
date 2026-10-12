import { config } from '@/config'
import NftClient from './NftClient'

// Pre-render every serial so the site also works as a static export (GitHub Pages).
export function generateStaticParams() {
  return Array.from({ length: config.total }, (_, i) => ({ serial: String(i + 1) }))
}

export default function NftPage() {
  return <NftClient />
}

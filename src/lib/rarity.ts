/**
 * rarity.ts — the single source of rarity DISPLAY logic. Everything here is config-driven
 * (see collection.config.ts): rank -> grade / "rarer than %" / accent color, the art URL, and the
 * plain-language metadata for each rarity method. The ranks themselves are precomputed at build
 * time (scripts/build-data.ts) and loaded via data.ts; this file only maps a rank to its framing.
 */
import { config } from '@/config'
import type { RarityMethod } from '@/config'

export type { RarityMethod }

export const TOTAL = config.total
export const DISPLAY_NAME = config.displayName
export const COLLECTION_URL = config.marketplace.collectionUrl
export const METHODS: RarityMethod[] = config.rarity.enabledMethods
export const DEFAULT_METHOD: RarityMethod = config.rarity.defaultMethod

/** Plain-language copy for the method switcher + explainer popover (noob-friendly). */
export const METHOD_META: Record<RarityMethod, { label: string; short: string; blurb: string }> = {
  openRarity: {
    label: 'OpenRarity',
    short: 'balanced',
    blurb:
      'The cross-marketplace standard. Information-content scoring that rewards pieces with many hard-to-pull traits — especially 1-of-1s rise to the top.',
  },
  rarityScore: {
    label: 'Rarity Score',
    short: 'standout traits',
    blurb:
      'The classic rarity.tools score (sum of 1 / trait-frequency). Linear, so a couple of very rare traits count for a lot — it surfaces standout "variant" pieces the other methods bury.',
  },
  infoContent: {
    label: 'Info Content',
    short: 'statistical',
    blurb:
      'Pure information content (sum of −log₂ of each trait probability). The statistically purest view, with no bonus for how many 1-of-1s a piece has.',
  },
}

export type Grade = { letter: string; label: string }

/**
 * Rank -> letter grade, from the ladder in collection.config.ts (evaluated top-down).
 * The ladder is fraction-based so it scales with any collection size.
 * NOTE: the default 'A−' uses a Unicode MINUS SIGN (U+2212), not an ASCII hyphen.
 */
export function grade(rank: number): Grade {
  for (const tier of config.rarity.gradeLadder) {
    if (rank <= Math.ceil(tier.maxFraction * TOTAL)) return { letter: tier.letter, label: tier.label }
  }
  const last = config.rarity.gradeLadder[config.rarity.gradeLadder.length - 1]
  return { letter: last.letter, label: last.label }
}

/**
 * Share of the collection MORE COMMON than this piece. Clamped to 99.9 so the rarest few never
 * round up to a misleading "100%".
 */
export function rarerThan(rank: number): number {
  return Math.min(99.9, Math.round(((TOTAL - rank) / TOTAL) * 1000) / 10)
}

/** True when a piece is in the top accent band (config.rarity.accentTopFraction). */
export function isRare(rank: number): boolean {
  return rank <= Math.ceil(config.rarity.accentTopFraction * TOTAL)
}

/**
 * Accent color for a rank, returned as a CSS variable so re-theming is a globals.css edit only:
 * the primary accent for the top band, the secondary accent otherwise. For alpha tints, wrap in
 * color-mix(in srgb, <this> N%, transparent) rather than appending a hex alpha.
 */
export function accentColor(rank: number): string {
  return isRare(rank) ? 'var(--color-accent)' : 'var(--color-accent-2)'
}

/** Best art URL for a serial at a given width — the first entry of artUrls(). */
export function artUrl(serial: number, w = 512): string {
  return artUrls(serial, w)[0]
}

/**
 * The URLs the client walks for a serial, in try-order. With config.art.proxy on, the
 * same-origin /api/art route leads (it retries the upstreams server-side and the host CDN
 * caches the winner), and the direct gateway URLs stay behind it — so art still loads if the
 * proxy itself 502s. With proxy off, this is just the direct upstream list.
 */
export function artUrls(serial: number, w = 512): string[] {
  return config.art.proxy
    ? [`/api/art/${serial}?w=${w}`, ...upstreamArtUrls(serial, w)]
    : upstreamArtUrls(serial, w)
}

/**
 * Every DIRECT upstream art URL for a serial — the primary template plus configured fallbacks,
 * filled and in try-order. This is what the /api/art proxy walks server-side, and what the
 * client falls back to past the proxy entry in artUrls().
 */
export function upstreamArtUrls(serial: number, w = 512): string[] {
  return [config.art.urlTemplate, ...(config.art.fallbackUrlTemplates ?? [])].map((t) =>
    fillArtTemplate(t, serial, w)
  )
}

function fillArtTemplate(template: string, serial: number, w: number): string {
  const filled = template
    .replaceAll('{cid}', config.art.cid)
    .replaceAll('{ext}', config.art.ext)
    .replaceAll('{serial}', String(serial))
    .replaceAll('{w}', String(w))
  // Relative art paths get the deploy base path (e.g. /rarityscope on GitHub Pages).
  return filled.startsWith('/') ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${filled}` : filled
}

/** Valid serials are 1..total. */
export function isValidSerial(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= TOTAL
}

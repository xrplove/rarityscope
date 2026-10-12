/*
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  RarityScope — collection.config.ts                                       │
 * │  THIS IS THE ONE FILE YOU EDIT TO POINT RARITYSCOPE AT YOUR COLLECTION.   │
 * │                                                                           │
 * │  Everything project-specific lives here: which collection, where its art  │
 * │  and metadata come from, which rarity methods to show, and the site copy. │
 * │  To re-theme the LOOK (colors/fonts), edit src/app/globals.css instead.    │
 * │                                                                           │
 * │  Forking? See AGENTS.md for a step-by-step (human- and AI-agent-friendly).│
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/** The three rarity methods RarityScope can rank a collection by. */
export type RarityMethod = 'openRarity' | 'infoContent' | 'rarityScore'

export interface GradeTier {
  /** Letter shown on the badge. NOTE: 'A−' uses a Unicode MINUS SIGN (U+2212), not a hyphen. */
  letter: string
  /** Human label, e.g. 'top 5%'. */
  label: string
  /** Upper bound as a fraction of total supply. A rank qualifies if rank <= ceil(maxFraction * total). */
  maxFraction: number
}

export interface CollectionConfig {
  /** URL-safe slug for the collection (used internally / in provenance). */
  name: string
  /** Human display name shown in the UI, e.g. 'My Collection'. */
  displayName: string
  /** Total supply. Serials are assumed to run 1..total. */
  total: number

  /** On-chain identity (XRPL). Only needed if features.liveStats / mintedMarkers are on. */
  chainId: {
    issuer: string
    taxon: number
  }

  /** Where the art comes from. `urlTemplate` supports {cid} {serial} {ext} {w} placeholders. */
  art: {
    /** IPFS CID (or any id) — substituted for {cid}. Leave '' if your template doesn't use it. */
    cid: string
    /** File extension of the source art — substituted for {ext}. */
    ext: string
    /**
     * Full image URL template. {w} (pixel width) is optional — omit it for a fixed-size source.
     * A simple CDN collection might use: 'https://cdn.example.com/{serial}.png'; IPFS art often
     * goes through a resizing proxy like images.weserv.nl (see AGENTS.md for examples).
     * Must be an ABSOLUTE URL when art.proxy is on; a relative path (e.g. bundled art under
     * public/) works when the proxy is off.
     */
    urlTemplate: string
    /**
     * OPTIONAL fallback templates (same placeholders), tried in order when the primary fails.
     * The UI retries the primary with a short backoff, then walks these — so one flaky
     * gateway/proxy doesn't blank a tile. Omit or leave [] if you have a single reliable CDN.
     */
    fallbackUrlTemplates?: string[]
    /**
     * OPTIONAL: when true, the app serves art through its own /api/art/{serial}?w= route, which
     * retries urlTemplate + fallbacks SERVER-SIDE and lets the host CDN (e.g. Vercel's edge)
     * cache each success — so a flaky source resolves once globally instead of once per visitor.
     * Recommended for public IPFS gateways. Omit/false to hit urlTemplate directly from the
     * browser (fine for a reliable CDN, where the direct URL is one hop fewer).
     */
    proxy?: boolean
  }

  /** Marketplace + collection links. */
  marketplace: {
    name: string
    /** Public collection page (linked from cards + footer). */
    collectionUrl: string
    /** Private stats API base (xrp.cafe). Only used when features.liveStats is on. */
    apiBase?: string
    /** xrp.cafe routes timed auctions through this broker; excluded from the buy-now floor. */
    auctionBroker?: string
  }

  /** RPC endpoints for on-chain minted/supply reads. Only used when features are on. */
  chain: {
    /** Clio nodes for nfts_by_issuer enumeration (tried in order). */
    clioNodes: string[]
    /** Node for the MintedNFTokens account_info fallback. */
    accountInfoNode: string
  }

  /** Rarity behavior. */
  rarity: {
    /** Which method loads first. Must be one of enabledMethods. */
    defaultMethod: RarityMethod
    /** Methods offered in the switcher (order = display order). */
    enabledMethods: RarityMethod[]
    /**
     * Trait values that mean "no trait of this type" (e.g. 'none'). They ARE counted in
     * frequency (so being common lowers rarity) but are hidden from the trait breakdown.
     */
    nullValues: string[]
    /** Grade ladder, evaluated top-down. See GradeTier. */
    gradeLadder: GradeTier[]
    /** Ranks within this top fraction get the primary accent color (else the secondary). */
    accentTopFraction: number
  }

  /** Presentation bits. */
  display: {
    /** A few standout serials shown as a strip on the landing hero. */
    featuredSerials: number[]
  }

  /** Site copy + credit. Colors/fonts live in src/app/globals.css. */
  branding: {
    siteTitle: string
    tagline: string
    keywords: string[]
    /**
     * Small footer credit — keep it, swap it for your own, or blank the label to hide it.
     * (RarityScope is open source; attribution is appreciated but never required.)
     */
    credit: { label: string; url: string }
  }

  /** Optional modules. Turn OFF (false) for collections not on XRPL / not on xrp.cafe. */
  features: {
    /** Live floor + minted + mint-price bar (needs marketplace.apiBase + chain). */
    liveStats: boolean
    /** Per-piece "minted vs still in pool" markers (needs chain.clioNodes). */
    mintedMarkers: boolean
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CONFIG — "scopelings", the bundled demo collection: 100 generated
// pieces whose art + metadata live in the repo (scripts/demo/ regenerates them).
// It exists so the template works out of the box without shipping any real
// project's art. Edit the values below to point RarityScope at your collection.
// ─────────────────────────────────────────────────────────────────────────────
export const config: CollectionConfig = {
  name: 'scopelings',
  displayName: 'scopelings',
  total: 100,

  // Not an on-chain collection — only needed when liveStats / mintedMarkers are on.
  chainId: {
    issuer: '',
    taxon: 0,
  },

  art: {
    cid: '',
    ext: 'svg',
    // Demo art is bundled in public/demo-art, so a relative template works here. A real
    // collection usually points at an absolute CDN / IPFS-gateway URL — and MUST be
    // absolute if art.proxy is on.
    urlTemplate: '/demo-art/{serial}.{ext}',
    // Bundled same-origin art can't flake, so no proxy and no fallbacks needed.
    proxy: false,
  },

  marketplace: {
    name: 'Tree of Life',
    collectionUrl: 'https://treeoflife-apostles.github.io/',
  },

  // Only used when liveStats / mintedMarkers are on (XRPL collections).
  chain: {
    clioNodes: [],
    accountInfoNode: '',
  },

  rarity: {
    // OpenRarity is the cross-marketplace standard, so it makes the best default.
    // RarityScore best surfaces "standout trait" variants; Info-Content is the pure
    // statistical view. All three are one tap apart in the switcher.
    defaultMethod: 'openRarity',
    enabledMethods: ['openRarity', 'rarityScore', 'infoContent'],
    nullValues: ['none'],
    gradeLadder: [
      { letter: 'S', label: 'legendary', maxFraction: 0.01 }, // rank <= 1 (of 100)
      { letter: 'A+', label: 'top 5%', maxFraction: 0.05 }, //    rank <= 5
      { letter: 'A', label: 'top 10%', maxFraction: 0.1 }, //     rank <= 10
      { letter: 'B', label: 'top 25%', maxFraction: 0.25 }, //    rank <= 25
      { letter: 'C+', label: 'top half', maxFraction: 0.5 }, //   rank <= 50
      { letter: 'C', label: 'common', maxFraction: 1 }, //        everything else
    ],
    accentTopFraction: 0.1,
  },

  display: {
    featuredSerials: [42, 1, 7, 13, 69, 100],
  },

  branding: {
    siteTitle: 'Tree of Life Rarity',
    tagline: 'A Tree of Life / Lantern House rarity browser (demo collection for now) — search any piece, see its rank and trait breakdown, and compare two side by side. Home: treeoflife-apostles.github.io',
    keywords: ['Tree of Life', '589', 'NFT', 'rarity', 'OpenRarity', 'RarityScore', 'rarity browser', 'open source'],
    credit: { label: 'XRPLClaw', url: 'https://xrplclaw.com' },
  },

  // The demo isn't on-chain, so the live modules are off. Flip them on for an XRPL
  // collection with an xrp.cafe page (and fill in marketplace.apiBase + chain above).
  features: {
    liveStats: false,
    mintedMarkers: false,
  },
}

/**
 * Lightweight runtime sanity check with friendly errors. Called by the data build so a
 * misconfigured fork fails loudly at `npm run build:data` instead of rendering a broken site.
 */
export function assertConfig(c: CollectionConfig): void {
  const bad = (m: string): never => {
    throw new Error(`collection.config.ts: ${m}`)
  }
  if (!c.name) bad('name is required')
  if (!Number.isInteger(c.total) || c.total < 1) bad('total must be a positive integer')
  if (!c.art?.urlTemplate?.includes('{serial}')) bad("art.urlTemplate must contain '{serial}'")
  for (const t of c.art.fallbackUrlTemplates ?? [])
    if (!t.includes('{serial}')) bad("every art.fallbackUrlTemplates entry must contain '{serial}'")
  if (!c.rarity?.enabledMethods?.length) bad('rarity.enabledMethods must list at least one method')
  const known: RarityMethod[] = ['openRarity', 'infoContent', 'rarityScore']
  for (const m of c.rarity.enabledMethods) if (!known.includes(m)) bad(`unknown rarity method '${m}'`)
  if (!c.rarity.enabledMethods.includes(c.rarity.defaultMethod))
    bad(`rarity.defaultMethod '${c.rarity.defaultMethod}' is not in enabledMethods`)
  if (!c.rarity.gradeLadder?.length) bad('rarity.gradeLadder must have at least one tier')
  if (c.features.liveStats && !c.marketplace.apiBase) bad('features.liveStats is on but marketplace.apiBase is unset')
  if (c.features.mintedMarkers && !c.chain.clioNodes?.length)
    bad('features.mintedMarkers is on but chain.clioNodes is empty')
}

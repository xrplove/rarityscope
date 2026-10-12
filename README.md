# RarityScope — Tree of Life edition

> This is the Tree of Life / Lantern House fork of [ShaneOnChain/rarityscope](https://github.com/ShaneOnChain/rarityscope),
> made by Shane ([XRPLClaw](https://xrplclaw.com)) and shared under the MIT license (kept in `LICENSE`).
> Thank you, Shane! Family home: <https://treeoflife-apostles.github.io/>. Live site: <https://xrplove.github.io/rarityscope/>.
> It still shows the bundled **scopelings** demo collection; the family's own collection will replace it once it has traits.
> GitHub Pages builds a static export (`.github/workflows/pages.yml`, `STATIC_EXPORT=1 BASE_PATH=/rarityscope`).

A self-hostable, mobile-first rarity browser for **any** NFT collection. Search a piece, see its
rank and full trait breakdown, browse the whole collection, and compare two side by side. Rank the
same collection three different ways and flip between them with one tap.

RarityScope is fork-first: everything specific to a collection lives in one config file and one CSS
file, so pointing it at your own collection is a few edits and a data build — no code changes.

Ships with **scopelings**, a 100-piece generated demo collection whose art and metadata live in the
repo (`scripts/demo/` regenerates them) — so the template works out of the box without bundling any
real project's art. Built by [XRPLClaw](https://xrplclaw.com). MIT licensed. **Not financial advice.**

---

## Quickstart

```bash
npm install
npm run dev
# open http://localhost:3000
```

The demo collection's art and rarity data ship in the repo, so it runs fully offline out of the box.
The optional live floor/minted bar (off for the demo) is the only thing that reaches the network, and
it degrades gracefully to "unavailable" if it can't.

Requires Node 23.6+ (Node 24 LTS recommended) — the build and fetch scripts are TypeScript that Node
runs directly, no compile step.

## Fork it for your collection

1. **Point it at your collection.** Edit `collection.config.ts` — name, total supply, on-chain identity,
   art URL template, marketplace links, which rarity methods to show, and the site copy. It's the one
   file you edit to retarget the whole app. (See `AGENTS.md` for a field-by-field walkthrough.)

2. **Provide the metadata.** Create `data/meta.json`, keyed by serial, each value the piece's traits:

   ```json
   {
     "1": [ { "trait_type": "Background", "value": "Blue" }, { "trait_type": "Eyes", "value": "Laser" } ],
     "2": [ { "trait_type": "Background", "value": "Red" },  { "trait_type": "Eyes", "value": "Normal" } ]
   }
   ```

   For an XRPL collection you don't have to hand-write this — run the on-ramp, which enumerates your
   issuer's NFTs on-chain and downloads their metadata for you:

   ```bash
   npm run fetch-metadata   # XRPL only; writes data/meta.json
   ```

3. **Build the data.**

   ```bash
   npm run build:data
   ```

   This computes all three rarity rankings from your metadata and writes the static files the app reads.
   It also runs automatically before `npm run dev` and `npm run build`.

4. **Run it.**

   ```bash
   npm run dev
   ```

## Re-theme the look

Colors and fonts live in a single `:root` block in `src/app/globals.css`. Change the CSS variables
there (accent colors, background, text, fonts) and the whole UI follows — no component edits. The
config file controls *what* the site is; globals.css controls *how it looks*. Also swap the three
icon files in `public/` (`favicon.ico`, `icon-192.png`, `apple-touch-icon.png`) for your own.

## The three rarity methods

RarityScope can rank a collection three ways. The switcher in the UI flips between them instantly; the
one that loads first is `rarity.defaultMethod` in `collection.config.ts` (OpenRarity by default).

- **OpenRarity** — *balanced / standard.* The cross-marketplace default most people expect. It rewards
  pieces stacked with hard-to-pull traits, and pieces with 1-of-1 traits float to the top. Good general
  ranking.
- **Rarity Score** — *standout traits.* The classic rarity.tools score. A couple of very rare traits
  count for a lot, so it surfaces desirable "variant" pieces (aliens, meme serials) that the other
  methods bury.
- **Info Content** — *statistical.* The purest math-only view: no bonus for how many 1-of-1s a piece
  has, just the raw statistical rarity of its trait combination.

All three are computed from your metadata alone by the in-repo engine — no Python, no marketplace, no
network.

### OpenRarity accuracy

The in-repo engine ships a faithful information-content approximation of OpenRarity that reproduces the
official `open_rarity` library about 99% of the time. If you want **byte-exact** OpenRarity ranks,
generate them with the official library and drop the result in as `data/rarity_rank.json` — the build
uses those verbatim for the OpenRarity method. The Python recipe is in
`scripts/openrarity/`. Without that fixture, the engine's own OpenRarity ranking is shipped.

## Live stats and minted markers (optional)

Two optional modules under `config.features`:

- **liveStats** — a live floor (cheapest buy-now) + minted count + mint-price bar.
- **mintedMarkers** — per-piece "minted vs still in the pool" markers on the grid.

These are **XRPL + xrp.cafe only** (they read the XRPL for supply and xrp.cafe's server-side API for
floor). For collections on other chains, turn both off in `config.features` and the rest of the app
works unchanged. When on, the xrp.cafe call is server-side only (its API is private and rate-limited)
and cached; if it's unreachable the bar shows "unavailable" and nothing else is affected.

## Deploy

Any Next.js host. On Vercel: import the repo (build command `npm run build`, which regenerates the data
first), and set `NEXT_PUBLIC_SITE_URL` to your origin for correct metadata (see `.env.example`). Nothing
hardcodes a domain, so point any custom domain at it. `vercel.json` ships sensible security + cache headers.
With `art.proxy` on (recommended for IPFS-gateway art), art is served through the app's own `/api/art/{serial}` route
and cached at the CDN edge — each image resolves against the upstream gateways once globally, not once
per visitor.

## Credit and license

Built by [XRPLClaw](https://xrplclaw.com). Open source under the [MIT License](./LICENSE) — attribution
is appreciated but never required; you can swap or hide the footer credit in `config.branding.credit`.

**Not financial advice.** Rarity ranks are computed independently and are informational only.

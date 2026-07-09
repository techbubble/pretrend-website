# Pretrend Website

Marketing and documentation site for the Pretrend Protocol — continuous trend resolution for prediction markets, built on the Vitruveo blockchain.

## Pages

- `/` — protocol overview: outcome buckets, bonding curve pricing, architecture, roadmap
- `/whitepaper` — the full Pretrend Protocol whitepaper (v2.0)
- `/examples` — live demos of the Trend precompile (`0x…DC` on Vitruveo), running OLS regression and volatility analysis on real datasets via `eth_call`

## Stack

Next.js (App Router, static export) · React · Bootstrap 5 · TypeScript

## Development

```bash
npm install
npm run dev
```

Production build (static export to `out/`):

```bash
npm run build
```

## Notes

- Wallet integration (wagmi + RainbowKit, `app/web3/`) is present but currently not surfaced in the UI; it will be re-enabled with the marketplace app.
- Brand assets live in the sibling `brand/` folder of the parent workspace; the palette is defined in `app/globals.css`.

---

A [Vertical Foundation](https://www.verticalfoundation.net) project. Contact: info@verticalfoundation.net

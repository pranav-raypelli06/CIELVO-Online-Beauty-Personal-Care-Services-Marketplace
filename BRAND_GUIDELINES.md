# CIELVO — Brand Identity & Asset Guidelines

## 1. Brand Overview
- **Brand Name**: CIELVO
- **Tagline**: *"Your beauty. Your way."*
- **Brand Essence**: Luxury, modern elegance, empowerment, timeless beauty & premium skincare/cosmetics aesthetics.

---

## 2. Saved Brand Assets Inventory

All original assets have been organized and saved in `assets/brand/` and `assets/images/`:

| File Name | Dimensions | Format | Transparency | Recommended Use Cases |
| :--- | :--- | :--- | :--- | :--- |
| [`cielvo-logo-wordmark.png`](file:///e:/Startup/CIELVO%20website/assets/brand/cielvo-logo-wordmark.png) | 975 × 300 | PNG (RGBA) | **Yes (86.4% transparent)** | Website Header, Navigation Bar, Sticky Nav, Footer Wordmark, Email Signature |
| [`cielvo-logo-full-blush.jpg`](file:///e:/Startup/CIELVO%20website/assets/brand/cielvo-logo-full-blush.jpg) | 1024 × 682 | JPEG (RGB) | No (Blush backdrop) | Hero Banner, Editorial Section, About Brand Card, Social Media OpenGraph / Banner |
| [`cielvo-app-icon.jpg`](file:///e:/Startup/CIELVO%20website/assets/brand/cielvo-app-icon.jpg) | 1024 × 1024 | JPEG (RGB) | Squircle Badge | Favicon, PWA / Mobile App Icon, Profile / Avatar Badge, Product Stamp / Seal |

---

## 3. Brand Color Palette

Extracted exact HEX / RGB color values from the brand assets:

### Primary Palette
- **Deep Burgundy / Wine (Brand Primary Text & Icon Background)**
  - HEX: `#52161F` / `#530E26`
  - RGB: `rgb(82, 22, 31)` / `rgb(83, 14, 38)`
  - HSL: `hsl(351°, 58%, 20%)`
  - *Usage*: Main brand logo text, primary headings, dark mode / luxury accent cards, icon background.

- **Warm Terracotta / Rust Copper (Tagline Accent)**
  - HEX: `#B35A3E`
  - RGB: `rgb(179, 90, 62)`
  - HSL: `hsl(14°, 49%, 47%)`
  - *Usage*: Tagline text, subtle borders, horizontal dividers, accent highlights.

- **Champagne Gold / Rose Copper (Metallic Monogram & Rim)**
  - HEX: `#F5D1B3` (Light highlight: `#FCE6D5`, Border rim: `#D4AF87`)
  - RGB: `rgb(245, 209, 179)`
  - HSL: `hsl(27°, 73%, 83%)`
  - *Usage*: Intertwined CV monogram, metallic badges, CTA borders, luxury buttons, star sparkles.

- **Soft Blush Pink / Dusty Rose (Atmospheric Background)**
  - HEX: `#EDD0C7` / `#F7E8E3`
  - RGB: `rgb(237, 208, 199)`
  - HSL: `hsl(14°, 50%, 85%)`
  - *Usage*: Section backgrounds, subtle card surfaces, hero gradient backdrops.

- **Clean Neutrals**
  - Alabaster White / Warm Cream: `#FAF7F5`
  - Pure White: `#FFFFFF`
  - Soft Border Gray / Muted Divider: `#EADBD7`

---

## 4. Typography Guidelines

### Primary Display / Wordmark Font:
- **Type**: High-contrast, editorial serif with refined, modern vertical stress and razor-sharp serifs.
- **Recommended Web Font Pairings**:
  - `Playfair Display` (Google Fonts)
  - `Cormorant Garamond` (Google Fonts)
  - `Bodoni Moda` (Google Fonts)
  - `Cinzel` (Google Fonts)
- **Styling**: Uppercase, wide tracking (`letter-spacing: 0.18em` to `0.25em`).

### Tagline & Subheading Font:
- **Type**: Fluid, high-legibility italic serif with humanist charm.
- **Recommended Web Font**: `Cormorant Garamond` (Italic, weight 400 or 500) or `Playfair Display Italic`.
- **Styling**: Title case, italicized, accompanied by flanking hairline rules (`— Your beauty. Your way. —`).

### Body & UI Typography:
- **Type**: Clean, warm, geometric or humanist sans-serif to contrast with the rich editorial serif.
- **Recommended Web Fonts**:
  - `Plus Jakarta Sans` or `Montserrat` or `Inter` (Google Fonts)
- **Styling**: Clean line heights (`line-height: 1.6 - 1.7`), weights 300 / 400 / 500.

---

## 5. CSS Design Tokens Template

```css
:root {
  /* Brand Colors */
  --cielvo-burgundy: #52161f;
  --cielvo-wine-dark: #530e26;
  --cielvo-terracotta: #b35a3e;
  --cielvo-gold-champagne: #f5d1b3;
  --cielvo-gold-border: #d4af87;
  --cielvo-blush-light: #f7e8e3;
  --cielvo-blush-base: #edd0c7;
  --cielvo-cream: #faf7f5;
  --cielvo-white: #ffffff;

  /* Typography */
  --font-heading: 'Playfair Display', 'Bodoni Moda', 'Cormorant Garamond', serif;
  --font-tagline: 'Cormorant Garamond', 'Playfair Display', serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing & Borders */
  --letter-spacing-logo: 0.22em;
  --radius-badge: 24px;
}
```

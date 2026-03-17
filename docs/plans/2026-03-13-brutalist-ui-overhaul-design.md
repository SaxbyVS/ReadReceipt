# Brutalist UI Overhaul — Design Document

**Date**: 2026-03-13
**Status**: Approved
**Scope**: Visual-only redesign. No functionality changes.

## Direction

Monochrome Industrial Brutalist with neon green accent. Dark base, thick borders, monospace headings, zero rounded corners, zero shadows. Futuristic-industrial aesthetic.

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0d0d0d` | Page background |
| `--bg-surface` | `#1a1a1a` | Card/section backgrounds |
| `--bg-elevated` | `#252525` | Hover states |
| `--fg` | `#f0f0f0` | Primary text |
| `--fg-muted` | `#888888` | Secondary text, labels |
| `--accent` | `#39FF14` | CTAs, highlights, "your pick" row |
| `--accent-dim` | `#39FF1433` | Accent backgrounds (low opacity) |
| `--border` | `#333333` | Default borders |
| `--border-hard` | `#f0f0f0` | Emphasis borders |

## Typography

- **Headings**: Geist Mono, uppercase, letter-spacing 0.1em, bold
- **Body**: Geist Sans, normal weight, line-height 1.6
- **Data/numbers**: Geist Mono
- **Large display**: Geist Mono, 3xl-4xl for dashboard numbers

## Component Language

- No rounded corners (all border-radius: 0)
- Thick borders: 2px default, 3px emphasis
- No box shadows — depth via borders and bg changes
- Buttons: hard edges. Primary = neon green bg + black text. Secondary = green border outline.
- Inputs: thick bottom-border underline style, monospace for numbers
- Tables: thick outer border, thin inner grid, no zebra striping

## Page Designs

### Home/Search
- Large mono hero: `READRECEIPT`
- Full-width search bar with thick border
- Book cards: bordered rectangles, raw grid

### Book Detail — BookInfo
- Cover with 3px border frame
- Metadata in structured grid (labels muted mono, values normal)

### Book Detail — ProjectionControls (Restructured)
- 2-column grid: WPM left, daily goal right (same horizontal plane)
- Below: large dashboard number (3xl+, neon green, mono) for daily page count
- WPP setting tucked as small detail row

### Book Detail — ProjectionMap (Main Event)
- 3px border frame around entire section
- `PROJECTION MAP` heading in large mono uppercase
- Table: full-width, dark header row, clean grid
- "Your pick" row: full neon green bg, black text, bold, `>>> YOUR PICK` marker
- Download buttons inside the frame below table

### Loading/404
- Dark rectangles with pulse animation
- Large mono `404`, minimal message

## Implementation Order

1. globals.css — theme tokens + base styles
2. layout.tsx — header/footer
3. Home page (page.tsx, SearchBar, BookCard)
4. ProjectionControls — restructure + restyle
5. ProjectionMap — table emphasis + "your pick" row
6. BookInfo, DownloadButtons, ReminderForm
7. Detail page layout, loading.tsx, not-found.tsx
8. Responsive polish + build verification

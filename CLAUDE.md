# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

There are no tests configured yet.

## Architecture

This is a **Next.js 16 App Router** project using React 19 and TypeScript.

- `app/layout.tsx` — Root layout; applies Geist fonts and global metadata. All pages inherit from this.
- `app/page.tsx` — Home page (currently the default scaffold placeholder).
- `app/globals.css` — Global styles; imports Tailwind and defines CSS variables for light/dark theme.

Styling is done exclusively with **Tailwind CSS v4**. There is no Pages Router — all routing is file-based under `app/`.

Path alias `@/*` resolves to the project root (configured in `tsconfig.json`).

The project is a fresh scaffold with no custom business logic yet.

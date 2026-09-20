# mkstack-devin

**MKStack template adapted for Devin-driven Nostr app development.**

Based on [MKStack](https://soapbox.pub/mkstack) — an AI-first framework for building Nostr applications with React 19.x, TailwindCSS 4.x, Vite, shadcn/ui, and Nostrify. Instead of Dork/Goose/OpenCode, all agent work in this repo is done by [Devin](https://devin.ai).

## 🚀 Quick Start

### 1. Use this template

This repo is a GitHub template — click **Use this template** (or clone it) to start a new Nostr app.

### 2. Start a Devin session

Open a Devin session against the new repo and describe the app:

```
"Build a group chat application"
```

Devin reads `AGENTS.md` and the `.agents/skills/` library (Nostr security, NIP-19 routing, encryption, uploads, zaps, theming, etc.) and ships changes as PRs.

### 3. Iterate

Ask Devin for features and fixes; each change arrives as a reviewable PR. GitHub Actions runs `npm run test` (tsc + eslint + vitest + build) on every PR.

```bash
npm run dev    # local dev server
npm run test   # tsc + eslint + vitest + build
```

### 4. Deploy

`npm run build` produces a static `dist/` (with a SPA `404.html` fallback). Ask Devin to deploy it — or push to any static host (Vercel, Netlify, GitHub Pages).

## 🧭 The Workflow

The [Soapbox workflow](https://soapbox.pub/blog/how-soapbox-ships-fast), adapted for Devin:

| Soapbox | Here |
|---|---|
| Shakespeare (ideation) | Chat with Devin to explore the idea |
| MKStack template | This repo — **Use this template** |
| OpenCode / Dork (deep work) | Devin sessions on the new repo — PR-based, CI-checked |
| `npm run deploy` | Devin deploy, or any static host |

## ✨ What Makes MKStack Special

- **🤖 AI-First Development**: Devin builds complete Nostr apps from a single prompt, guided by `AGENTS.md` + `.agents/skills/`
- **⚡ 8 Minutes Average**: From idea to deployed application in minutes, not months
- **🔗 50+ NIPs Supported**: Comprehensive Nostr protocol implementation
- **🎨 Beautiful UI**: 48+ shadcn/ui components with light/dark theme support
- **🔐 Built-in Security**: NIP-07 browser signing, NIP-44 encryption, event validation
- **💰 Payments Ready**: Lightning zaps (NIP-57), Cashu wallets (NIP-60), Wallet Connect (NIP-47)
- **📱 Production Ready**: TypeScript, testing, deployment, and responsive design included

## 🛠 Technology Stack

- **React 19.x**: Hooks, concurrent rendering, ref-as-prop
- **TailwindCSS 4.x**: Utility-first CSS framework for styling
- **Vite**: Fast build tool and development server
- **shadcn/ui**: 48+ unstyled, accessible UI components built with Radix UI
- **Nostrify**: Nostr protocol framework for Deno and web
- **React Router**: Client-side routing with BrowserRouter
- **TanStack Query**: Data fetching, caching, and state management
- **TypeScript**: Type-safe JavaScript development

## 🎯 Real-World Examples

### Built with One Prompt

Each of these applications was created with a single prompt to an AI agent on MKStack:

- **Group Chat Application**: `"Build me a group chat application"`
  - [Live Demo](https://groupchat-74z9j26wq-mks-projects-1f1254c4.vercel.app/)

- **Decentralized Goodreads**: `"Build a decentralized goodreads alternative. Use OpenLibrary API for book data."`
  - [Live Demo](https://bookstr123-87phkwjcy-mks-projects-1f1254c4.vercel.app/)

- **Chess Game**: `"Build a chess game with NIP 64"`
  - [Live Demo](https://chess-l0d7ms7m3-mks-projects-1f1254c4.vercel.app/chess)

### Production Apps

Real Nostr applications built using MKStack:

- **[Chorus](https://chorus.community/)**: Facebook-style groups on Nostr with built-in eCash wallet
- **[Blobbi](https://www.blobbi.pet/)**: Digital pet companions that live forever on the decentralized web
- **[Treasures](https://treasures.to/)**: Decentralized geocaching adventure powered by Nostr

[Browse more apps made with MKStack →](https://nostrhub.io/apps/t/mkstack/)

## 🔧 Core Features

### Authentication & Users
- `LoginArea` component with account switching
- `useCurrentUser` hook for authentication state
- `useAuthor` hook for fetching user profiles
- NIP-07 browser signing support
- Multi-account management

### Nostr Protocol Support
- **Social Features**: User profiles (NIP-01), follow lists (NIP-02), reactions (NIP-25), reposts (NIP-18)
- **Messaging**: Private DMs (NIP-17), public chat (NIP-28), group chat (NIP-29), encryption (NIP-44)
- **Payments**: Lightning zaps (NIP-57), Cashu wallets (NIP-60), Nutzaps (NIP-61), Wallet Connect (NIP-47)
- **Content**: Long-form articles (NIP-23), file metadata (NIP-94), live events (NIP-53), calendars (NIP-52)

### Data Management
- `useNostr` hook for querying and publishing
- `useNostrPublish` hook with automatic client tagging
- Event validation and filtering
- Infinite scroll with TanStack Query
- Multi-relay support

### UI Components
- 48+ shadcn/ui components (buttons, forms, dialogs, etc.)
- `NoteContent` component for rich text rendering
- `EditProfileForm` for profile management
- `RelaySelector` for relay switching
- `CommentsSection` for threaded discussions
- Light/dark theme system

### Media & Files
- `useUploadFile` hook with Blossom server integration
- NIP-94 compatible file metadata
- Image and video support
- File attachment to events

### Advanced Features
- NIP-19 identifier routing (`npub1`, `note1`, `nevent1`, `naddr1`)
- Cryptographic operations (encryption/decryption)
- Lightning payments and zaps
- Real-time event subscriptions
- Responsive design with mobile support

## 🤖 AI Development with Devin

This template is designed for [Devin](https://devin.ai) sessions instead of MKStack's built-in Dork agent:

- **Context-Aware**: `AGENTS.md` encodes the project's conventions and Nostr security model; Devin follows it automatically.
- **Nostr Expert**: `.agents/skills/` ships 20 specialized skills (50+ NIPs, encryption, relay pools, uploads, zaps, testing, theming) that Devin loads on demand.
- **PR-Based Workflow**: Devin implements changes on branches and opens reviewable PRs.

Example prompts:
```bash
"Add user profiles with avatars and bio"
"Implement NIP-17 private messaging"
"Add a dark mode toggle"
"Create a marketplace with NIP-15"
```

## 📁 Project Structure

```
src/
├── components/           # UI components
│   ├── ui/              # shadcn/ui components (48+ available)
│   ├── auth/            # Authentication components
│   └── comments/        # Comment system components
├── hooks/               # Custom React hooks
│   ├── useNostr         # Core Nostr integration
│   ├── useAuthor        # User profile data
│   ├── useCurrentUser   # Authentication state
│   ├── useNostrPublish  # Event publishing
│   ├── useUploadFile    # File uploads
│   └── useZaps          # Lightning payments
├── pages/               # Page components
├── lib/                 # Utility functions
├── contexts/            # React context providers
└── test/                # Testing utilities
```

## 🎨 UI Components

MKStack includes 48+ shadcn/ui components:

**Layout**: Card, Separator, Sheet, Sidebar, ScrollArea, Resizable
**Navigation**: Breadcrumb, NavigationMenu, Menubar, Tabs, Pagination
**Forms**: Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider
**Feedback**: Alert, AlertDialog, Toast, Progress, Skeleton
**Overlay**: Dialog, Popover, HoverCard, Tooltip, ContextMenu, DropdownMenu
**Data Display**: Table, Avatar, Badge, Calendar, Chart, Carousel
**And many more...

## 🔐 Security & Best Practices

- **Never use `any` type**: Always use proper TypeScript types
- **Event validation**: Filter events through validator functions for custom kinds
- **Efficient queries**: Minimize separate queries to avoid rate limiting
- **Proper error handling**: Graceful handling of invalid NIP-19 identifiers
- **Secure authentication**: Use signer interface, never request private keys directly

## 📱 Responsive Design

- Mobile-first approach with Tailwind breakpoints
- `useIsMobile` hook for responsive behavior
- Touch-friendly interactions
- Optimized for all screen sizes

## 🧪 Testing

- Vitest with jsdom environment
- React Testing Library with jest-dom matchers
- `TestApp` component provides all necessary context providers
- Mocked browser APIs (matchMedia, scrollTo, IntersectionObserver, ResizeObserver)

## 🚀 Deployment

The build (`npm run build`) outputs a static `dist/` (with a SPA `404.html` fallback) deployable to any static host — Vercel, Netlify, GitHub Pages, or Devin's own deploy flow.

## 📚 Documentation

For detailed documentation on building Nostr applications with MKStack:

- [Tutorial](https://soapbox.pub/blog/mkstack-tutorial)
- [Nostr Protocol Documentation](https://nostr.com)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

MKStack is open source and welcomes contributions. The framework is designed to be:

- **Extensible**: Easy to add new NIPs and features
- **Maintainable**: Clean architecture with TypeScript
- **Testable**: Comprehensive testing setup included
- **Documented**: Clear patterns and examples

## 📄 License

MKStack is dedicated to the **public domain**.

To the extent possible under law, the authors have waived all copyright and related or neighboring rights to MKStack. You are free to copy, modify, distribute, and use this software for any purpose, commercial or non-commercial, without asking permission and without attribution.

Build amazing Nostr applications and help grow the decentralized web!

---

**"Vibed with MKStack"** - [Learn more about MKStack](https://soapbox.pub/mkstack)

*Build your Nostr app in minutes, not months. Start with AI, deploy instantly.*
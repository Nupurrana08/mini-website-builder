# SiteForge – Multi-Tenant Website Builder

A mini Wix/Shopify-style platform where users can create and publish websites using predefined templates.

**Live demo:** `https://siteforge.vercel.app` _(update after deploy)_  
**GitHub:** `https://github.com/yourusername/siteforge`

---

## Quick Start

```bash
git clone https://github.com/yourusername/siteforge
cd siteforge
npm install
cp .env.example .env.local   # fill in your values
npm run dev                   # http://localhost:3000
```

### Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (use a long random string) |
| `NEXT_PUBLIC_BASE_URL` | Base URL (e.g. `https://siteforge.vercel.app`) |

---

## Architecture

### Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (Pages Router) | SSR for public pages, API routes co-located, familiar DX |
| Styling | SCSS Modules | Scoped styles, no runtime overhead, native CSS variables for theming |
| Database | MongoDB + Mongoose | Flexible document schema suits site config/sections; easy Atlas free tier |
| Auth | JWT in HttpOnly cookie | Stateless, works across serverless cold starts, no session store needed |
| Deployment | Vercel + MongoDB Atlas | Zero-config for Next.js; Atlas handles connection pooling |

---

### Multi-Tenancy Model

This project uses the **shared database, shared schema** model with tenant isolation enforced at the query layer.

Every `Site` document carries a `tenantId` field (equal to the user's `_id`). **All API routes filter by `tenantId` extracted from the verified JWT** before touching any site data. This prevents IDOR (Insecure Direct Object Reference) attacks where a user guesses another user's site ID.

```
User signs up
  └─ User._id created
  └─ tenantId = User._id   (self-tenant, 1 user = 1 workspace)

User creates a site
  └─ Site.tenantId = user.tenantId  ← always set server-side
  └─ Site.owner    = user._id

Any GET/PUT/DELETE on /api/sites/:id
  └─ Site.findOne({ _id, tenantId: user.tenantId })  ← isolation guaranteed
```

**Why not a separate Tenant collection?**  
For this scale, it's unnecessary overhead. A `Tenant` model would make sense when supporting team accounts (multiple users per workspace), billing plans, or cross-tenant admin tools — all out of scope here and noted as future work.

---

### Database Schema

```
User
  _id, name, email, passwordHash (select: false), tenantId, timestamps

Site
  _id, tenantId (index), owner, title, description, slug (unique),
  template, sections[], theme{}, published, pageViews, seo{}, timestamps

Section (embedded subdocument)
  type: 'hero' | 'about' | 'contact'
  content: { heading, subheading, body, ctaLabel, email }

Theme (embedded subdocument)
  primaryColor, bgColor, textColor, fontFamily
```

Sections are embedded (not referenced) because they are always loaded with the site and rarely exceed a handful of items. This avoids a join and keeps the site document self-contained for the renderer.

---

### Folder Structure

```
siteforge/
├── pages/
│   ├── _app.js              # Auth context, global layout wrapper
│   ├── _document.js         # Font loading
│   ├── index.js             # Landing/home
│   ├── login.js
│   ├── signup.js
│   ├── dashboard/
│   │   └── index.js         # Workspace: list, create, delete sites
│   ├── builder/
│   │   └── [id].js          # Live editor page
│   ├── site/
│   │   └── [slug].js        # Public site renderer (SSR, no auth)
│   └── api/
│       ├── auth/
│       │   ├── signup.js
│       │   ├── login.js
│       │   ├── logout.js
│       │   └── me.js
│       └── sites/
│           ├── index.js     # GET list, POST create
│           ├── [id].js      # GET, PUT, DELETE single site
│           └── public.js    # GET by slug (increments pageViews)
├── components/
│   ├── Layout/              # Header, footer, nav
│   ├── SiteCard/            # Dashboard site card
│   ├── TemplateSelector/    # Template picker grid
│   ├── LiveEditor/          # Split-panel editor
│   └── SiteRenderer/        # Renders site from config (used in preview + public page)
├── lib/
│   ├── mongodb.js           # Connection caching
│   ├── auth.js              # JWT sign/verify/cookie helpers
│   └── slugify.js
├── models/
│   ├── User.js
│   └── Site.js
└── styles/
    ├── globals.scss          # Design tokens, utility classes
    └── pages/               # Page-level SCSS modules
```

---

### Public Site Rendering

`/site/:slug` uses `getServerSideProps` (SSR) rather than client-side fetch for two reasons:

1. **SEO** — page title and meta tags are rendered server-side, making sites indexable.
2. **Page view counting** — the server atomically increments `pageViews` via `$inc` on every real request, not AJAX calls that could be cached or blocked.

The renderer (`SiteRenderer`) uses **CSS custom properties** (`--sf-primary`, `--sf-bg`, etc.) injected via inline `style` so themes work without rebuilding any CSS.

---

### Authentication Flow

```
Signup/Login
  └─ POST /api/auth/signup|login
  └─ bcrypt password verification
  └─ JWT signed with userId + tenantId
  └─ Set as HttpOnly cookie (7 day expiry)
  └─ Client reads /api/auth/me on boot → Auth context

Protected API routes
  └─ getUserFromRequest(req) parses cookie → verifies JWT
  └─ Returns null → 401
  └─ Returns payload → proceed with tenantId

Logout
  └─ POST /api/auth/logout → Max-Age=0 clears cookie
```

---

## What's Complete

- [x] User signup / login / logout
- [x] JWT auth with HttpOnly cookies
- [x] Multi-tenant data isolation (tenantId on all queries)
- [x] Dashboard with stats (total sites, published count, total views)
- [x] Create site with template picker (Landing, Portfolio, Business)
- [x] Live editor — content, theme colours, font, publish toggle
- [x] Instant preview panel (no save required to preview locally)
- [x] Public site rendering at `/site/:slug`
- [x] Page view counter (atomic `$inc`)
- [x] Basic SEO meta tags on public pages
- [x] SCSS modules throughout

---

## What's Incomplete / Known Trade-offs

| Feature | Status | Notes |
|---|---|---|
| Custom domain mapping | ❌ Not started | Requires DNS CNAME + middleware to resolve host → tenant |
| Drag & drop builder | ❌ Not started | Would need a library like `dnd-kit`; significant scope |
| Image upload | ❌ Not started | Need S3/Cloudinary integration |
| Version history | ❌ Not started | Store Site snapshots in a separate collection |
| Theme switching (presets) | ⚠️ Partial | Individual colour/font editing works; preset themes not wired |
| Rate limiting | ❌ Not started | Should add on auth routes in production |
| Input sanitization | ⚠️ Basic | Mongoose validators present; no XSS sanitizer on rich text |
| Tests | ❌ Not started | Would add Jest + React Testing Library for components, Supertest for API |
| Refresh token rotation | ❌ Not started | Current 7-day JWT is not rotated; fine for demo scope |

---

## Deployment

### Vercel (Frontend + API Routes)

```bash
# Install Vercel CLI
npm i -g vercel

vercel --prod
# Set environment variables in Vercel dashboard:
# MONGODB_URI, JWT_SECRET, NEXT_PUBLIC_BASE_URL
```

Next.js API routes deploy as Vercel serverless functions automatically. No separate backend server needed.

### MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` (all IPs) for Vercel's dynamic egress
3. Copy the connection string into `MONGODB_URI`

---

## Design Decisions & Trade-offs

**Why Pages Router over App Router?**  
The challenge specified `page` folder structure. App Router also introduces more complexity (server components, streaming) that isn't needed to demonstrate the core architecture.

**Why JWT over session-based auth?**  
Serverless functions are stateless — there's no shared memory between invocations. Storing sessions in Redis would add infrastructure. JWT in an HttpOnly cookie is simple, secure, and stateless by default.

**Why embed sections instead of referencing?**  
Sites and sections always load together. Embedding avoids a second DB round-trip and keeps the document self-contained. The downside is that very large section arrays could bloat documents, but for this use case (3–5 sections per site) it's not a concern.

**Why `$inc` for page views?**  
MongoDB's `findOneAndUpdate` with `$inc` is atomic. Doing a `findOne` + `updateOne` separately would create a race condition under concurrent requests — two requests could both read `pageViews: 5` and both write `6` instead of `7`.

---

## What I'd Do With More Time

1. **Rate limiting** on auth routes (express-rate-limit or Upstash Redis)
2. **Image uploads** via Cloudinary (drag-and-drop into sections)
3. **Version history** — snapshot `site.sections` + `site.theme` on each save
4. **Custom domains** — middleware reads `Host` header, resolves to tenant slug
5. **Drag & drop sections** with `dnd-kit`
6. **Test suite** — API integration tests + component unit tests
7. **Analytics dashboard** — chart page views over time (store per-day counts)

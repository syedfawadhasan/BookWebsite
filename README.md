# A New Book — Prelaunch Site

Three pages — Home, About the Book, Author — sharing one visual design
(Source Sans 3 + Source Serif 4, a textured cream/sage background with
translucent glass-style cards, maroon buttons, gold accents), one
Kit-connected subscribe form, one Instagram link, and a real canvas-based
PDF reader (view-only, no download) reachable via a `?read=filename` link.

## The color scheme

```
--bg           #F6F5EC   page base color (behind the texture)
--surface      rgba(252,251,245,0.82)   translucent card backgrounds
--surface-opaque #FBFAF4   solid cream — button text, icon fills (not translucent)
--icon-bg      #D8DEC5   icon circle backgrounds
--ink          #2E3B2A   body text
--ink-dark     #26331F   headings
--muted        #4B5545   subtitle/description text
--muted-2/3/4  various   secondary text shades
--gold         #C2A86A   rules, dividers
--gold-text    #8A7238   the "Something is taking shape" badge text
--maroon       #7B2E2E   buttons + active nav (used sparingly, on purpose)
```

All defined once as CSS variables at the top of `assets/css/style.css`
— change a value there and it updates everywhere that color is used, no
hunting through individual rules. Two near-identical variables exist on
purpose: `--surface` is translucent (for the glass-card look, paired with
`backdrop-filter: blur()`), `--surface-opaque` is solid (for text/icons
that need to stay fully readable regardless of what's behind them).

## The textured background

An actual `<svg>` element (not a CSS trick) sits behind the page content
on every page — `.textured-bg` on the wrapper plus a `.textured-bg-svg`
as its first child. It's a fixed 1100px-tall band pinned to the top of
the page, using `viewBox` + `preserveAspectRatio="xMidYMid slice"` (the
SVG equivalent of `background-size: cover`) so it scales cleanly across
screen widths without distortion.

Two earlier approaches were tried and abandoned in favor of this one,
worth knowing about if the background ever looks flat again:

1. **A CSS `background-image` data URI** — worked in testing but proved
   fragile; if anything corrupts the encoded SVG string, the browser
   silently drops the entire `background-image` and falls back to a flat
   color, with no visible error. An actual `<svg>` element can't fail
   that way.
2. **Stretching the SVG to the full page height** — the wave artwork's
   visible detail is concentrated toward the bottom of its own artwork,
   so on a page taller than the artwork's native 1100px, most of what's
   visible above the fold was the wave's empty top corner. Fixing the
   height to 1100px and anchoring it to the top (like a hero band)
   guarantees the actual artwork is always what you see first.

**If the background ever looks flat again:** the most likely cause is a
container between `.textured-bg-svg` and the content picking up an
opaque `background` — the SVG uses `z-index: -1`, so any solid
background painted by a wrapping element will cover it completely. Don't
add a `background-color` to `.textured-bg` or `.site-shell` — the SVG
already includes its own base fill (`#FAF9F2`) as its first shape, so no
separate fallback color is needed there.

The page background isn't a flat color — it's a few soft, large radial
gradients layered over a diagonal base gradient, all in the same sage/
olive family, giving a gentle textured look without needing an image
file. That's in the `.site-shell` rule near the top of the stylesheet.

## What's in here

```
index.html               homepage — hero, stat cards, subscribe + Instagram
about-book.html           About the Book — description + link to the real sample chapter
author.html                Author — bio (single column, no photo) + subscribe + Instagram
assets/css/style.css       all styling
assets/js/main.js          subscribe form(s) (Kit) + the real ?read= PDF reader
assets/files/               drop chapter/sample PDFs here
README.md                   this file
```

## The subscribe form(s)

Connected — `assets/js/main.js` has your Kit form ID (`9810442`) wired
in, powering the subscribe form on every page (Home, About the Book,
Author, and the one inside the PDF reader) from one shared function. Test
by submitting a real email on the live page, then check **Grow →
Subscribers** in Kit to confirm it landed (the on-page "Thanks" message
shows as soon as the request goes out, not as proof Kit received it — a
CORS limitation, so Kit's own subscriber list is the real check).

## The Instagram link

Points to `https://www.instagram.com/leena.author/` everywhere it
appears — Home, About the Book, Author, and inside the reader. Displayed
handle is `@leena.author` to match. To change it, find-and-replace both
the URL and the displayed handle across all four spots (`index.html`,
`about-book.html`, `author.html`, and the reader's action card in
`index.html`).

## Reading a sample chapter

The "Read the sample" button on **About the Book** links to
`index.html?read=sample-chapter` — the reader overlay only lives on
`index.html`, so this link crosses pages on purpose; About the Book
doesn't need its own copy of the reader.

To make this live:

1. Drop the actual sample chapter PDF into `assets/files/`, named
   `sample-chapter.pdf` (or rename it and update the link in
   `about-book.html` to match).
2. That's it — no other config needed.

You can share direct chapter links the same way for any other PDF: drop
`assets/files/chapter-3.pdf` in, share `your-domain.com/?read=chapter-3`.
Opening it goes straight into the full-screen, view-only reader — no
native browser PDF toolbar, no visible download link, right-click and
Ctrl+S/Ctrl+P blocked, Escape or "← Back to the book" exits. On desktop,
subscribe + Instagram sit in a **left sidebar** that stays visible the
whole time — no need to scroll away from the chapter to see them. Below
about 880px wide (tablets/phones), the sidebar moves below the reading
area instead, since there's no room for both side by side.

As before: this deters casual downloading and sharing but isn't real
security — the file is a plain static PDF anyone with the exact URL can
fetch, and a technically determined visitor could still find it via
DevTools. Real access control needs a backend issuing temporary,
authenticated links.

## Mobile sharpness

The reader renders each page at the device's actual pixel density
(`window.devicePixelRatio`), not just CSS pixels — this is what keeps
pages sharp on phones (which usually pack 2-3x more physical pixels per
CSS pixel than a laptop display) instead of looking hazy/stretched. This
logic is unchanged from the previous build.

## Testing locally

Don't just double-click `index.html` — PDF.js needs a background Worker
script, which browsers block under `file://`. Serve the folder instead:

```
python -m http.server 8000
```

or `npx serve`, then open `http://localhost:.../` (homepage),
`http://localhost:.../about-book.html`, `http://localhost:.../author.html`,
and `http://localhost:.../?read=sample-chapter` (reader) from there.

## Deploying

```
git add .
git commit -m "Redesign site to new Karla/Source Serif 4 palette"
git push
```

GitHub Pages rebuilds automatically within about a minute.

## Notes

- Nav tabs (Home / About the Book / Author) highlight whichever page
  you're on — filled maroon background, matching the reference design.
- Icons (the book/calendar/envelope/camera glyphs in the circle badges)
  are small inline SVGs, right there in the HTML next to the text they
  belong to — no icon font or external library. Swap the `<svg>...</svg>`
  content to change one.
- Every HTML file has `<!-- ===== SECTION ===== -->` comments marking
  each block (header, hero, stat cards, subscribe/Instagram, etc.) so
  it's easy to find the right spot to edit in a code editor without
  reading the whole file. The subscribe + Instagram block is identical
  on every page — if you change the copy or the Instagram link, you'll
  need to update it in each file (`index.html` twice — homepage and
  reader sidebar — plus `about-book.html` and `author.html`).
- The sticky header is intentionally compact (smaller logo, tighter
  padding) so it takes less vertical space on every page.
- Wondering about an "unsubscribe" feature? See the section below —
  short answer, Kit already handles this for you automatically.

## About unsubscribing

You don't need to build anything for this. Every email Kit sends on
your behalf automatically includes an unsubscribe link in the footer —
that's a legal requirement (CAN-SPAM/GDPR), and Kit handles it whether
you think about it or not. Clicking it removes that person from your
list immediately, no code involved.

What you *can't* easily do is add an "unsubscribe" box to this website
itself (the way the "Notify me" box subscribes people). Unsubscribing
someone requires calling Kit's API with a secret key, and that key can't
safely live in a static site's JavaScript — anyone could view the page
source and find it, then unsubscribe *anyone* on your list. The
subscribe form works differently: Kit's public subscription endpoint is
designed to be called from a browser with no secret involved, which is
why that one's safe to have here.

If you ever want a **custom** unsubscribe link (e.g. "stop launch emails
but stay on my main list" rather than a full unsubscribe), that's a
different feature — Kit calls it a "custom unsubscribe link," and you
set it up inside Kit itself (a link trigger tied to a tag or sequence),
not on this website. Worth knowing about if you run a launch sequence
later, but not something this site needs right now.

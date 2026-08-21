# Thank You — Read-Only Site

A minimal, single-purpose page: someone opens it, sees a short "thank you"
message, and if they were sent a chapter link, it takes them straight into
a read-only PDF viewer. No other pages, no subscribe form, no book
marketing content — just the reader.

## What's in here

```
index.html               the whole site (one page)
assets/css/style.css     shared styles + reader styling
assets/js/main.js        menu switching + PDF reader
assets/files/            drop chapter PDFs here — see "Sharing a chapter" below
README.md                this file
```

## How the menu works

There's one `<section class="page">` (Read) and one nav link. The same
hash-based switching mechanism from earlier builds is still here
underneath — `assets/js/main.js` shows whichever `.page` matches the URL
hash and defaults to `#read` since it's the only page — it's just that
with a single section, there's nothing to switch between. If you ever want
to add a second page back, wrap it in `<section id="your-id" class="page">`
and add a matching nav link; no other JS changes needed.


## Sharing a chapter to read online

No page to build and nothing to update in code — the link is just the
filename.

1. Drop a PDF into `assets/files/`, e.g. `assets/files/chapter-3.pdf`.
   Use only letters, numbers, hyphens, and underscores in the filename —
   no spaces.
2. Share this link: `https://your-domain.com/?read=chapter-3`
   (swap `chapter-3` for whatever you named the file, without `.pdf`).
3. Opening that link takes the reader straight into a full-screen viewer —
   they never see the site's normal pages first.

Anyone who just visits the site normally, or clicks the **Read** menu item,
sees a plain "open the link you were sent" message — there's no public
list of chapters anywhere on the site, so a link only works if you've
shared it.

### Testing locally — don't just double-click index.html

PDF.js needs to load a background Worker script to do the actual page
rendering. Browsers block that under the `file://` protocol (opening the
file directly from disk) — it's treated as a restricted origin and can't
load a worker from the CDN. You'll see the reader open, controls appear,
but the page itself stays blank.

**Serve the folder over local http instead.** From inside the site folder:

```
python3 -m http.server 8000
```

then open `http://localhost:8000/?read=your-file-name` in the browser. Any
local static server works the same way (VS Code's "Live Server" extension,
`npx serve`, etc.) — the point is just `http://` instead of `file://`.

Once deployed to GitHub Pages it'll be `https://`, and this issue doesn't
come up at all — this is purely a local-testing quirk.

**What this does and doesn't prevent:** the viewer renders each page as an
image on a canvas rather than an embedded PDF, so there's no browser
toolbar, no visible download button, and no direct link to the raw file.
Right-click and Ctrl+S/Ctrl+P are also blocked while it's open. None of
that stops someone determined — a screenshot, or opening browser dev tools
and pulling the file from the network tab, both still work. This is a
casual-download deterrent, not real access control. Real access control
would mean a backend issuing temporary, authenticated links instead of a
plain static file anyone with the URL can fetch — a bigger project than a
static GitHub Pages site.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (or use an existing one).
2. Upload these files to the repository, keeping the folder structure intact
   — `index.html` at the root, `assets/` as a folder next to it. You can drag
   and drop them in the GitHub web UI, or:
   ```
   git init
   git add .
   git commit -m "Add book website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`. Save.
5. GitHub will publish the site at
   `https://YOUR-USERNAME.github.io/YOUR-REPO/` within a minute or two.

### Using a custom domain

If you want a domain instead of the github.io URL, add it under
**Settings → Pages → Custom domain**, then point your domain's DNS to
GitHub Pages (an `A` record to GitHub's IPs, or a `CNAME` record to
`YOUR-USERNAME.github.io` for a subdomain). GitHub's docs walk through the
exact DNS records: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site

## Notes

- This is intentionally bare-bones — one page, one job. If you later want
  the full marketing site (Home, Inside, How it works, subscribe form,
  Author, Buy) back alongside this, that's a separate build — just ask, the
  pieces from the earlier version still exist and can be reintroduced.

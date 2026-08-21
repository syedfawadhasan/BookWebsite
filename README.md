# Tomorrow Takes Practice — Website

A single-page site for the book, with an embedded Kit (ConvertKit) subscribe form.

## What's in here

```
index.html               the home page
assets/css/style.css     shared styles, hover states, subscribe/reader styling
assets/js/main.js        menu switching + subscribe form + PDF reader
assets/img/book-cover.jpg  the book cover image
assets/files/            drop chapter PDFs here — see "Sharing a chapter" below
README.md                this file
```

## How the menu works

The page is built as several `<section class="page">` blocks (Home, Inside,
How it works, Get updates, Author, Buy) inside one `index.html`. Only one is
visible at a time — clicking a nav link doesn't scroll to content that's
already on the page, it switches which section is shown.

`assets/js/main.js` reads the URL hash (e.g. `#inside`), shows the matching
`.page`, hides the rest, and highlights the matching nav link. It defaults
to `#home` if there's no hash or an unrecognized one. To add a new section
to the menu: wrap it in `<section id="your-id" class="page">…</section>`
and add `<a href="#your-id" class="nav-link" data-page="your-id">Label</a>`
in the nav — no other JS changes needed.

## The subscribe form

**⚠️ One setup step required before this works.** The "Get notified when the
book launches" form is a plain HTML form we own outright — styled entirely
by `style.css`, no injected script, no separate stylesheet to fight with.
It posts directly to Kit's subscription endpoint via JavaScript
(`assets/js/main.js`) so the page never navigates away.

To connect it to your list:

1. In Kit, go to **Grow → Landing Pages & Forms** and open your form.
2. Look at the URL in your browser's address bar — it'll contain a number,
   e.g. `app.kit.com/forms/1234567/edit`. That number is your form ID.
3. Open `assets/js/main.js`, find this line near the bottom:
   ```js
   var KIT_FORM_ID = 'REPLACE_WITH_YOUR_FORM_ID';
   ```
   and replace `'REPLACE_WITH_YOUR_FORM_ID'` with your actual numeric ID
   (still in quotes), e.g. `var KIT_FORM_ID = '1234567';`
4. Deploy, submit a test email on the live page, and check **Grow →
   Subscribers** in Kit to confirm it landed.

**Why there's no visible confirmation from Kit itself:** the endpoint this
posts to doesn't let the browser read its response (a CORS restriction), so
the page shows "Thanks — check your inbox to confirm" as soon as the
request completes without a network error, rather than waiting for Kit to
confirm success. If an email doesn't land in Kit after testing, double-check
the form ID first.

There's no "Built with Kit" badge to worry about anymore, since this is our
own form — nothing from Kit renders on the page except the confirmation
email it sends after someone subscribes.

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

- This package currently has only the home page. If you'd like the other
  pages (Book, Author, Sample, Reviews, FAQ, Contact) built out in this same
  visual style, that's a separate step — just ask.
- The "AUTHOR PHOTO" circle and "Author Name" placeholders in the Author
  section still need your real photo and bio.

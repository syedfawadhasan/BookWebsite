# Tomorrow Is a Practice — Website

## Project structure

```
/
├── index.html              ← the whole site (all pages/sections)
├── assets/
│   ├── css/style.css        ← all site styling
│   ├── js/main.js           ← navigation, FAQ accordion, PDF reader logic
│   └── img/book-cover.jpg   ← book cover image
├── files/                   ← put chapter PDFs here (see below)
└── README.md
```

This is a **static site** — plain HTML/CSS/JS, no build step, no server-side
code required. It works on any standard web host.

---

## Adding chapters to the "Read" page

Open `assets/js/main.js` and find `READ_LIBRARY` near the top. Add one entry
per chapter:

```js
const READ_LIBRARY = {
  'ch1-tafakkur': {
    title: 'Chapter 1 — Tafakkur',
    subtitle: 'Reflection',
    url: 'files/ch1-tafakkur.pdf'
  },
  'ch2-sabr': {
    title: 'Chapter 2 — Sabr',
    subtitle: 'Patience',
    url: 'files/ch2-sabr.pdf'
  }
};
```

Drop the actual PDF files into the `/files` folder with matching filenames.
Because the PDFs now live on your own site (instead of an external host),
there's no CORS issue to worry about — this is the easiest setup.

Each chapter also gets a direct shareable link automatically:
`yoursite.com/index.html?read=ch1-tafakkur`

---

## Deploying — pick your provider

### Option A: GoDaddy / cPanel (traditional hosting)

1. Log into your hosting account and open **File Manager** (or connect via
   FTP using a client like FileZilla).
2. Navigate to your site's web root — usually `public_html/`.
3. Upload the **entire contents** of this project folder (not the folder
   itself — the files and subfolders should sit directly inside
   `public_html/`).
4. Confirm `index.html` ends up at `public_html/index.html`.
5. Visit your domain — it should load immediately. No build step needed.

If you want the book site on a subdomain (e.g. `book.yourdomain.com`)
instead of the main domain, create the subdomain in cPanel first, then
upload into that subdomain's folder instead.

### Option B: Netlify or Vercel (modern static hosting, free tier)

**Drag-and-drop (fastest, no account setup beyond signing in):**
1. Go to [netlify.com](https://netlify.com) (or [vercel.com](https://vercel.com)) and sign in.
2. Drag this whole project folder onto their dashboard upload area.
3. It deploys automatically and gives you a live URL in seconds.
4. Add your custom domain under **Site settings → Domain management**.

**Git-based (better for ongoing edits):**
1. Push this project folder to a GitHub repository.
2. Connect that repo in Netlify/Vercel — it auto-deploys on every push.
3. Add your custom domain the same way as above.

---

## Testing before you deploy

Because this site uses PDF.js and the Kit form, some features only work
correctly when served over `http://` or `https://` — not when opening
`index.html` directly as a `file://` path. To test locally first:

- **Simplest:** open a terminal in this folder and run `python3 -m http.server 8000`,
  then visit `http://localhost:8000` in your browser.
- Or just upload to your host and test live — for a small static site,
  that's often just as fast.

---

## Custom domain checklist

- [ ] Domain purchased and pointed at your host (DNS records set)
- [ ] SSL certificate active (most hosts do this automatically — look for
      the padlock icon once live)
- [ ] Kit form tested end-to-end with a real email
- [ ] All placeholder text (author bio, sample excerpt, focus group quotes)
      replaced with final content
- [ ] Contact page email/Instagram links updated with your real handles

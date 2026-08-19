// ============================================================
  // READ / PDF VIEWER
  //
  // HOW TO ADD A NEW CHAPTER:
  // 1. Host the PDF somewhere with a direct file link (your own
  //    server, an S3/Cloud bucket, etc.).
  // 2. Add an entry to READ_LIBRARY below with a short id, title,
  //    subtitle, and the direct PDF url.
  // 3. Share a link like: yoursite.com/index.html?read=sabr-ch3
  //    That link opens THIS SAME PAGE and loads that file — no new
  //    page needed per chapter.
  //
  // Ad-hoc fallback (skips the library entirely):
  //   yoursite.com/index.html?src=https://yourhost.com/file.pdf&title=Chapter%20Name
  // ============================================================

  const READ_LIBRARY = {
    'sample-sabr': {
      title: 'Chapter — Sabr (Patience)',
      subtitle: 'A first look at the book, in full.',
      url: '' // paste a direct PDF link here
    }
    // Add more entries here, e.g.:
    // 'ch1-tafakkur': { title: 'Chapter 1 — Tafakkur', subtitle: 'Reflection', url: 'https://...' }
  };

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  function renderDocGrid(){
    const grid = document.getElementById('doc-grid');
    const ids = Object.keys(READ_LIBRARY);
    if (ids.length === 0){
      grid.innerHTML = '<p style="color:var(--navy-soft); grid-column:1/-1; text-align:center; padding: 30px;">No chapters posted yet — check back soon.</p>';
      return;
    }
    grid.innerHTML = ids.map(id => {
      const d = READ_LIBRARY[id];
      return `<div class="doc-card" onclick="openDocById('${id}')">
        <div class="doc-eyebrow">Chapter</div>
        <div class="doc-title">${d.title}</div>
        <div class="doc-sub">${d.subtitle || ''}</div>
        <div class="doc-cta">Read now &rarr;</div>
      </div>`;
    }).join('');
  }

  function openDocById(id){
    const d = READ_LIBRARY[id];
    if (!d || !d.url){
      alert('This chapter link hasn\'t been connected yet.');
      return;
    }
    openViewer(d.url, d.title);
    history.pushState({}, '', '?read=' + encodeURIComponent(id));
  }

  function closeViewer(){
    document.getElementById('read-viewer').style.display = 'none';
    document.getElementById('read-library').style.display = 'block';
    history.pushState({}, '', location.pathname);
  }

  async function openViewer(url, title){
    goTo('read');
    document.getElementById('read-library').style.display = 'none';
    document.getElementById('read-viewer').style.display = 'block';
    document.getElementById('pdf-title-bar').textContent = title || 'Reading';
    const pagesEl = document.getElementById('pdf-pages');
    pagesEl.innerHTML = '<div class="pdf-status" id="pdf-status">Loading document…</div>';

    if (!window.pdfjsLib){
      pagesEl.innerHTML = '<div class="pdf-status">Viewer failed to load. Check your connection and try again.</div>';
      return;
    }

    try{
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      pagesEl.innerHTML = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++){
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const wrap = document.createElement('div');
        wrap.className = 'pdf-page-wrap';

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const watermark = document.createElement('div');
        watermark.className = 'pdf-watermark';
        watermark.innerHTML = '<span>Preview Copy — Not for Distribution</span>';

        wrap.appendChild(canvas);
        wrap.appendChild(watermark);
        pagesEl.appendChild(wrap);
      }
    } catch (err){
      pagesEl.innerHTML = '<div class="pdf-status">This document couldn\'t be loaded. Double-check the file link.</div>';
      console.error(err);
    }
  }

  // Block right-click / context menu and common save-print shortcuts
  // inside the reader. Note: this deters casual saving but is not a
  // true DRM guarantee — see caveat in chat.
  document.addEventListener('contextmenu', function(e){
    if (e.target.closest('#page-read')) e.preventDefault();
  });
  document.addEventListener('keydown', function(e){
    const readerOpen = document.getElementById('page-read').classList.contains('active');
    if (!readerOpen) return;
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (key === 's' || key === 'p')){
      e.preventDefault();
    }
  });

  // On load: check for ?read=id or ?src=url&title=... and jump straight to it
  function initReadRouting(){
    renderDocGrid();
    const params = new URLSearchParams(location.search);
    const readId = params.get('read');
    const src = params.get('src');
    if (readId && READ_LIBRARY[readId]){
      openDocById(readId);
    } else if (src){
      openViewer(decodeURIComponent(src), params.get('title') ? decodeURIComponent(params.get('title')) : 'Reading');
    }
  }
  window.addEventListener('DOMContentLoaded', initReadRouting);

  function goTo(id){
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.dataset.page === id));
    document.querySelector('nav ul').classList.remove('open');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      goTo(el.dataset.page);
      if (el.dataset.page === 'read'){
        document.getElementById('read-viewer').style.display = 'none';
        document.getElementById('read-library').style.display = 'block';
        history.pushState({}, '', location.pathname);
      }
    });
  });
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => q.parentElement.classList.toggle('open'));
  });

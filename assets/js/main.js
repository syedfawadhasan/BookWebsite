// Menu-controlled sections: show only the .page whose id matches the URL
// hash, hide the rest, and highlight the matching nav link. Defaults to
// #read when there's no hash (or an unrecognized one) — this build only
// has the one page.

(function () {
  var DEFAULT_PAGE = 'read';

  function currentPageId() {
    var hash = window.location.hash.replace('#', '');
    var page = document.getElementById(hash);
    return page && page.classList.contains('page') ? hash : DEFAULT_PAGE;
  }

  function showPage(id) {
    document.querySelectorAll('.page').forEach(function (section) {
      section.classList.toggle('is-active', section.id === id);
    });
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.classList.toggle('is-current', link.getAttribute('data-page') === id);
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', function () {
    showPage(currentPageId());
  });

  document.addEventListener('DOMContentLoaded', function () {
    showPage(currentPageId());
  });
})();

// ---- Subscribe form ----
// Posts straight to Kit's subscription endpoint with fetch (no page
// navigation), and shows an inline message. Kit's plain-form endpoint
// doesn't return a readable response due to CORS, so success is assumed
// once the request completes without a network error — check your Kit
// dashboard's subscriber list after testing to confirm it's landing.
//
// ⚠️ Replace KIT_FORM_ID below with your form's numeric ID (not the
// "a10c6e87b9" uid used for the old embed script). Find it in Kit:
// Grow → Landing Pages & Forms → open the form → the URL in your browser's
// address bar will contain a number, e.g. app.kit.com/forms/1234567/edit
// — 1234567 is the ID you need.

(function () {
  var KIT_FORM_ID = 'REPLACE_WITH_YOUR_FORM_ID';
  var ENDPOINT = 'https://app.kit.com/forms/' + KIT_FORM_ID + '/subscriptions';

  var form = document.getElementById('subscribeForm');
  if (!form) return;

  var emailInput = document.getElementById('subscribeEmail');
  var button = form.querySelector('.subscribe-button');
  var message = document.getElementById('subscribeMessage');

  function showMessage(text, type) {
    message.textContent = text;
    message.className = 'subscribe-message ' + type;
    message.hidden = false;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (KIT_FORM_ID === 'REPLACE_WITH_YOUR_FORM_ID') {
      showMessage('Form isn\u2019t connected yet \u2014 add your Kit form ID in main.js.', 'error');
      return;
    }

    var email = emailInput.value.trim();
    if (!email) return;

    button.disabled = true;
    button.textContent = 'SUBSCRIBING\u2026';

    var body = new FormData();
    body.append('email_address', email);

    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: body
    })
      .then(function () {
        showMessage('Thanks \u2014 check your inbox to confirm.', 'success');
        form.reset();
      })
      .catch(function () {
        showMessage('Something went wrong. Please try again.', 'error');
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = 'SUBSCRIBE';
      });
  });
})();

// ---- PDF reader ----
// A link like yoursite.com/?read=chapter-3 loads assets/files/chapter-3.pdf
// and renders it in a full-screen canvas-based viewer — no new page to
// build, no list to maintain. Adding a chapter is just dropping the PDF
// into assets/files/ with the filename you want in the link.
//
// This deters casual downloading (no native PDF toolbar, no visible link
// to the raw file, right-click and Ctrl+S/Ctrl+P are blocked) but can't
// stop someone determined — screenshots or browser dev tools still work
// around it. True lock-down would need a backend serving authenticated,
// temporary links instead of a public static file.

(function () {
  var FILES_PATH = 'assets/files/';
  var SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

  var params = new URLSearchParams(window.location.search);
  var slug = params.get('read');
  if (!slug) return;

  if (!SLUG_PATTERN.test(slug)) {
    return; // ignore malformed values rather than attempting a fetch
  }

  if (typeof pdfjsLib === 'undefined') {
    return; // PDF.js failed to load (e.g. offline) — reader just won't open
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  var overlay = document.getElementById('pdfReaderOverlay');
  var titleEl = document.getElementById('pdfReaderTitle');
  var statusEl = document.getElementById('pdfReaderStatus');
  var viewport = document.getElementById('pdfReaderViewport');
  var controls = document.getElementById('pdfReaderControls');
  var canvas = document.getElementById('pdfReaderCanvas');
  var watermark = overlay.querySelector('.pdf-reader-watermark');
  var prevBtn = document.getElementById('pdfPrevPage');
  var nextBtn = document.getElementById('pdfNextPage');
  var pageIndicator = document.getElementById('pdfPageIndicator');

  var pdfDoc = null;
  var currentPage = 1;
  var rendering = false;

  function showStatus(text, isError) {
    statusEl.hidden = false;
    statusEl.textContent = text;
    statusEl.className = 'pdf-reader-status' + (isError ? ' error' : '');
    viewport.hidden = true;
    controls.hidden = true;
  }

  function renderPage(num) {
    if (rendering) return;
    rendering = true;

    pdfDoc.getPage(num).then(function (page) {
      // Render at the device's actual pixel density, not just CSS pixels.
      // Phones commonly pack 2-3 physical pixels into every CSS pixel;
      // without this, the canvas bitmap is lower-resolution than the
      // screen it's displayed on, and the browser stretches it to fit —
      // sharp on a ~1x laptop display, soft/hazy on a 2-3x phone screen.
      var pixelRatio = window.devicePixelRatio || 1;

      var containerWidth = viewport.clientWidth - 64;
      var baseViewport = page.getViewport({ scale: 1 });
      var scale = Math.min(1.4, containerWidth / baseViewport.width);
      var scaledViewport = page.getViewport({ scale: scale });

      // The bitmap (canvas.width/height) is rendered at full device
      // resolution; the display size (canvas.style width/height) stays at
      // the original CSS-pixel dimensions, so the page appears the same
      // physical size on screen — just crisper.
      canvas.width = Math.floor(scaledViewport.width * pixelRatio);
      canvas.height = Math.floor(scaledViewport.height * pixelRatio);
      canvas.style.width = scaledViewport.width + 'px';
      canvas.style.height = scaledViewport.height + 'px';
      watermark.style.width = scaledViewport.width + 'px';
      watermark.style.height = scaledViewport.height + 'px';

      var ctx = canvas.getContext('2d');
      var renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport,
        transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : null
      };

      page.render(renderContext).promise
        .then(function () {
          rendering = false;
          currentPage = num;
          pageIndicator.textContent = 'Page ' + currentPage + ' of ' + pdfDoc.numPages;
          prevBtn.disabled = currentPage <= 1;
          nextBtn.disabled = currentPage >= pdfDoc.numPages;
          viewport.scrollTop = 0;
        })
        .catch(function (err) {
          rendering = false;
          showStatus('This page couldn\u2019t be displayed. If you\u2019re testing from a local file (file://), try serving the folder from a local web server instead \u2014 PDF rendering needs http/https to work. Error: ' + (err && err.message ? err.message : err), true);
        });
    });
  }

  function openReader() {
    document.body.style.overflow = 'hidden';
    overlay.hidden = false;
    showStatus('Loading chapter\u2026', false);

    pdfjsLib.getDocument(FILES_PATH + slug + '.pdf').promise
      .then(function (doc) {
        pdfDoc = doc;
        statusEl.hidden = true;
        viewport.hidden = false;
        controls.hidden = false;
        renderPage(1);
      })
      .catch(function () {
        showStatus('This chapter link isn\u2019t available. Please check the link you were sent.', true);
      });
  }

  prevBtn.addEventListener('click', function () {
    if (pdfDoc && currentPage > 1) renderPage(currentPage - 1);
  });

  nextBtn.addEventListener('click', function () {
    if (pdfDoc && currentPage < pdfDoc.numPages) renderPage(currentPage + 1);
  });

  document.getElementById('pdfReaderClose').addEventListener('click', function () {
    overlay.hidden = true;
    document.body.style.overflow = '';
  });

  overlay.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  document.addEventListener('keydown', function (event) {
    if (overlay.hidden) return;
    var key = event.key ? event.key.toLowerCase() : '';
    if ((event.ctrlKey || event.metaKey) && (key === 's' || key === 'p')) {
      event.preventDefault();
    }
  });

  window.addEventListener('resize', function () {
    if (pdfDoc && !overlay.hidden) renderPage(currentPage);
  });

  openReader();
})();

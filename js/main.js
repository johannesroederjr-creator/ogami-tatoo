/* ═══════════════════════════════════════════════════════════
   OGAMI TATTOO – main.js
   Galerie-Filter · Lightbox · Nav-Toggle · Scroll-Header
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Hilfsfunktion ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ══════════════════════════════════════════
     1. NAV – Hamburger + Scroll-Klasse
  ════════════════════════════════════════════ */
  const header   = $('#site-header');
  const toggle   = $('.nav-toggle');
  const navLinks = $('#nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    });

    // Menü schließen bei Klick auf Link
    $$('a', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Außerhalb klicken → schließen
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll-Klasse auf Header
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════════════════════════════════════
     2. GALERIE-FILTER
  ════════════════════════════════════════════ */
  const filterBtns  = $$('.filter-btn');
  const galleryItems = $$('.gallery-item');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Aktiv-Zustand
        filterBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
          const tags = (item.dataset.tags || '').split(' ');
          const show = filter === '*' || tags.includes(filter);

          if (show) {
            item.classList.remove('is-hidden');
            item.removeAttribute('aria-hidden');
          } else {
            item.classList.add('is-hidden');
            item.setAttribute('aria-hidden', 'true');
          }
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     3. LIGHTBOX
  ════════════════════════════════════════════ */
  const lightbox   = $('#lightbox');
  const lbImg      = $('#lightbox-img');
  const lbClose    = $('#lightbox-close');
  const lbPrev     = $('#lightbox-prev');
  const lbNext     = $('#lightbox-next');

  let currentIndex = 0;
  let visibleItems = [];

  function getVisibleImages() {
    return $$('.gallery-item:not(.is-hidden) .gallery-btn img');
  }

  function openLightbox(index) {
    visibleItems = getVisibleImages();
    if (!visibleItems.length) return;
    currentIndex = index;
    const img = visibleItems[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showPrev() {
    visibleItems = getVisibleImages();
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    const img = visibleItems[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }

  function showNext() {
    visibleItems = getVisibleImages();
    currentIndex = (currentIndex + 1) % visibleItems.length;
    const img = visibleItems[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }

  if (lightbox) {
    // Galerie-Buttons öffnen Lightbox
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery-btn');
      if (!btn) return;
      const allBtns = getVisibleImages();
      const img = btn.querySelector('img');
      const idx = allBtns.indexOf(img);
      openLightbox(idx >= 0 ? idx : 0);
    });

    lbClose?.addEventListener('click', closeLightbox);
    lbPrev?.addEventListener('click', showPrev);
    lbNext?.addEventListener('click', showNext);

    // Klick auf Hintergrund schließt Lightbox
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Tastaturnavigation
    document.addEventListener('keydown', (e) => {
      if (lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   showPrev();
      if (e.key === 'ArrowRight')  showNext();
    });

    // Swipe (Touch)
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) diff < 0 ? showNext() : showPrev();
    });
  }

  /* ══════════════════════════════════════════
     4. SMOOTH-SCROLL für Anker-Links
  ════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();

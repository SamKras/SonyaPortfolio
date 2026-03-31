// Simple, performant Scroll Reveal using IntersectionObserver
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');

  // Immediately reveal elements that should appear on load (hero) by small timeout
  const onLoadReveal = () => {
    const initial = document.querySelectorAll('.hero .reveal, .hero .hero-title, .hero .hero-subtitle');
    initial.forEach((el, i) => {
      // small stagger for hero
      setTimeout(() => el.classList.add('active'), i * 120);
    });
  };

  // IntersectionObserver options
  const obsOptions = {
    root: null,
    rootMargin: '0px 0px -12% 0px', // trigger slightly before element fully in view
    threshold: 0
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target); // reveal once
      }
    });
  }, obsOptions);

  // Observe all reveal elements except those inside hero (we reveal hero on load)
  reveals.forEach(el => {
    if (el.closest('.hero')) return;
    observer.observe(el);
  });

  onLoadReveal();
  
  // LIGHTBOX: open images on the same page
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  let currentIndex = -1;

  const openLightbox = (index) => {
    const src = galleryItems[index].dataset.src;
    if (!src) return;
    currentIndex = index;

    // Preload image to get natural dimensions, then fit into viewport
    const img = new Image();
    img.onload = () => {
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      // compute scale to fit within viewport with 80px total margin
      const maxW = Math.max(window.innerWidth - 80, 200);
      const maxH = Math.max(window.innerHeight - 80, 200);
      const scale = Math.min(maxW / natW, maxH / natH, 1);
      const displayW = Math.round(natW * scale);
      const displayH = Math.round(natH * scale);

      // set inline size to ensure it fits exactly and is not cropped
      lightboxImage.style.width = displayW + 'px';
      lightboxImage.style.height = displayH + 'px';
      lightboxImage.src = src;
      lightboxImage.setAttribute('data-natw', natW);
      lightboxImage.setAttribute('data-nath', natH);

      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    img.src = src;
  };

  const closeLightbox = () => {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
    currentIndex = -1;
    // clear inline sizing
    lightboxImage.style.width = '';
    lightboxImage.style.height = '';
    lightboxImage.removeAttribute('data-natw');
    lightboxImage.removeAttribute('data-nath');
  };

  const showNext = () => {
    if (currentIndex < 0) return;
    const next = (currentIndex + 1) % galleryItems.length;
    openLightbox(next);
  };

  const showPrev = () => {
    if (currentIndex < 0) return;
    const prev = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(prev);
  };

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  // controls
  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

  // click on backdrop closes; clicking the image does NOT close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // keyboard
  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false'){
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });

  // Resize handler: recompute display size if lightbox open
  window.addEventListener('resize', () => {
    if (lightbox.getAttribute('aria-hidden') === 'false' && lightboxImage.getAttribute('data-natw')){
      const natW = parseInt(lightboxImage.getAttribute('data-natw'), 10);
      const natH = parseInt(lightboxImage.getAttribute('data-nath'), 10);
      if (natW && natH){
        const maxW = Math.max(window.innerWidth - 80, 200);
        const maxH = Math.max(window.innerHeight - 80, 200);
        const scale = Math.min(maxW / natW, maxH / natH, 1);
        lightboxImage.style.width = Math.round(natW * scale) + 'px';
        lightboxImage.style.height = Math.round(natH * scale) + 'px';
      }
    }
  });
});

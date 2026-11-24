/**
 * FINEZZA Querétaro — Script Principal & Catálogos Interactivos
 * Controla el Hero cinematográfico, filtros de colecciones, selector de paletas,
 * formulario de cita y el catálogo oficial de 49 modelos Mont Alpi Original Series.
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('inicio');

  // 1. Revelado inicial de texto y botón
  requestAnimationFrame(() => {
    document.body.classList.add('is-loaded');
  });

  // 2. Secuencia Cinematográfica de Portada (10 Vistas en Orden Aleatorio cada 5s)
  const heroStage = document.getElementById('heroStage');
  let heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const sceneDots = Array.from(document.querySelectorAll('.scene-dot'));
  const prevSceneBtn = document.getElementById('prevSceneBtn');
  const nextSceneBtn = document.getElementById('nextSceneBtn');
  const heroFooterCode = document.getElementById('heroFooterCode');
  const heroFooterLabel = document.getElementById('heroFooterLabel');

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  if (heroStage && heroSlides.length > 1) {
    const wideSlides = shuffleArray(heroSlides.filter((s) => s.getAttribute('data-type') !== 'detail'));
    const detailSlides = shuffleArray(heroSlides.filter((s) => s.getAttribute('data-type') === 'detail'));
    const randomizedSlides = [];

    let wIdx = 0;
    let dIdx = 0;
    while (wIdx < wideSlides.length || dIdx < detailSlides.length) {
      if (wIdx < wideSlides.length) {
        randomizedSlides.push(wideSlides[wIdx++]);
      }
      if (dIdx < detailSlides.length && (Math.random() < 0.65 || wIdx >= wideSlides.length)) {
        randomizedSlides.push(detailSlides[dIdx++]);
      }
    }

    heroSlides = randomizedSlides;
    heroSlides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === 0);
      slide.classList.remove('is-leaving');
      heroStage.appendChild(slide);
    });
  }

  const totalScenes = heroSlides.length;

  function formatSceneCode(index) {
    const num = String(index + 1).padStart(2, '0');
    const total = String(totalScenes).padStart(2, '0');
    return `VISTA ${num} / ${total}`;
  }

  function updateFooterMetadata(index, immediate = false) {
    const slide = heroSlides[index];
    if (!slide || !heroFooterCode || !heroFooterLabel) return;
    const label = slide.getAttribute('data-label') || 'DISEÑO MODERNO ITALIANO • PROYECTO INTEGRAL FINEZZA';
    const code = formatSceneCode(index);

    if (immediate) {
      heroFooterCode.textContent = code;
      heroFooterLabel.innerHTML = label;
      return;
    }

    heroFooterLabel.classList.add('is-changing');
    setTimeout(() => {
      heroFooterCode.textContent = code;
      heroFooterLabel.innerHTML = label;
      heroFooterLabel.classList.remove('is-changing');
    }, 180);
  }

  updateFooterMetadata(0, true);

  let currentScene = 0;
  let sceneTimer = null;
  let isHeroInViewport = true;
  const SCENE_DURATION_MS = 5000;

  function goToScene(index) {
    if (!heroSlides.length) return;
    const nextIndex = (index + heroSlides.length) % heroSlides.length;
    if (nextIndex === currentScene && heroSlides[nextIndex].classList.contains('is-active')) {
      return;
    }

    const previousSlide = heroSlides[currentScene];
    const nextSlide = heroSlides[nextIndex];
    const nextImg = nextSlide.querySelector('.hero-cover');

    if (nextImg) {
      nextImg.style.animation = 'none';
      void nextImg.offsetWidth;
      nextImg.style.animation = '';
    }

    heroSlides.forEach((slide, i) => {
      slide.classList.remove('is-leaving');
      if (i === nextIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    if (previousSlide && previousSlide !== nextSlide) {
      previousSlide.classList.add('is-leaving');
    }

    sceneDots.forEach((dot, i) => {
      const isActive = i === nextIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      const fill = dot.querySelector('.scene-dot-fill');
      if (fill) {
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = isActive ? 'sceneProgressFill 5s linear forwards' : '';
      }
    });

    updateFooterMetadata(nextIndex, false);
    currentScene = nextIndex;
  }

  function startSceneAutoplay() {
    stopSceneAutoplay();
    if (!isHeroInViewport) {
      if (heroSection) heroSection.classList.add('is-paused');
      return;
    }
    if (heroSection) heroSection.classList.remove('is-paused');
    sceneTimer = setInterval(() => {
      goToScene(currentScene + 1);
    }, SCENE_DURATION_MS);
  }

  function stopSceneAutoplay() {
    if (sceneTimer) {
      clearInterval(sceneTimer);
      sceneTimer = null;
    }
  }

  sceneDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.getAttribute('data-scene'), 10);
      if (!Number.isNaN(target)) {
        goToScene(target);
        startSceneAutoplay();
      }
    });
  });

  if (prevSceneBtn) {
    prevSceneBtn.addEventListener('click', () => {
      goToScene(currentScene - 1);
      startSceneAutoplay();
    });
  }

  if (nextSceneBtn) {
    nextSceneBtn.addEventListener('click', () => {
      goToScene(currentScene + 1);
      startSceneAutoplay();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!isHeroInViewport) return;
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') {
      goToScene(currentScene + 1);
      startSceneAutoplay();
    } else if (e.key === 'ArrowLeft') {
      goToScene(currentScene - 1);
      startSceneAutoplay();
    }
  });

  if (heroSlides.length > 1) {
    startSceneAutoplay();
  }

  if ('IntersectionObserver' in window && heroSection) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isHeroInViewport = entry.isIntersecting;
          if (entry.isIntersecting) {
            startSceneAutoplay();
          } else {
            stopSceneAutoplay();
            heroSection.classList.add('is-paused');
          }
        });
      },
      { threshold: 0.08 }
    );
    heroObserver.observe(heroSection);
  }

  // 3. Conmutador de vista de portada ("Ver Portada")
  const toggleCoverBtn = document.getElementById('toggleCoverView');
  const coverViewLabel = document.getElementById('coverViewLabel');
  let isCoverClean = false;

  if (toggleCoverBtn && heroSection) {
    toggleCoverBtn.addEventListener('click', () => {
      isCoverClean = !isCoverClean;
      heroSection.classList.toggle('is-cover-clean', isCoverClean);
      heroSection.classList.toggle('is-cover-only', isCoverClean);
      if (coverViewLabel) {
        coverViewLabel.textContent = isCoverClean ? 'Mostrar Textos' : 'Ver Portada';
      }
    });
  }

  // 3.B. Menú móvil / tablet desplegable
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');

  if (mobileMenuBtn && mobileMenuDrawer) {
    const closeMobileMenu = () => {
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileMenuDrawer.hidden = true;
    };

    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      mobileMenuDrawer.hidden = isOpen;
    });

    mobileMenuDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenuDrawer.hidden) {
        closeMobileMenu();
      }
    });
  }

  // 4. Filtros del Ecosistema de 9 Colecciones
  const ecoTabs = document.querySelectorAll('.eco-tab');
  const ecoCards = document.querySelectorAll('.eco-card');
  const ecosystemGrid = document.getElementById('ecosystemGrid');

  ecoTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');

      ecoTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      let visibleCount = 0;
      ecoCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('is-hidden');
          visibleCount++;
        } else {
          card.classList.add('is-hidden');
        }
      });

      if (ecosystemGrid) {
        ecosystemGrid.classList.toggle('is-filtered', filter !== 'all');
        ecosystemGrid.setAttribute('data-visible-count', String(visibleCount));
      }
    });
  });

  // 4.A. Preselección de espacio al hacer clic en enlaces con data-space
  document.querySelectorAll('[data-space]').forEach((link) => {
    link.addEventListener('click', () => {
      const spaceVal = link.getAttribute('data-space');
      if (!spaceVal) return;
      const checkbox = document.querySelector(`input[name="spaces"][value="${spaceVal}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  });

  // 4.B. Catálogo Oficial en Español de Mont Alpi Original Series (49 Modelos, Filtros y Vista Rápida)
  const MA_CDN_BASE = 'https://images.squarespace-cdn.com/content/v1/640ab010e2995c7bfe5187a2/';

  const MONT_ALPI_PRICES = {
    'MAi805-KEGXL': null, 'MAi805-KEGDR': null, 'MAi805-KEGBEVXL': null, 'MAi805-KEGBEVDR': null,
    'MAi805-90KEGXL': null, 'MAi805-90KEGDR': null, 'MAi805-90KEGBEVXL': null, 'MAi805-90KEGBEVDR': null,
    'MAi400-KEGXL': null, 'MAi400-KEGDR': null, 'MAi400-KEGBEVXL': null, 'MAi400-KEGBEVDR': null,
    'MAi400-90KEGXL': null, 'MAi400-90KEGDR': null, 'MAi400-90KEGBEVXL': null, 'MAi400-90KEGBEVDR': null,
    'MAi805-BEVXL': null, 'MAi400-BEVDR': null, 'MAi400-90BEVXL': null, 'MAi400-90BEVDR': null,
    'MAi400-90DR': null, 'MAi400-90XL': null, 'MAi400-XL': null, 'MAi400-BEVXL': null,
    'MAi400-DR': null, 'MAi805-XL': null, 'MAi805-DR': null, 'MAi805-BEVDR': null,
    'MAi805-90XL': null, 'MAi805-90DR': null, 'MAi805-90BEVXL': null, 'MAi805-90BEVDR': null,
    'MAi400': null, 'MAi400-90': null, 'MAi400-90BEV': null, 'MAi400-90KEG': null,
    'MAi400-90KEGBEV': null, 'MAi400-BEV': null, 'MAi400-KEGBEV': null, 'MAi400-KEG': null,
    'MAi805': null, 'MAi805-45': null, 'MAi805-90': null, 'MAi805-KEG': null,
    'MAi805-BEV': null, 'MAi805-KEGBEV': null, 'MAi805-90KEG': null, 'MAi805-90BEV': null,
    'MAi805-90KEGBEV': null
  };

  const MA_MODULE_LABELS = {
    LEFT_SIDE: 'Módulo lateral izquierdo con quemador infrarrojo — 25" × 23" × 35"',
    GRILL_6: 'Módulo central de asador de 6 quemadores — 43" × 23" × 46"',
    GRILL_4: 'Módulo central de asador de 4 quemadores — 32" × 23" × 46"',
    EXT_SS: 'MA-EXT-SS — Módulo Gabinete Extra de Almacenamiento XL — 25" × 23" × 35"',
    DRW_SS: 'MA-DRW-SS — Módulo Gabinete Extra de 3 Cajones XL — 25" × 23" × 35"',
    KEG: 'MA-KEG — Módulo Dispensador de Cerveza Kegerator — 48" × 23" × 35" (55" hasta el tope de los grifos)',
    MASF: 'MASF — Módulo Centro de Bebidas (Tarja y Refrigerador Exterior) — 38" × 23" × 35"',
    RIGHT_SIDE: 'Módulo gabinete lateral derecho — 25" × 23" × 35"',
    MA45C: '2× MA45C — Módulos Esquineros de 45° — 20" × 25" × 35" (c/u)',
    MA90C: 'MA90C — Módulo Esquinero de 90° — 25" × 25" × 35"'
  };

  const MONT_ALPI_ORIGINAL_CATALOG = [
    { sku: 'MAi805-KEGXL', cat: '6-burner-linear', tags: ['beer-dispenser', 'extra-cabinet'], dims: '167"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: 'de436121-a262-4e37-b84d-0e9ece27113b/760+-+MAi805-KEGXL+01+%402x-100+RGB.png', hover: '6bbc91e4-2334-45f6-be1d-bdd84fb1d961/760+-+MAi805-KEGXL+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'EXT_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-KEGDR', cat: '6-burner-linear', tags: ['beer-dispenser', 'extra-3-drawer-cabinet'], dims: '167"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: 'aa26805b-8565-4ffd-9864-8e19c6ccf2f1/750+-+MAi805-KEGDR+01%402x-100+RGB.png', hover: '41dad493-84bb-4334-bc48-5a6513a7bb72/750+-+MAi805-KEGDR+02%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'DRW_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-KEGBEVXL', cat: '6-burner-linear', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-cabinet'], dims: '205"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: 'aa501e02-66dd-42d6-b4d1-22445e3efd9f/770+-+MAi805-KEGBEVXL+01+%402x-100+RGB.png', hover: 'ba981903-a306-4655-9f3e-3f87362d7dac/770+-+MAi805-KEGBEVXL+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'EXT_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-KEGBEVDR', cat: '6-burner-linear', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-3-drawer-cabinet'], dims: '205"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: 'c8b027b7-ead9-4e26-af1b-ea0cf5860ab4/820+-+MAi805-KEGBEVDR+01+%402x-100+RGB.png', hover: '2642e752-9a24-46c8-87ac-a1074c412d88/820+-+MAi805-KEGBEVDR+02+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'DRW_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90KEGXL', cat: '6-burner-corner', tags: ['beer-dispenser', 'extra-cabinet'], dims: '94"x123"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: 'cbed8b08-1e8e-4daa-b73d-95c6d5eb20d5/960+-+MAi805-90KEGXL+01+%402x-100+RGB.png', hover: '945fc21d-a7d0-418d-9427-382f15a793c9/960+-+MAi805-90KEGXL+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'EXT_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90KEGDR', cat: '6-burner-corner', tags: ['beer-dispenser', 'extra-3-drawer-cabinet'], dims: '94"x123"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: 'b7ec0cc8-b5f0-4a51-9f49-6581d154ccc4/1001+-+MAi805-90KEGDR+01+%402x-100+RGB.png', hover: '29c8170a-5958-40aa-b857-fc52542214e3/1001+-+MAi805-90KEGDR+02+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'DRW_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90KEGBEVXL', cat: '6-burner-corner', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-cabinet'], dims: '94"x161"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: 'eed2eae2-6bb8-4517-afd2-bba9d4efb364/1005+-+MAi805-90KEGBEVXL+01+%402x-100+RGB.png', hover: 'ea1d1caf-cf34-40f6-b9dd-f66cf2efff72/1005+-+MAi805-90KEGBEVXL+02+dims+%402x+100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'EXT_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90KEGBEVDR', cat: '6-burner-corner', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-3-drawer-cabinet'], dims: '94"x161"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: '0497f81f-e454-4158-aa51-eb5a84cd027e/1002+-+MAi805-90KEGBEVDR+01+%402x-100+RGB.png', hover: '0a6d5d1f-d713-4ca7-8fb9-c4eeb8bd10dc/1002+-+MAi805-90KEGBEVDR+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'DRW_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-KEGXL', cat: '4-burner-linear', tags: ['beer-dispenser', 'extra-cabinet'], dims: '155"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: 'f2e8bed7-d979-4582-8207-23fa475e8fe7/1003+-+MAi400-KEGXL+01+%402x-100+RGB.png', hover: 'fcf1e214-37d0-49d3-bfa3-4517abfd264a/1003+-+MAi400-KEGXL+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'EXT_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-KEGDR', cat: '4-burner-linear', tags: ['beer-dispenser', 'extra-3-drawer-cabinet'], dims: '155"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: 'bf437ed9-a021-4ee1-b0fa-6eea32a474a8/1004+-+MAi400-KEGDR+01+%402x-100+RGB.png', hover: '4bc3585e-7c98-4057-b1d8-8696d20fcfdf/1004+-+MAi400-KEGDR+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'DRW_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-KEGBEVXL', cat: '4-burner-linear', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-cabinet'], dims: '193"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: '2be0926d-a0d6-44d4-aafc-3bccd348fd05/1010+-+MAi400-KEGBEVXL+01+%402x-100+RGB.png', hover: '4a16c6d9-97ad-4007-a25b-a65d4d28e789/1010+-+MAi400-KEGBEVXL+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'EXT_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-KEGBEVDR', cat: '4-burner-linear', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-3-drawer-cabinet'], dims: '193"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: 'e7c3a907-2b06-4157-b738-3bd125fff345/1008+-+MAi400-KEGBEVDR+01+%402x-100+RGB.png', hover: '6366c8f5-541c-4ae5-809f-27a457837fb6/1008+-+MAi400-KEGBEVDR+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'DRW_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90KEGXL', cat: '4-burner-corner', tags: ['beer-dispenser', 'extra-cabinet'], dims: '82"x123"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 4 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: '6739999b-e02d-4874-8240-e34e8f0d7a04/1020+-+MAi400-90KEGXL+01+%402x-100+RGB.png', hover: 'ef248723-d65f-4994-860d-a5213d626436/1020+-+MAi400-90KEGXL+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'EXT_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90KEGDR', cat: '4-burner-corner', tags: ['beer-dispenser', 'extra-3-drawer-cabinet'], dims: '82"x123"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 4 Quemadores con Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: '550b88a7-a2b0-4002-b5f0-81b0912ac705/1019+-+MAi400-90KEGDR+01+%402x-100+RGB.png', hover: 'f17e4ffe-b887-4201-9917-5e9def3257a0/1019+-+MAi400-90KEGDR+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'DRW_SS', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90KEGBEVXL', cat: '4-burner-corner', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-cabinet'], dims: '82"x161"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 4 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra XL', cover: 'b986b26c-5df9-49b4-b4b6-9873c53e6af3/1021+-+MAi400-90KEGBEVXL+01+%402x-100+RGB.png', hover: '24206915-b063-4524-803a-d67850f19d97/1021+-+MAi400-90KEGBEVXL+02+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'EXT_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90KEGBEVDR', cat: '4-burner-corner', tags: ['sink-and-fridge-combo', 'beer-dispenser', 'extra-3-drawer-cabinet'], dims: '82"x161"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 4 Quemadores con Centro de Bebidas, Dispensador de Cerveza (Kegerator) y Gabinete Extra de 3 Cajones', cover: '8fbe3d5d-1644-4a1f-a821-63738fe66522/1022+-+MAi400-90KEGBEVDR+01+%402x-100+RGB.png', hover: '2c9eb768-17ac-47e9-9898-f8f969f706e3/1022+-+MAi400-90KEGBEVDR+02+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'DRW_SS', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-BEVXL', cat: '6-burner-linear', tags: ['sink-and-fridge-combo', 'extra-cabinet'], dims: '157"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas y Gabinete Extra XL', cover: '159ca7bf-1979-4c6e-bebb-977d370e04c9/690+-+MAi805-BEVXL+17+%402x-100+RGB.png', hover: '2da885d3-1e69-4da3-af5e-f0f0c9d4fe29/690+-+MAi805-BEVXL+18+dims+%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'EXT_SS', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi400-BEVDR', cat: '4-burner-linear', tags: ['sink-and-fridge-combo', 'extra-3-drawer-cabinet'], dims: '145"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Centro de Bebidas y Gabinete Extra de 3 Cajones', cover: '15b01799-7b9e-40ad-8604-d7ddd291b36b/540+-+MAi400-BEVDR+07%402x-100+RGB.png', hover: '4de57193-432e-4752-97d2-7361c02c8037/540+-+MAi400-BEVDR+08+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'DRW_SS', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90BEVXL', cat: '4-burner-corner', tags: ['sink-and-fridge-combo', 'extra-cabinet'], dims: '82"x113"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi de 4 Quemadores con Centro de Bebidas a 90° y Gabinete Extra XL', cover: 'd2435207-2ee4-4117-a642-715f5b0a0f7c/530+-+MAi400-90BEVXL+15%402x-100+RGB.png', hover: '01a80b60-1485-4498-af0a-0d201d69c362/530+-+MAi400-90BEVXL+16+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'EXT_SS', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90BEVDR', cat: '4-burner-corner', tags: ['sink-and-fridge-combo', 'extra-3-drawer-cabinet'], dims: '82"x113"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi de 4 Quemadores con Centro de Bebidas a 90° y Gabinete Extra de 3 Cajones', cover: '4dc674a3-47a9-4389-93c2-0e5d34fea1c8/520+-+MAi400-90BEVDR+13%402x-100+RGB.png', hover: 'ecfd4ccf-c05c-4107-b0a3-d63951ea73d6/520+-+MAi400-90BEVDR+14+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'DRW_SS', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90DR', cat: '4-burner-corner', tags: ['extra-3-drawer-cabinet'], dims: '82"x75"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi de 4 Quemadores con Esquina de 90° y Gabinete Extra de 3 Cajones', cover: 'd039e0dd-0108-433a-8fb5-fbacbd96d093/510+-+MAi400-90DR+11%402x-100+RGB.png', hover: 'd7d4e8cd-86e6-4c41-845c-c303d04da999/510+-+MAi400-90DR+12+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'DRW_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90XL', cat: '4-burner-corner', tags: ['extra-cabinet'], dims: '82"x75"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi de 4 Quemadores con Esquina de 90° y Gabinete Extra XL', cover: '5e242f9e-77ae-4cef-8e7d-71323067b3d5/500+-+MAi400-90XL+09%402x-100+RGB.png', hover: 'e33705a7-7b98-4e3e-8c7b-cf295defe16e/500+-+MAi400-90XL+10+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'EXT_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi400-XL', cat: '4-burner-linear', tags: ['extra-cabinet'], dims: '107"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Gabinete Extra de Almacenamiento XL', cover: '329f00e4-0ff2-4d47-b700-7c825eed43ec/490+-+MAi400-XL+03%402x-100+RGB.png', hover: '5e5825f3-3c08-4ffb-8f4d-a44c6cd2011a/490+-+MAi400-XL+04+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'EXT_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi400-BEVXL', cat: '4-burner-linear', tags: ['sink-and-fridge-combo', 'extra-cabinet'], dims: '145"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Centro de Bebidas y Gabinete Extra XL', cover: '1bd5956f-422a-4e7f-add7-f30424cb288b/480+-+MAi400-BEVXL+05%402x-100+RGB.png', hover: '9494d30f-36db-43d7-b5fc-ecae75b58932/480+-+MAi400-BEVXL+06+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'EXT_SS', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi400-DR', cat: '4-burner-linear', tags: ['extra-3-drawer-cabinet'], dims: '107"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 4 Quemadores con Gabinete Extra de 3 Cajones', cover: '8bf6423b-612f-4c07-871b-4f695e231d38/470+-+MAi400-DR+01%402x-100+RGB.png', hover: 'a151ef07-0b3c-41fc-981f-d6a7be819ae8/470+-+MAi400-DR+02+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_4', 'DRW_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi805-XL', cat: '6-burner-linear', tags: ['extra-cabinet'], dims: '119"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Gabinete Extra de Almacenamiento XL', cover: 'f77740a4-0ebc-4177-b563-abcd4da78766/450+-+MAi805-XL+49%402x-100+RGB.png', hover: 'e36fcd37-c0e1-4f14-971e-f20d830aa62c/450+-+MAi805-XL+dims+50%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'EXT_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi805-DR', cat: '6-burner-linear', tags: ['extra-3-drawer-cabinet'], dims: '119"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Gabinete Extra de 3 Cajones', cover: '8b3b2e2c-d0fb-415a-80f1-25f05149a5ea/430+-+MAi805-DR+45%402x-100+RGB.png', hover: '959cbd9f-9ada-4ede-a4ff-52115d1e9bf6/430+-+MAi805-DR+46+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'DRW_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi805-BEVDR', cat: '6-burner-linear', tags: ['sink-and-fridge-combo', 'extra-3-drawer-cabinet'], dims: '157"x23"x35"', title: 'Isla de Cocina Exterior Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas y Gabinete Extra de 3 Cajones', cover: '54516fd0-bf87-4034-aa19-cc56a7715bac/360+-+MAi805-BEVDR+31%402x-100+RGB.png', hover: '92251081-7463-4b36-8162-01435b165891/360+-+MAi805-BEVDR+32+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MASF', 'DRW_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90XL', cat: '6-burner-corner', tags: ['extra-cabinet'], dims: '94"x75"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Gabinete Extra de Almacenamiento XL', cover: '7704028c-4cc5-4de2-b9a1-ac86645ffb0f/350+-+MAi805-90XL+29%402x-100+RGB.png', hover: '9b241693-bea0-4763-b5a0-2dab4c546ed3/350+-+MAi805-90XL+30+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'EXT_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90DR', cat: '6-burner-corner', tags: ['extra-3-drawer-cabinet'], dims: '94"x75"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Gabinete Extra de 3 Cajones', cover: 'a4ad2985-4036-43a5-92bb-521ca44698b5/340+-+MAi805-90DR+27%402x-100+RGB.png', hover: '8765a6eb-c1e6-4a32-8b5d-d08d4b426fe7/340+-+MAi805-90DR+28+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'DRW_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90BEVXL', cat: '6-burner-corner', tags: ['sink-and-fridge-combo', 'extra-cabinet'], dims: '94"x113"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas y Gabinete Extra XL', cover: '40cd5e6f-c641-4111-89ac-9aa9e65e8199/380+-+MAi805-D90BEVXL+35%402x-100+RGB.png', hover: '978de977-6061-4d49-8d40-b31f0444f79d/380+-+MAi805-D90BEVXL+36+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MASF', 'MA90C', 'EXT_SS', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90BEVDR', cat: '6-burner-corner', tags: ['sink-and-fridge-combo', 'extra-3-drawer-cabinet'], dims: '94"x113"x35"', title: 'Isla de Cocina Exterior en «L» (90°) Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas y Gabinete Extra de 3 Cajones', cover: '37dec36e-554e-4348-910a-db58b352a9bd/320+-+MAi805-90BEVDR+23%402x-100+RGB.png', hover: '1449e80b-34fc-4bbd-9410-3fc062c49beb/320+-+MAi805-90BEVDR+24+dims%402x-100+RGB.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MASF', 'MA90C', 'RIGHT_SIDE'] },
    { sku: 'MAi400', cat: '4-burner-linear', tags: ['base-model'], dims: '82"x23"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores', cover: '7a35fa1d-0bfa-47c9-8db8-578dd70903e8/120+-+MAI400%402x.png', hover: 'e6d79378-b340-484f-9408-9967dd09dd58/121+-+MAI400+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90', cat: '4-burner-corner', tags: ['base-model'], dims: '82"x50"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores con Módulo Esquinero de 90°', cover: 'f4231607-6e57-4f6a-b30e-43e969b22ac0/140+-+MAi400-90%402x.png', hover: '5f199c1c-1b88-4332-88a8-1eb7a2f94232/141+-+MAi400-90+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90BEV', cat: '4-burner-corner', tags: ['sink-and-fridge-combo'], dims: '82"x88"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores con Esquina de 90° y Centro de Bebidas', cover: 'eda59d90-9c93-4351-aa5a-c896cdc583d1/130+-+MAi400-90BEV%402x.png', hover: '679f8e0c-495d-40ad-acfe-069789428446/131+-+MAi400-90BEV+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90KEG', cat: '4-burner-corner', tags: ['beer-dispenser'], dims: '82"x98"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores con Esquina de 90° y Dispensador Kegerator', cover: '8a9e5b7b-11ef-4809-ae89-7b81af272019/100+-+MAI400-90KEG+%402x.png', hover: '9e1387ff-bcb0-4074-b503-2fbf7cba86ca/101+-+MAI400-90KEG+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MA90C', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-90KEGBEV', cat: '4-burner-corner', tags: ['sink-and-fridge-combo', 'beer-dispenser'], dims: '120"x98"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores con Esquina de 90°, Kegerator y Centro de Bebidas', cover: '06046f42-eea3-46f2-ad55-3e0cb61c030e/150+-+MAI400-90KEGBEV%402x.png', hover: '798cd4d2-e8ab-4d30-9ba2-9dfd1ffa2b7b/151+-+MAI400-90KEGBEV+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MASF', 'MA90C', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-BEV', cat: '4-burner-linear', tags: ['sink-and-fridge-combo'], dims: '120"x23"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores con Centro de Bebidas (Tarja y Refrigerador)', cover: '18c5dd95-68b3-4c73-a5cf-e942d7833aa2/160+-+MAi400-BEV%402x.png', hover: 'c62143aa-87ba-4339-9e2e-bfca47ff1479/161+-+MAi400-BEV+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi400-KEGBEV', cat: '4-burner-linear', tags: ['sink-and-fridge-combo', 'beer-dispenser'], dims: '168"x23"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores con Dispensador Kegerator y Centro de Bebidas', cover: 'd4a7a9ce-1b08-472f-8dbd-c1560be91efd/180+-+MAI400-KEGBEV%402x.png', hover: 'c5c08c38-8bc2-4da6-9e87-51ed1950e638/181+-+MAI400-KEGBEV+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi400-KEG', cat: '4-burner-linear', tags: ['beer-dispenser'], dims: '130"x23"x35"', title: 'Isla Mont Alpi Serie Original de 4 Quemadores con Dispensador de Cerveza Kegerator', cover: '32557a7f-a1f4-4652-afd1-37d060c86e33/170+-+MAI400-KEG%402x.png', hover: '154e8ebb-63c2-4e14-b0d4-82b5947422f3/171+-+MAI400-KEG+img%2Bdims%402x.png', mods: ['LEFT_SIDE', 'GRILL_4', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805', cat: '6-burner-linear', tags: ['base-model'], dims: '94"x23"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores', cover: '14c490c9-8ffb-4d36-837c-bacbc9944c22/MAi805-+01+%402x.png', hover: 'e29980e7-19bd-4018-ad92-72e02a5f809a/MAi805-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'RIGHT_SIDE'] },
    { sku: 'MAi805-45', cat: '6-burner-corner', tags: ['base-model'], dims: '110"x23"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Módulos Esquineros de 45°', cover: '13974495-49d1-423d-80c2-197f705069ce/MAI805-45C-+01+%402x.png', hover: '74dc95ad-d549-4cb9-bc77-e58b7f2f2c9c/MAI805-45C-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA45C', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90', cat: '6-burner-corner', tags: ['base-model'], dims: '94"x50"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Módulo Esquinero de 90°', cover: '70888ee2-0228-4200-bde8-fb2bce67bdb9/MAI805-90C-+01+%402x.png', hover: 'aed8e326-914b-4b2a-84a6-a1184575c5a0/MAI805-90C-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'RIGHT_SIDE'] },
    { sku: 'MAi805-KEG', cat: '6-burner-linear', tags: ['beer-dispenser'], dims: '142"x23"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Dispensador de Cerveza Kegerator', cover: 'ac3b2f46-26cb-443e-950c-9457f3c90b0f/MAI805-KEG-+01+%402x.png', hover: 'a20e24e8-1eb5-4fe9-ac40-ef397f22468b/MAI805-KEG-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-BEV', cat: '6-burner-linear', tags: ['sink-and-fridge-combo'], dims: '132"x23"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Centro de Bebidas (Tarja y Refrigerador)', cover: '3e5e8714-623a-4da0-b0f1-6e05eb5aba22/MAi805-BEV-+01+%402x.png', hover: '50e877e3-c0f1-47e5-8b16-6d49b723c7c0/MAi805-BEV-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi805-KEGBEV', cat: '6-burner-linear', tags: ['sink-and-fridge-combo', 'beer-dispenser'], dims: '180"x23"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Dispensador Kegerator y Centro de Bebidas', cover: '8adb5afe-578c-4137-b554-1b00f7cdeeb3/MAI805-KEGBEV-+01+%402x.png', hover: 'ca8c51e2-7da4-4a23-bf10-9714cb0208f4/MAI805-KEGBEV-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MASF', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90KEG', cat: '6-burner-corner', tags: ['beer-dispenser'], dims: '94"x98"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Esquina de 90° y Dispensador Kegerator', cover: 'e7e4a408-3844-4634-9b60-c32c76c1f9a0/MAi805-90KEG-+01+%402x.png', hover: '1ba34afd-622e-45f9-8408-74bb2920881c/MAi805-90KEG-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'KEG', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90BEV', cat: '6-burner-corner', tags: ['sink-and-fridge-combo'], dims: '94"x88"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Esquina de 90° y Centro de Bebidas', cover: '6bfa859a-b8b6-4f1e-bd15-6a3313831453/MAI805-90BEV-+01+%402x.png', hover: 'b81171d6-93b1-4c03-9683-3f897cf231e6/MAI805-90BEV-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'MASF', 'RIGHT_SIDE'] },
    { sku: 'MAi805-90KEGBEV', cat: '6-burner-corner', tags: ['sink-and-fridge-combo', 'beer-dispenser'], dims: '94"x136"x35"', title: 'Isla Mont Alpi Serie Original de 6 Quemadores con Esquina de 90°, Kegerator y Centro de Bebidas', cover: '96502cb8-f3f0-4bbd-a091-6fb5e5b52d59/MAI805-90KEGBEV-+01+%402x.png', hover: 'a2493605-c7b6-4d2c-bedc-ec3821ed8071/MAI805-90KEGBEV-+01+dims%402x.png', mods: ['LEFT_SIDE', 'GRILL_6', 'MA90C', 'MASF', 'KEG', 'RIGHT_SIDE'] }
  ];

  const montAlpiGrid = document.getElementById('montAlpiGrid');
  const outdoorModelSelect = document.getElementById('outdoorModelSelect');
  const maResultCount = document.getElementById('maResultCount');
  const maClearFiltersBtn = document.getElementById('maClearFiltersBtn');
  const maCatLinks = document.querySelectorAll('.ma-cat-link');
  const maTagCheckboxes = document.querySelectorAll('.ma-tag-checkbox');

  function formatMaPrice(sku) {
    const p = MONT_ALPI_PRICES[sku];
    if (p) {
      return typeof p === 'number' ? `$${p.toLocaleString('es-MX')} MXN` : p;
    }
    return 'Cotización directa';
  }

  function selectOutdoorModelInForm(sku, title) {
    if (outdoorModelSelect) {
      const val = `Mont Alpi ${sku} — ${title}`;
      let opt = Array.from(outdoorModelSelect.options).find((o) => o.value === val || o.value.includes(sku));
      if (!opt) {
        opt = document.createElement('option');
        opt.value = val;
        opt.textContent = `${sku} — ${title}`;
        outdoorModelSelect.appendChild(opt);
      }
      outdoorModelSelect.value = opt.value;
    }
    const outdoorCheckbox = document.querySelector('input[name="spaces"][value="Outdoor / Asador en Terraza"]');
    if (outdoorCheckbox) {
      outdoorCheckbox.checked = true;
    }
  }

  if (outdoorModelSelect) {
    outdoorModelSelect.innerHTML = '<option value="">— Sin selección específica / Proyecto general —</option>';
    const group6 = document.createElement('optgroup');
    group6.label = 'Mont Alpi Serie Original — 6 Quemadores (115,000 BTU)';
    const group4 = document.createElement('optgroup');
    group4.label = 'Mont Alpi Serie Original — 4 Quemadores (78,000 BTU)';

    MONT_ALPI_ORIGINAL_CATALOG.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = `Mont Alpi ${item.sku} (${item.dims.replace(/x/g, '×')})`;
      opt.textContent = `${item.sku} — ${item.title} (${item.dims.replace(/x/g, '×')})`;
      if (item.sku.startsWith('MAi805')) {
        group6.appendChild(opt);
      } else {
        group4.appendChild(opt);
      }
    });

    const groupExtra = document.createElement('optgroup');
    groupExtra.label = 'Thor Appliances & Accesorios';
    groupExtra.innerHTML = `
      <option value="Equipos Thor Appliances Outdoor">Equipos Thor Appliances® (Asesoría de catálogo)</option>
      <option value="Accesorios o Módulos Individuales Mont Alpi">Accesorios / Módulos Individuales Mont Alpi®</option>
    `;

    outdoorModelSelect.appendChild(group6);
    outdoorModelSelect.appendChild(group4);
    outdoorModelSelect.appendChild(groupExtra);
  }

  if (montAlpiGrid) {
    montAlpiGrid.innerHTML = MONT_ALPI_ORIGINAL_CATALOG.map((item) => {
      const coverUrl = `${MA_CDN_BASE}${item.cover}?format=750w`;
      const hoverUrl = `${MA_CDN_BASE}${item.hover}?format=750w`;
      const cleanDims = item.dims.replace(/x/g, ' × ');
      const priceText = formatMaPrice(item.sku);
      return `
        <article class="ma-plp-card" data-sku="${item.sku}" data-cat="${item.cat}" data-tags="${item.tags.join(',')}">
          <div class="ma-plp-image-wrap" data-qv-sku="${item.sku}" role="button" tabindex="0" aria-label="Vista Rápida de ${item.sku}">
            <img class="ma-plp-img ma-plp-img-cover" src="${coverUrl}" alt="${item.sku} - ${item.title}" loading="lazy">
            <img class="ma-plp-img ma-plp-img-hover" src="${hoverUrl}" alt="Plano de dimensiones de ${item.sku}" loading="lazy">
            <button type="button" class="ma-quick-view-pill" data-qv-sku="${item.sku}">Vista Rápida</button>
          </div>
          <div class="ma-plp-meta">
            <div class="ma-plp-sku-row">
              <span class="ma-plp-sku">${item.sku}</span>
              <span class="ma-plp-dims-badge">${cleanDims}</span>
            </div>
            <p class="ma-plp-title-es">${item.title}</p>
            <div class="ma-plp-footer">
              <span class="ma-plp-price" data-price-sku="${item.sku}">${priceText}</span>
              <div class="ma-plp-actions">
                <button type="button" class="ma-plp-btn-spec" data-qv-sku="${item.sku}">Ficha y Medidas</button>
                <a href="index.html#cotizar" class="ma-plp-btn-quote" data-quote-sku="${item.sku}">Agendar Cita</a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  let activeMaCategory = 'all';

  function applyMontAlpiFilters() {
    const checkedTags = Array.from(maTagCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    const cards = montAlpiGrid ? montAlpiGrid.querySelectorAll('.ma-plp-card') : [];
    let visibleCount = 0;

    cards.forEach((card) => {
      const cat = card.getAttribute('data-cat');
      const cardTags = (card.getAttribute('data-tags') || '').split(',').filter(Boolean);

      const matchesCat = activeMaCategory === 'all' || cat === activeMaCategory;
      const matchesTags = checkedTags.length === 0 || checkedTags.every((t) => cardTags.includes(t));

      if (matchesCat && matchesTags) {
        card.classList.remove('is-hidden');
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    if (maResultCount) {
      maResultCount.textContent = `Mostrando ${visibleCount} de ${MONT_ALPI_ORIGINAL_CATALOG.length} modelos`;
    }

    if (maClearFiltersBtn) {
      maClearFiltersBtn.hidden = activeMaCategory === 'all' && checkedTags.length === 0;
    }
  }

  maCatLinks.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeMaCategory = btn.getAttribute('data-ma-cat') || 'all';
      maCatLinks.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      applyMontAlpiFilters();
    });
  });

  maTagCheckboxes.forEach((cb) => {
    cb.addEventListener('change', applyMontAlpiFilters);
  });

  if (maClearFiltersBtn) {
    maClearFiltersBtn.addEventListener('click', () => {
      activeMaCategory = 'all';
      maCatLinks.forEach((b) => {
        const isAll = b.getAttribute('data-ma-cat') === 'all';
        b.classList.toggle('active', isAll);
        b.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      maTagCheckboxes.forEach((cb) => {
        cb.checked = false;
      });
      applyMontAlpiFilters();
    });
  }
// 4.C. Catálogo Oficial en Español de THOR Kitchen® Outdoor Kitchen Suite (Páginas 32-35 PDF)
  const THOR_OUTDOOR_CATALOG = [
    {
      sku: 'MK04SS304',
      cat: 'asadores',
      tags: ['acero-304', 'ruedas-3', 'gas'],
      dims: '32 1/16" × 10.5" × 26"',
      price: '$2,197 USD',
      title: 'Asador de Gas Exterior de 32" con 4 Quemadores y Rosticero Infrarrojo',
      img: 'assets/thor/MK04SS304.webp',
      fallbackImg: 'assets/portada-outdoor-finezza.jpg',
      summary: 'Potente asador exterior en acero inoxidable 304 con un quemador infrarrojo de 13,000 BTU, tres quemadores tubulares de 12,000 BTU y un quemador trasero infrarrojo de 10,000 BTU para rosticero.',
      specs: [
        'Precio de Lista: $2,197 USD (Precios expresados en USD, no incluyen IVA)',
        'Dimensiones: 32 1/16" Ancho × 10.5" Alto (cubierta) × 26" Profundidad',
        '4 Quemadores principales: 1 × 13,000 BTU (infrarrojo) + 3 × 12,000 BTU (tubulares)',
        'Quemador trasero infrarrojo de 10,000 BTU especial para rosticero',
        'Fabricación en Acero Inoxidable 304 con luces LED en perillas y ruedas fijas de 3"',
        'Diseñado para tanque de Gas LP (convertible a Gas Natural con kit 21.02.000025-000-A0)'
      ]
    },
    {
      sku: 'MK03SS304',
      cat: 'gabinetes',
      tags: ['acero-304', 'ruedas-3'],
      dims: '32 1/16" × 38" × 25"',
      price: '$1,012 USD',
      title: 'Gabinete Base Modular para Asador de 32" con Cajones de Almacenamiento',
      img: 'assets/thor/MK03SS304.webp',
      fallbackImg: 'assets/portada-outdoor-finezza.jpg',
      summary: 'Gabinete base de 32 pulgadas diseñado para alojar el asador empotrable de 4 quemadores MK04SS304 (no incluido), con dos cajones superiores y gabinete inferior.',
      specs: [
        'Precio de Lista: $1,012 USD (Precios expresados en USD, no incluyen IVA)',
        'Dimensiones: 32 1/16" Ancho × 38" Alto × 25" Profundidad',
        'Construcción íntegra en Acero Inoxidable 304 de alta resistencia',
        'Dos cajones de almacenamiento para utensilios y amplio gabinete inferior',
        'Manijas empotradas al ras y ruedas fijas de 3 pulgadas'
      ]
    },
    {
      sku: 'MK01SS304',
      cat: 'gabinetes',
      tags: ['acero-304', 'ruedas-3'],
      dims: '32" × 38" × 25"',
      price: '$1,498 USD',
      title: 'Gabinete Exterior con Tarja en Acero Inoxidable, Especiero y Destapador',
      img: 'assets/thor/MK01SS304.webp',
      fallbackImg: 'assets/portada-outdoor-finezza.jpg',
      summary: 'Estación de lavado exterior en acero inoxidable 304 para enjuagar ingredientes frescos y lavar utensilios sin entrar a casa, con gabinete inferior, especiero y destapador.',
      specs: [
        'Precio de Lista: $1,498 USD (Precios expresados en USD, no incluyen IVA)',
        'Dimensiones: 32" Ancho × 38" Alto × 25" Profundidad',
        'Tarja integrada en Acero Inoxidable 304 con espacio extra de almacenamiento inferior',
        'Bandeja especiera integrada y práctico destapador de botellas fijo',
        'Equipado con ruedas fijas de 3 pulgadas para fácil integración modular'
      ]
    },
    {
      sku: 'TRF24U',
      cat: 'refrigeracion',
      tags: ['acero-304'],
      dims: '24" Bajo Cubierta • 5.4 cu. ft.',
      price: '$2,699 USD',
      title: 'Cajones Refrigeradores Bajo Cubierta de 24" para Interior / Exterior',
      img: 'assets/thor/TRF24U.webp',
      fallbackImg: 'assets/thor/TRF24U.jpg',
      summary: 'Módulo refrigerador de doble cajón bajo cubierta de 24 pulgadas certificado para uso en exteriores e interiores (Indoor/Outdoor Rated), diseñado para empotrarse directamente en el gabinete MK02SS304 o en islas a medida.',
      specs: [
        'Precio de Lista: $2,699 USD (Precios expresados en USD, no incluyen IVA)',
        'Certificación Indoor & Outdoor Rated (apto para terrazas e intemperie)',
        'Amplia capacidad interior de 5.4 pies cúbicos con dos cajones de cierre suave (Soft-Close)',
        'Sistema de enfriamiento por convección y operación silenciosa de 44 dBA',
        'Control táctil digital con pantalla LED azul y acabado en acero inoxidable resistente a huellas',
        'Fácil instalación bajo cubierta (compatible con el gabinete THOR MK02SS304) con patas niveladoras ajustables'
      ]
    },
    {
      sku: 'MK02SS304',
      cat: 'gabinetes',
      tags: ['acero-304', 'ruedas-3'],
      dims: '35 3/16" × 38" × 26"',
      price: '$974 USD',
      title: 'Gabinete Modular de 35" para Refrigerador o Congelador Bajo Cubierta',
      img: 'assets/thor/MK02SS304.webp',
      fallbackImg: 'assets/portada-outdoor-finezza.jpg',
      summary: 'Módulo gabinete de 35 pulgadas diseñado para alojar un cajón refrigerador o congelador THOR de 24" (equipos no incluidos) y brindar cubierta adicional de preparación.',
      specs: [
        'Precio de Lista: $974 USD (Precios expresados en USD, no incluyen IVA)',
        'Dimensiones: 35 3/16" Ancho × 38" Alto × 26" Profundidad',
        'Compatible con cajones refrigeradores o congeladores bajo cubierta de 24"',
        'Amplia cubierta superior en Acero Inoxidable 304 para sazonar y reposar cortes',
        'Equipado con ruedas fijas de 3 pulgadas'
      ]
    },
    {
      sku: 'MK06SS304',
      cat: 'gabinetes',
      tags: ['acero-304', 'ruedas-3'],
      dims: '43" × 24" × 38"',
      price: '$1,053 USD',
      title: 'Gabinete Esquinero Modular en «L» con Almacenamiento Extra Grande',
      img: 'assets/thor/MK06SS304.webp',
      fallbackImg: 'assets/portada-outdoor-finezza.jpg',
      summary: 'Módulo esquinero en acero inoxidable 304 para configurar cocinas exteriores en escuadra («L»), aportando superficie de trabajo y gabinete de gran capacidad.',
      specs: [
        'Precio de Lista: $1,053 USD (Precios expresados en USD, no incluyen IVA)',
        'Dimensiones: 43" Ancho × 24" Profundidad × 38" Alto',
        'Permite configurar la suite modular THOR en forma de «L» adaptándose a tu terraza',
        'Gabinete de almacenamiento extra grande en Acero Inoxidable 304',
        'Cubierta superior de trabajo y ruedas fijas de 3 pulgadas'
      ]
    },
    {
      sku: 'MK07SS304',
      cat: 'hornos-pizza',
      tags: ['acero-304', 'ruedas-3', 'lena'],
      dims: '27 7/8" × 56 1/2" × 25"',
      price: '$2,164 USD',
      title: 'Horno de Leña para Pizza con Gabinete y Accesorios en Acero Inoxidable 304',
      img: 'assets/thor/MK07SS304.webp',
      fallbackImg: 'assets/portada-outdoor-finezza.jpg',
      summary: 'Horno de leña exterior en acero inoxidable 304 con piedra cerámica clásica, chimenea con regulador de tiro, gabinete extra grande y set completo de herramientas.',
      specs: [
        'Precio de Lista: $2,164 USD (Precios expresados en USD, no incluyen IVA)',
        'Dimensiones: 27 7/8" Ancho × 56 1/2" Alto × 25" Profundidad',
        'Piedra cerámica refractaria para pizza y chimenea con regulador de flujo de calor',
        'Incluye cortador de pizza, pala (pizza peel), servidor y cepillo con rack organizador',
        'Gabinete inferior de almacenamiento extra grande en Acero Inoxidable 304 y ruedas de 3"'
      ]
    },
    {
      sku: 'HP001S',
      cat: 'hornos-pizza',
      tags: ['acero-430', 'ruedas-3', 'lena'],
      dims: '78 × 77.2 × 200.2 cm',
      price: '$1,572 USD',
      title: 'Horno de Leña para Pizza en Acero Inoxidable 430 con Ladrillos Refractarios',
      img: 'assets/thor/HP001S.webp',
      fallbackImg: 'assets/thor/HP001S.jpg',
      summary: 'Horno de leña en acero inoxidable 430 con ladrillos refractarios de 1.5 cm, calentamiento rápido en 5 minutos, termómetro integrado y cajón recolector de cenizas.',
      specs: [
        'Precio de Lista: $1,572 USD (Precios expresados en USD, no incluyen IVA)',
        'Dimensiones del producto: 78 cm Ancho × 77.2 cm Profundidad × 200.2 cm Alto (Peso neto: 62 kg)',
        'Interior revestido con ladrillos refractarios de 1.5 cm de espesor y piedra cerámica',
        'Área de cocción de 0.48 m² (64 cm × 75 cm) con tiempo de calentamiento de 5 minutos',
        'Termómetro integrado (37.78 °C a 371.11 °C) y chimenea con regulador de calor',
        'Cajón inferior recolector de cenizas, 4 ruedas de 3" (2 con freno) y 2 niveladores',
        'Incluye cortador de pizza, servidor, pala de acero y cepillo de limpieza'
      ]
    },
    {
      sku: '21.02.000025-000-A0',
      cat: 'accesorios',
      tags: ['gas'],
      dims: 'Manguera 10 pies',
      price: '$333 USD',
      title: 'Kit de Conversión a Gas Natural (MK04NG) para Asador Exterior MK04SS304',
      img: 'assets/thor/21.02.000025-000-A0.webp',
      fallbackImg: 'assets/thor/21.02.000025-000-A0.jpg',
      summary: 'Kit oficial de conversión para adaptar el asador exterior THOR MK04SS304 de Gas LP a Gas Natural, con manguera de 10 pies y conector rápido de latón.',
      specs: [
        'Precio de Lista: $333 USD (Precios expresados en USD, no incluyen IVA)',
        'Clave oficial: 21.02.000025-000-A0 (Modelo MK04NG)',
        'Diseñado específicamente para el asador exterior THOR MK04SS304',
        'Incluye manguera de gas de 10 pies (3 metros) con acople rápido de latón',
        'Incluye regulador, espreas/orificios de quemador y herrajes completos de instalación'
      ]
    }
  ];

  const thorKitchenGrid = document.getElementById('thorKitchenGrid');
  const thorResultCount = document.getElementById('thorResultCount');
  const thorClearFiltersBtn = document.getElementById('thorClearFiltersBtn');
  const thorCatLinks = document.querySelectorAll('.thor-cat-link');
  const thorTagCheckboxes = document.querySelectorAll('.thor-tag-checkbox');

  if (thorKitchenGrid) {
    thorKitchenGrid.innerHTML = THOR_OUTDOOR_CATALOG.map((item) => `
      <article class="ma-plp-card" data-thor-sku="${item.sku}" data-thor-cat="${item.cat}" data-thor-tags="${item.tags.join(',')}">
        <div class="ma-plp-image-wrap" data-thor-qv="${item.sku}" role="button" tabindex="0" aria-label="Ficha y Medidas de ${item.sku}">
          <img class="ma-plp-img ma-plp-img-cover" src="${item.img}" onerror="if(this.src.endsWith('.webp')){this.src='assets/thor/${item.sku}.jpg';}else if(this.src.endsWith('.jpg')){this.src='assets/thor/${item.sku}.png';}else{this.onerror=null;this.src='assets/portada-outdoor-finezza.jpg';}" alt="THOR Kitchen ${item.sku} - ${item.title}" loading="lazy">
          <button type="button" class="ma-quick-view-pill" data-thor-qv="${item.sku}">Vista R&aacute;pida</button>
        </div>
        <div class="ma-plp-meta">
          <div class="ma-plp-sku-row">
            <span class="ma-plp-sku">THOR &bull; ${item.sku}</span>
            <span class="ma-plp-dims-badge">${item.dims}</span>
          </div>
          <p class="ma-plp-title-es">${item.title}</p>
          <div class="ma-plp-footer">
            <span class="ma-plp-price"><strong>${item.price}</strong> <small style="font-weight:400;opacity:0.75;">+ IVA</small></span>
            <div class="ma-plp-actions">
              <button type="button" class="ma-plp-btn-spec" data-thor-qv="${item.sku}">Ficha y Medidas</button>
              <a href="index.html#cotizar" class="ma-plp-btn-quote">Agendar Cita</a>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  let activeThorCategory = 'all';

  function applyThorFilters() {
    const checkedTags = Array.from(thorTagCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    const cards = thorKitchenGrid ? thorKitchenGrid.querySelectorAll('.ma-plp-card') : [];
    let visibleCount = 0;

    cards.forEach((card) => {
      const cat = card.getAttribute('data-thor-cat');
      const cardTags = (card.getAttribute('data-thor-tags') || '').split(',').filter(Boolean);
      const matchesCat = activeThorCategory === 'all' || cat === activeThorCategory;
      const matchesTags = checkedTags.length === 0 || checkedTags.every((t) => cardTags.includes(t));

      if (matchesCat && matchesTags) {
        card.classList.remove('is-hidden');
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    if (thorResultCount) {
      thorResultCount.textContent = `Mostrando ${visibleCount} de ${THOR_OUTDOOR_CATALOG.length} modelos`;
    }
    if (thorClearFiltersBtn) {
      thorClearFiltersBtn.hidden = activeThorCategory === 'all' && checkedTags.length === 0;
    }
  }

  thorCatLinks.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeThorCategory = btn.getAttribute('data-thor-cat') || 'all';
      thorCatLinks.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      applyThorFilters();
    });
  });

  thorTagCheckboxes.forEach((cb) => {
    cb.addEventListener('change', applyThorFilters);
  });

  if (thorClearFiltersBtn) {
    thorClearFiltersBtn.addEventListener('click', () => {
      activeThorCategory = 'all';
      thorCatLinks.forEach((b) => {
        const isAll = b.getAttribute('data-thor-cat') === 'all';
        b.classList.toggle('active', isAll);
        b.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      thorTagCheckboxes.forEach((cb) => {
        cb.checked = false;
      });
      applyThorFilters();
    });
  }
 
  // Vista Rápida para los 8 modelos oficiales THOR Kitchen®
  function openThorQuickView(sku) {
    const item = THOR_OUTDOOR_CATALOG.find((x) => x.sku === sku);
    const modal = document.getElementById('maQuickViewModal');
    if (!item || !modal) return;

    document.getElementById('maQvSku').textContent = `MODELO OFICIAL THOR KITCHEN®: ${item.sku}`;
    document.getElementById('maQvTitle').textContent = item.title;
    document.getElementById('maQvPrice').textContent = `${item.price} + IVA`;
    document.getElementById('maQvDesc').textContent = item.summary;

    const mainImg = document.getElementById('maQvMainImg');
    const thumb1 = document.getElementById('maQvThumb1');
    const thumb2 = document.getElementById('maQvThumb2');
    const thumb1Img = document.getElementById('maQvThumb1Img');
    const thumb2Img = document.getElementById('maQvThumb2Img');

    mainImg.src = item.img;
    mainImg.onerror = () => { mainImg.src = item.fallbackImg; };
    mainImg.alt = `${item.sku} - ${item.title}`;
    thumb1Img.src = item.img;
    thumb1Img.onerror = () => { thumb1Img.src = item.fallbackImg; };
    thumb2Img.src = item.fallbackImg;
    thumb1.classList.add('active');
    thumb2.classList.remove('active');

    document.getElementById('maQvOverallDims').innerHTML = `<li>${item.dims}</li>`;
    document.getElementById('maQvModuleDims').innerHTML = `<li>Módulo individual de la Suite Modular Exterior THOR Kitchen®</li>`;
    document.getElementById('maQvFeaturesHeading').textContent = `Especificaciones Oficiales — ${item.sku}`;
    document.getElementById('maQvStandardFeatures').innerHTML = item.specs.map((s) => `<li>${s}</li>`).join('');

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  document.addEventListener('click', (e) => {
    const thorTrigger = e.target.closest('[data-thor-qv]');
    if (thorTrigger) {
      openThorQuickView(thorTrigger.getAttribute('data-thor-qv'));
    }
  });

  // Carrusel de las 7 Características de la Serie Original
  const maFeaturesTrack = document.getElementById('maFeaturesTrack');
  const maFeatPrev = document.getElementById('maFeatPrev');
  const maFeatNext = document.getElementById('maFeatNext');

  if (maFeaturesTrack && maFeatPrev && maFeatNext) {
    maFeatPrev.addEventListener('click', () => {
      maFeaturesTrack.scrollBy({ left: -320, behavior: 'smooth' });
    });
    maFeatNext.addEventListener('click', () => {
      maFeaturesTrack.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  // Modal de Vista Rápida (Quick View) en Español
  const qvModal = document.getElementById('maQuickViewModal');
  const qvCloseBtn = document.getElementById('maQvCloseBtn');
  const qvMainImg = document.getElementById('maQvMainImg');
  const qvThumb1 = document.getElementById('maQvThumb1');
  const qvThumb2 = document.getElementById('maQvThumb2');
  const qvThumb1Img = document.getElementById('maQvThumb1Img');
  const qvThumb2Img = document.getElementById('maQvThumb2Img');
  const qvSku = document.getElementById('maQvSku');
  const qvTitle = document.getElementById('maQvTitle');
  const qvPrice = document.getElementById('maQvPrice');
  const qvDesc = document.getElementById('maQvDesc');
  const qvOverallDims = document.getElementById('maQvOverallDims');
  const qvModuleDims = document.getElementById('maQvModuleDims');
  const qvFeaturesHeading = document.getElementById('maQvFeaturesHeading');
  const qvStandardFeatures = document.getElementById('maQvStandardFeatures');
  const qvQuoteBtn = document.getElementById('maQvQuoteBtn');

  function openMaQuickView(sku) {
    const item = MONT_ALPI_ORIGINAL_CATALOG.find((x) => x.sku === sku);
    if (!item || !qvModal) return;

    const is6Burner = item.sku.startsWith('MAi805');
    const coverUrl = `${MA_CDN_BASE}${item.cover}?format=1000w`;
    const hoverUrl = `${MA_CDN_BASE}${item.hover}?format=1000w`;

    qvSku.textContent = `MODELO OFICIAL: ${item.sku}`;
    qvTitle.textContent = item.title;
    qvPrice.textContent = formatMaPrice(item.sku);

    const btuText = is6Burner ? '115,000 BTU' : '78,000 BTU';
    const burnersCount = is6Burner ? 'seis quemadores' : 'cuatro quemadores';
    qvDesc.textContent = `La ${item.title} (${item.sku}) de la Serie Original Mont Alpi combina máximo desempeño de asado (${btuText} con ${burnersCount} en acero inoxidable 304, quemador lateral infrarrojo para sellado y quemador trasero infrarrojo para rosticero) con cubiertas de granito compuesto blanco de fácil limpieza, luces halógenas de cocción nocturna y perillas con iluminación LED rojo/azul. Lista para Gas LP y convertible fácilmente a Gas Natural.`;

    qvMainImg.src = coverUrl;
    qvMainImg.alt = `${item.sku} - ${item.title}`;
    qvThumb1Img.src = coverUrl;
    qvThumb2Img.src = hoverUrl;
    qvThumb1.classList.add('active');
    qvThumb2.classList.remove('active');

    qvThumb1.onclick = () => {
      qvMainImg.src = coverUrl;
      qvThumb1.classList.add('active');
      qvThumb2.classList.remove('active');
    };
    qvThumb2.onclick = () => {
      qvMainImg.src = hoverUrl;
      qvThumb2.classList.add('active');
      qvThumb1.classList.remove('active');
    };

    qvOverallDims.innerHTML = `<li>${item.dims.replace(/x/g, ' × ')} (46" hasta el tope de la campana cerrada)</li>`;
    qvModuleDims.innerHTML = item.mods
      .map((mKey) => `<li>${MA_MODULE_LABELS[mKey] || mKey}</li>`)
      .join('');

    qvFeaturesHeading.textContent = is6Burner
      ? 'Serie Original 6 Quemadores — Características Estándar'
      : 'Serie Original 4 Quemadores — Características Estándar';

    const cookingSurface = is6Burner ? '38" × 18"' : '28" × 18"';
    qvStandardFeatures.innerHTML = `
      <li>Potencia térmica total de ${btuText}</li>
      <li>Superficie principal de cocción de ${cookingSurface} (sin incluir rejilla de calentamiento)</li>
      <li>Componentes 100% en Acero Inoxidable 304 (${is6Burner ? '6' : '4'} quemadores en acero 304, parrillas de varilla de 8 mm y rejilla de calentamiento)</li>
      <li>Quemadores infrarrojos cerámicos lateral y trasero</li>
      <li>Superficies de trabajo en granito blanco compuesto</li>
      <li>Charola recolectora de grasa de fácil acceso frontal con deslizamiento sobre baleros</li>
      <li>Dos luces halógenas en el área de cocción y perillas de control con luces LED que cambian de color (azul/rojo)</li>
      <li>Encendido electrónico, medidor de temperatura en campana, destapador integrado, ruedas de uso rudo y patas niveladoras</li>
      <li>Lista para Gas LP (con manguera, regulador y charola deslizable para tanque) y fácilmente convertible a Gas Natural</li>
    `;

    if (qvQuoteBtn) {
      qvQuoteBtn.onclick = () => {
        selectOutdoorModelInForm(item.sku, item.title);
        closeMaQuickView();
      };
    }

    qvModal.hidden = false;
    qvModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMaQuickView() {
    if (!qvModal) return;
    qvModal.hidden = true;
    qvModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (qvCloseBtn) {
    qvCloseBtn.addEventListener('click', closeMaQuickView);
  }
  if (qvModal) {
    qvModal.addEventListener('click', (e) => {
      if (e.target === qvModal) closeMaQuickView();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qvModal && !qvModal.hidden) {
      closeMaQuickView();
    }
  });

  document.addEventListener('click', (e) => {
    const qvTrigger = e.target.closest('[data-qv-sku]');
    if (qvTrigger) {
      const sku = qvTrigger.getAttribute('data-qv-sku');
      openMaQuickView(sku);
      return;
    }

    const quoteTrigger = e.target.closest('[data-quote-sku]');
    if (quoteTrigger) {
      const sku = quoteTrigger.getAttribute('data-quote-sku');
      const item = MONT_ALPI_ORIGINAL_CATALOG.find((x) => x.sku === sku);
      if (item) {
        selectOutdoorModelInForm(item.sku, item.title);
      }
      return;
    }

    const extraTrigger = e.target.closest('[data-select-sku]');
    if (extraTrigger) {
      const customVal = extraTrigger.getAttribute('data-select-sku');
      selectOutdoorModelInForm(customVal, customVal);
    }
  });

  // 5. Selector Interactivo de Paletas Italianas (Continuidad de Materiales)
  const palettesData = {
    milano: {
      code: 'PALETA ARQUITECTÓNICA 01',
      title: 'Atmósfera Milano Notte',
      desc: 'Ideal para residencias de planta abierta donde la cocina convive directamente con el living y el comedor. Combina la calidez profunda del nogal italiano con superficies pétreas de poro cerrado.',
      kitchen: 'Isla monolítica en piedra sinterizada tono travertino con columnas ocultas en Nogal Canaletto.',
      living: 'Muro multimedia con lambrín del mismo Nogal Canaletto y repisas metálicas en grafito.',
      bedroom: 'Vestidor con vitrinas en aluminio grafito, cristal fumé y cajoneras con interiores en piel topo.',
      outdoor: 'Módulo de asador revestido en la misma piedra ultracompacta inalterable a la intemperie.'
    },
    como: {
      code: 'PALETA ARQUITECTÓNICA 02',
      title: 'Atmósfera Lago di Como',
      desc: 'Luminosa, serena y orgánica. Pensada para espacios bañados por luz natural que buscan amplitud visual mediante lacas sedosas y vetas suaves de roble europeo.',
      kitchen: 'Frentes en Laca Seda Arena sin tiradores, encimera en Calacatta cálido e interior en Roble Natural.',
      living: 'Libreros de doble altura y credenza suspendida en Roble Natural con iluminación lineal 2700K.',
      bedroom: 'Cabecera continua y vestidor abierto en tono arena con herrajes ocultos en champán mate.',
      outdoor: 'Barra de terraza y asador en piedra clara antideslizante y polímeros de exterior tono lino.'
    },
    torino: {
      code: 'PALETA ARQUITECTÓNICA 03',
      title: 'Atmósfera Torino Monolith',
      desc: 'Carácter arquitectónico de vanguardia. Superficies nanotecnológicas ultra-mate anti-huella combinadas con maderas ahumadas y acentos metálicos en bronce.',
      kitchen: 'Cocina escénica en Fenix Negro con sistema de puertas escamoteables en Eucalipto Ahumado.',
      living: 'Centro de entretenimiento con paneles acústicos alistonados y cava climatizada en bronce.',
      bedroom: 'Walk-in closet tipo boutique con cristal reflectivo bronce, piel antracita y luz perimetral.',
      outdoor: 'Cocina exterior de autor en acero inoxidable grado marino y granito negro flameado.'
    }
  };

  const paletteBtns = document.querySelectorAll('.palette-btn');
  const paletteCode = document.getElementById('paletteCode');
  const paletteTitle = document.getElementById('paletteTitle');
  const paletteDesc = document.getElementById('paletteDesc');
  const stepKitchen = document.getElementById('stepKitchen');
  const stepLiving = document.getElementById('stepLiving');
  const stepBedroom = document.getElementById('stepBedroom');
  const stepOutdoor = document.getElementById('stepOutdoor');

  paletteBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-palette');
      const data = palettesData[key];
      if (!data) return;

      paletteBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      if (paletteCode) paletteCode.textContent = data.code;
      if (paletteTitle) paletteTitle.textContent = data.title;
      if (paletteDesc) paletteDesc.textContent = data.desc;
      if (stepKitchen) stepKitchen.textContent = data.kitchen;
      if (stepLiving) stepLiving.textContent = data.living;
      if (stepBedroom) stepBedroom.textContent = data.bedroom;
      if (stepOutdoor) stepOutdoor.textContent = data.outdoor;
    });
  });

  // 5.B Interactividad de Vestidores & Walk-in Closets
  const closetLineTabs = document.querySelectorAll('.closet-line-tab');
  const closetLineCards = document.querySelectorAll('.closet-line-card');

  closetLineTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-line-filter');
      closetLineTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      closetLineCards.forEach((card) => {
        const line = card.getAttribute('data-line');
        if (filter === 'all' || line === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const techTabBtns = document.querySelectorAll('.tech-tab-btn');
  const closetTechStageImg = document.getElementById('closetTechStageImg');
  const closetTechStageTitle = document.getElementById('closetTechStageTitle');
  const closetTechStageDesc = document.getElementById('closetTechStageDesc');

  techTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      techTabBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      if (closetTechStageImg) {
        closetTechStageImg.src = btn.getAttribute('data-tech-img');
        closetTechStageImg.alt = btn.getAttribute('data-tech-title');
      }
      if (closetTechStageTitle) {
        closetTechStageTitle.textContent = btn.getAttribute('data-tech-title');
      }
      if (closetTechStageDesc) {
        closetTechStageDesc.textContent = btn.getAttribute('data-tech-desc');
      }
    });
  });

  const accFilterBtns = document.querySelectorAll('.acc-filter-btn');
  const closetAccCards = document.querySelectorAll('.closet-acc-card');

  accFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-acc-filter');
      accFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      closetAccCards.forEach((card) => {
        const cardCat = card.getAttribute('data-acc-cat');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const closetLineSelect = document.getElementById('closetLineSelect');
  const closetQuoteTriggers = document.querySelectorAll('.closet-quote-trigger');

  closetQuoteTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const lineValue = trigger.getAttribute('data-closet-line');
      const vestidorCb = document.querySelector('input[name="spaces"][value="Vestidor / Walk-in Closet"]');
      if (vestidorCb) vestidorCb.checked = true;
      if (closetLineSelect && lineValue) {
        closetLineSelect.value = lineValue;
      }
      const cotizarSection = document.getElementById('cotizar');
      if (cotizarSection) {
        cotizarSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'index.html#cotizar';
      }
    });
  });

  // 6. Formulario de Campaña (Envío a WhatsApp Finezza Querétaro)
  const leadForm = document.getElementById('leadForm');
  const formFeedback = document.getElementById('formFeedback');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const city = document.getElementById('clientCity').value.trim() || 'Por definir';
      const stage = document.getElementById('projectStage').value;
      const showroom = document.getElementById('preferredShowroom').value;

      const selectedSpaces = Array.from(
        leadForm.querySelectorAll('input[name="spaces"]:checked')
      ).map((cb) => cb.value);

      const spacesText = selectedSpaces.length > 0
        ? selectedSpaces.join(', ')
        : 'Proyecto Residencial Integral';

      if (formFeedback) {
        formFeedback.style.color = '#1A1918';
        formFeedback.innerHTML = `<strong>&iexcl;Gracias, ${name}!</strong> Hemos preparado tu solicitud para <em>${spacesText}</em> (${showroom}).`;
      }

      const waMessage = encodeURIComponent(
        `Hola Finezza Querétaro, mi nombre es ${name} (${phone}). Me interesa agendar cita / cotizar: ${spacesText}. Zona: ${city}. Etapa: ${stage}. Preferencia: ${showroom}.`
      );
      const waUrl = `https://wa.me/524427197102?text=${waMessage}`;

      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener');
      }, 600);
    });
  }
});

// WhatsApp flotante: subirlo mientras el pie del hero (controles del carrusel) esté en pantalla
const initWaLift = function () {
  const wa = document.querySelector('.wa-float');
  const heroFooter = document.querySelector('.hero .hero-footer');
  if (!wa || !heroFooter || !('IntersectionObserver' in window)) return;
  const setLift = () => {
    wa.style.setProperty('--wa-lift', Math.round(heroFooter.getBoundingClientRect().height + 14) + 'px');
  };
  setLift();
  window.addEventListener('resize', setLift);
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => wa.classList.toggle('is-lifted', entry.isIntersecting));
  }).observe(heroFooter);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initWaLift);
else initWaLift();

// Menú deslizable en celular: mostrar la página actual aunque esté al final de la tira
(function () {
  const run = () => {
    const nav = document.querySelector('.subpage-nav');
    const cur = nav && nav.querySelector('[aria-current="page"], a.active');
    if (!nav || !cur || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft = Math.max(0, cur.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

// Submenú "Espacios": abre con clic/tacto y con teclado; se cierra al salir o con Escape
(function () {
  const init = () => {
    document.querySelectorAll('.nav-drop').forEach((drop) => {
      const btn = drop.querySelector('.nav-drop-btn');
      if (!btn) return;
      const set = (open) => { drop.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
      btn.addEventListener('click', (e) => { e.stopPropagation(); set(!drop.classList.contains('is-open')); });
      document.addEventListener('click', (e) => { if (!drop.contains(e.target)) set(false); });
      drop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); btn.focus(); } });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

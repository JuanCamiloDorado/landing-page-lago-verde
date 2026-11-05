// Behaviour shared by every Lago Verde page: mobile menu, floating tab bar,
// entrance animations, the demo newsletter form, the category search and the restaurant menu.
(() => {
  // Mobile menu toggle
  const menu = document.getElementById('mainmenu');
  const toggle = document.querySelector('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  // Close the mobile menu after picking a link
  menu.querySelectorAll('.mainmenu__nav a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false);
  }));

  // Once the hero's main menu scrolls away, the tab bar turns into a floating white bar
  const topbar = document.querySelector('.topbar');
  const heroEl = document.querySelector('.hero');
  const stickAt = () => heroEl.getBoundingClientRect().top + window.scrollY + 100;
  // Phones: the floating bar's hamburger opens the tabs as a dropdown
  const barToggle = topbar.querySelector('.topbar__toggle');
  const setBarOpen = open => { topbar.classList.toggle('is-open', open); barToggle.setAttribute('aria-expanded', open); };
  barToggle.addEventListener('click', () => setBarOpen(!topbar.classList.contains('is-open')));
  topbar.querySelectorAll('.tabs a').forEach(a => a.addEventListener('click', () => setBarOpen(false)));
  let stuck = false;
  const onScroll = () => {
    const next = window.scrollY > stickAt();
    if (next !== stuck) {
      stuck = next; topbar.classList.toggle('is-stuck', stuck);
      if (!stuck) setBarOpen(false);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Entrance animations
  const io = new IntersectionObserver((entries) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // "De día y de noche": captions in the same row share the tallest one's height,
  // so their tops and round arrows line up whatever the length of the text.
  document.querySelectorAll('.activities').forEach((group) => {
    const captions = [...group.querySelectorAll('.activity__card')];
    const equalize = () => {
      captions.forEach((c) => { c.style.minHeight = ''; });
      const rows = new Map();
      captions.forEach((c) => {
        const top = Math.round(c.parentElement.getBoundingClientRect().top);
        rows.set(top, [...(rows.get(top) || []), c]);
      });
      rows.forEach((row) => {
        if (row.length < 2) return;
        const tallest = Math.max(...row.map((c) => c.offsetHeight));
        row.forEach((c) => { c.style.minHeight = `${tallest}px`; });
      });
    };
    new ResizeObserver(equalize).observe(group); // also runs once on load
    document.fonts?.ready.then(equalize);        // web fonts change line wrapping
  });

  // Opiniones (Google reviews): score count-up, rotating featured quote, drifting review wall and a
  // dialog with the full review. Motion pauses off screen, while the dialog is open and with the
  // "Pausar movimiento" button; reduced motion turns it off. The featured quotes follow the WAI-ARIA
  // carousel pattern: their own stop/start button comes first, a mouse over them pauses rotation,
  // and keyboard focus entering them stops it until the user starts it again.
  document.querySelectorAll('[data-reviews]').forEach((band) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const featured = band.querySelector('[data-featured]');
    const slidesBox = featured.querySelector('.featured__slides');
    const slides = [...featured.querySelectorAll('.featured__slide')];
    const dots = [...featured.querySelectorAll('.featured__dot')];
    const rotateBtn = featured.querySelector('[data-rotate]');
    const wall = band.querySelector('[data-wall]');
    const rows = [...wall.querySelectorAll('.marquee')];
    const pauseBtn = band.querySelector('[data-pause]');
    const dialog = band.querySelector('.rv-dialog');
    const state = { user: false, visible: false, hover: false, rotating: !reduce.matches };

    const sync = () => {
      const still = state.user || !state.visible || dialog.open;
      band.classList.toggle('is-paused', still);
      band.classList.toggle('is-user-paused', state.user);
      featured.classList.toggle('is-paused', still || state.hover || !state.rotating);
      featured.classList.toggle('is-stopped', !state.rotating);
      rotateBtn.setAttribute('aria-label', state.rotating ? 'Detener la rotación de opiniones' : 'Iniciar la rotación de opiniones');
      // Announce slide changes only while nothing changes them on its own
      slidesBox.setAttribute('aria-live', state.rotating && !state.user ? 'off' : 'polite');
    };
    new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; sync(); }).observe(band);
    pauseBtn.addEventListener('click', () => {
      state.user = !state.user;
      state.rotating = !state.user;
      pauseBtn.querySelector('[data-label]').textContent = state.user ? 'Reanudar movimiento' : 'Pausar movimiento';
      sync();
    });

    // Score counts up from 0 the first time it scrolls into view. The real number stays in the HTML
    // until the card starts to show (it is still faded out then), so nothing that doesn't scroll sees "0,0".
    const num = band.querySelector('[data-count]');
    const target = parseFloat(num.dataset.count);
    const fmt = (v) => v.toFixed(1).replace('.', ',');
    if (!reduce.matches) {
      let reset = false;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        if (!reset) { reset = true; num.textContent = fmt(0); }
        if (e.intersectionRatio < 0.6) return;
        io.disconnect();
        if (document.hidden) { num.textContent = fmt(target); return; }
        const t0 = performance.now() + 250;
        const tick = (t) => {
          const p = Math.min(1, Math.max(0, (t - t0) / 1500));
          num.textContent = fmt(target * (1 - (1 - p) ** 3));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: [0, 0.6] });
      io.observe(num);
    }

    // Featured quote: the active bar's CSS animation is the timer; when it ends, move on
    let current = 0;
    const show = (n) => {
      current = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        const on = i === current;
        s.classList.toggle('is-active', on);
        s.toggleAttribute('inert', !on);
        s.setAttribute('aria-hidden', String(!on));
      });
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
        d.classList.toggle('is-done', i < current);
        d.setAttribute('aria-current', String(i === current));
      });
    };
    dots.forEach((d, i) => {
      d.addEventListener('click', () => show(i));
      d.firstElementChild.addEventListener('animationend', () => show(current + 1));
    });
    featured.querySelectorAll('[data-step]').forEach((b) => {
      b.addEventListener('click', () => show(current + Number(b.dataset.step)));
    });
    rotateBtn.addEventListener('click', () => { state.rotating = !state.rotating; sync(); });
    featured.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { state.hover = true; sync(); } });
    featured.addEventListener('pointerleave', () => { state.hover = false; sync(); });
    // Keyboard focus arriving from outside stops rotation for good (a mouse click doesn't count)
    featured.addEventListener('focusin', (e) => {
      if (!featured.contains(e.relatedTarget) && e.target.matches(':focus-visible')) { state.rotating = false; sync(); }
    });

    // Review wall: clone each row's cards enough times to fill it, then CSS slides the track by
    // exactly one set of cards per loop, so it never shows a seam.
    const buildWall = () => {
      wall.querySelectorAll('[data-clone]').forEach((c) => c.remove());
      wall.classList.toggle('is-ready', !reduce.matches);
      if (reduce.matches) return;
      rows.forEach((row) => {
        const track = row.querySelector('.marquee__track');
        const group = track.querySelector('.marquee__group');
        const w = group.getBoundingClientRect().width;
        for (let k = Math.ceil(row.clientWidth / w); k >= 0; k--) {
          const clone = group.cloneNode(true);
          clone.dataset.clone = '';
          // Copies stay clickable but are skipped by screen readers and the Tab key
          clone.setAttribute('aria-hidden', 'true');
          clone.querySelectorAll('button').forEach((b) => { b.tabIndex = -1; });
          track.append(clone);
        }
        track.style.setProperty('--rv-shift', `${w}px`);
        track.style.setProperty('--rv-duration', `${(w / 38).toFixed(1)}s`); // about 38 px per second
      });
    };
    let wallWidth = 0;
    new ResizeObserver(() => {
      if (wall.clientWidth === wallWidth) return;
      wallWidth = wall.clientWidth;
      buildWall();
    }).observe(wall);
    reduce.addEventListener('change', buildWall);
    // Tabbing to a card can scroll its row; put it back once focus leaves the wall
    wall.addEventListener('focusout', (e) => {
      if (!wall.contains(e.relatedTarget) && wall.classList.contains('is-ready')) rows.forEach((r) => { r.scrollLeft = 0; });
    });

    // Full review dialog, filled from the card (or from the featured quote's full text)
    const fill = (src) => {
      const avatar = src.querySelector('.avatar');
      const dAvatar = dialog.querySelector('.avatar');
      dAvatar.textContent = avatar.textContent;
      dAvatar.style.setProperty('--avatar', avatar.style.getPropertyValue('--avatar'));
      dialog.querySelector('[data-name]').textContent = src.querySelector('[data-name]').textContent.trim();
      const stars = src.querySelector('.stars');
      const dStars = dialog.querySelector('.stars');
      dStars.style.setProperty('--rating', stars.style.getPropertyValue('--rating') || '5');
      dStars.setAttribute('aria-label', stars.getAttribute('aria-label'));
      const time = src.querySelector('time');
      const dTime = dialog.querySelector('time');
      dTime.dateTime = time.dateTime;
      dTime.textContent = time.textContent;
      const full = src.querySelector('template[data-full]');
      const text = dialog.querySelector('[data-text]');
      if (full) text.replaceChildren(full.content.cloneNode(true));
      else text.innerHTML = src.querySelector('[data-text]').innerHTML;
    };
    let byPointer = false;
    band.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open]');
      if (!trigger) return;
      byPointer = e.detail > 0;
      fill(trigger.closest('[data-review]') || slides[current]);
      dialog.showModal();
      dialog.scrollTop = 0;
      sync();
    });
    let downOnBackdrop = false;
    dialog.addEventListener('pointerdown', (e) => { downOnBackdrop = e.target === dialog; });
    dialog.addEventListener('click', (e) => { if (downOnBackdrop && e.target === dialog) dialog.close(); });
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      sync();
      // Mouse and touch users don't need focus parked on the card (it would hold the wall still)
      if (byPointer) document.activeElement?.blur();
    });
    sync();
  });

  // "Copiar" buttons (address in "Cómo llegar"): copy data-copy to the clipboard and confirm for 2 s.
  // Falls back to a hidden textarea where the Clipboard API is missing or refuses (plain http on a LAN IP,
  // embedded frames without clipboard permission).
  const copyWithTextarea = (text) => new Promise((resolve, reject) => {
    const ta = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove();
    ok ? resolve() : reject(new Error('copy failed'));
  });
  const copyText = (text) => (navigator.clipboard && window.isSecureContext
    ? navigator.clipboard.writeText(text).catch(() => copyWithTextarea(text))
    : copyWithTextarea(text));
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('[data-copy-label]');
    const status = btn.parentElement.querySelector('[data-copy-status]');
    let timer;
    const show = (copied, text, said) => {
      btn.classList.toggle('is-copied', copied); label.textContent = text;
      if (status) status.textContent = said;
    };
    btn.addEventListener('click', () => {
      clearTimeout(timer);
      copyText(btn.dataset.copy)
        .then(() => show(true, 'Copiada', 'Dirección copiada'))
        .catch(() => show(false, 'No se pudo copiar', 'No se pudo copiar la dirección'))
        .finally(() => { timer = setTimeout(() => show(false, 'Copiar', ''), 2000); });
    });
  });

  // Demo newsletter form (no network request)
  document.getElementById('nl-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email;
    if (!email.checkValidity()) { email.focus(); email.style.borderBottomColor = '#93372B'; return; }
    e.target.querySelector('.nl-thanks').style.display = 'block';
  });

  // Footer "Créditos de imágenes": a dialog with the authors and licenses of the stock photos
  const creditsDialog = document.getElementById('creditos-imagenes');
  if (creditsDialog) {
    document.querySelectorAll('[data-credits-open]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault(); creditsDialog.showModal(); creditsDialog.scrollTop = 0;
    }));
    creditsDialog.querySelector('[data-credits-close]').addEventListener('click', () => creditsDialog.close());
    creditsDialog.addEventListener('click', (e) => { if (e.target === creditsDialog) creditsDialog.close(); }); // backdrop
  }

  // Category pages (gastronomia.html, bienestar.html, tiendas.html): live search over the venue cards.
  // Matches every word typed against the card text plus its data-tags, ignoring accents and case.
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  document.querySelectorAll('[data-directory]').forEach((dir) => {
    const input = dir.querySelector('.directory__search input');
    const cards = [...dir.querySelectorAll('.directory__grid > article')];
    const count = dir.querySelector('.directory__count');
    const empty = dir.querySelector('.directory__empty');
    if (!input || !cards.length) return;
    const text = cards.map((c) => norm(c.textContent + ' ' + (c.dataset.tags || '')));
    const update = () => {
      const words = norm(input.value).split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((c, i) => {
        const match = words.every((w) => text[i].includes(w));
        c.hidden = !match;
        if (match) shown++;
      });
      count.textContent = `${shown} ${shown === 1 ? dir.dataset.one : dir.dataset.many}`;
      empty.hidden = shown > 0;
    };
    input.addEventListener('input', update);
    update();
  });

  // Restaurant page menu (la-romanezca.html): dish search, "Ver N platos más", section tabs that
  // follow the scroll, and a dialog with the full dish (photo, whole description, every price).
  document.querySelectorAll('[data-menu]').forEach((menuEl) => {
    const sections = [...menuEl.querySelectorAll('[data-section]')];
    const dishes = [...menuEl.querySelectorAll('.dish')];
    const navLinks = [...menuEl.querySelectorAll('.menu-nav a')];
    const navList = menuEl.querySelector('.menu-nav ul');
    const input = menuEl.querySelector('[data-menu-search]');
    const count = menuEl.querySelector('[data-menu-count]');
    const empty = menuEl.querySelector('[data-menu-empty]');
    const linkFor = (section) => navLinks.find((a) => a.hash === `#${section.id}`);

    // "Ver N platos más" / "Ver menos"
    const setExpanded = (section, open) => {
      const btn = section.querySelector('[data-more]');
      if (!btn) return;
      btn.dataset.label ??= btn.firstChild.textContent;
      section.classList.toggle('is-expanded', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.firstChild.textContent = open ? 'Ver menos' : btn.dataset.label;
    };
    menuEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-more]');
      if (!btn) return;
      const section = btn.closest('[data-section]');
      const open = !section.classList.contains('is-expanded');
      setExpanded(section, open);
      if (!open) section.scrollIntoView({ block: 'start' }); // don't leave the reader far below a shrunk list
    });

    // Links to a dish that is folded away ("Imperdibles de la casa") unfold its section first
    document.querySelectorAll('a[href^="#plato-"]').forEach((a) => a.addEventListener('click', () => {
      const dish = document.getElementById(a.hash.slice(1));
      if (dish?.hasAttribute('data-extra')) setExpanded(dish.closest('[data-section]'), true);
    }));

    // Search: every typed word must appear in the dish (name, description, options) or its section title
    const text = dishes.map((d) => norm(`${d.textContent} ${d.closest('[data-section]').querySelector('h3').textContent}`));
    const total = dishes.length;
    const update = () => {
      const words = norm(input.value).split(/\s+/).filter(Boolean);
      const searching = words.length > 0;
      let shown = 0;
      dishes.forEach((d, i) => {
        const match = words.every((w) => text[i].includes(w));
        d.hidden = !match;
        d.classList.toggle('is-match', searching && match);
        if (match) shown++;
      });
      sections.forEach((s) => {
        const any = s.querySelector('.dish:not([hidden])');
        s.hidden = !any;
        const li = linkFor(s)?.parentElement;
        if (li) li.hidden = !any;
      });
      menuEl.classList.toggle('is-searching', searching);
      empty.hidden = shown > 0;
      count.textContent = searching
        ? `${shown} ${shown === 1 ? 'plato' : 'platos'} de ${total}`
        : `${total} platos en ${sections.length} secciones`;
    };
    input.addEventListener('input', update);
    update();

    // Section tabs: the current section is the last one whose title has passed under the sticky tabs
    let activeId = '';
    const setActive = (section) => {
      if (section.id === activeId) return;
      activeId = section.id;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.hash === `#${section.id}`));
      const a = linkFor(section);
      if (a && navList.scrollWidth > navList.clientWidth) {
        navList.scrollTo({ left: a.offsetLeft - navList.offsetLeft - 104 }); // clear of the left arrow and its fade
      }
    };
    const nav = menuEl.querySelector('.menu-nav');
    let ticking = false;
    const spy = () => {
      ticking = false;
      const line = nav.getBoundingClientRect().bottom + 60;
      const shown = sections.filter((s) => !s.hidden);
      const current = shown.filter((s) => s.querySelector('h3').getBoundingClientRect().top <= line).pop() || shown[0];
      if (current) setActive(current);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    input.addEventListener('input', spy);
    spy();
    // Fade the tab row's edges while there are more tabs to scroll to
    const edges = () => {
      const max = navList.scrollWidth - navList.clientWidth;
      nav.classList.toggle('has-more-left', navList.scrollLeft > 4);
      nav.classList.toggle('has-more-right', navList.scrollLeft < max - 4);
    };
    navList.addEventListener('scroll', edges, { passive: true });
    new ResizeObserver(edges).observe(navList);
    edges();
    // Mouse users: the arrows page through the tabs, and the wheel moves the row sideways
    // until it reaches an end (then the page scrolls as usual)
    nav.querySelectorAll('[data-nav-step]').forEach((b) => b.addEventListener('click', () => {
      navList.scrollBy({ left: Number(b.dataset.navStep) * navList.clientWidth * 0.7 });
    }));
    navList.addEventListener('wheel', (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return; // pinch zoom or a real sideways swipe
      const max = navList.scrollWidth - navList.clientWidth;
      const goingRight = e.deltaY > 0;
      if ((goingRight && navList.scrollLeft >= max - 1) || (!goingRight && navList.scrollLeft <= 0)) return;
      e.preventDefault();
      navList.scrollBy({ left: e.deltaY, behavior: 'instant' }); // the row's smooth scrolling would lag behind the wheel
    }, { passive: false });

    // Dish dialog, filled from the row that was clicked
    const dialog = document.querySelector('[data-dish-dialog]');
    if (!dialog) return;
    const dImg = dialog.querySelector('[data-dish-img]');
    const fill = (dish) => {
      const img = dish.querySelector('img.dish__img');
      dImg.hidden = !img;
      if (img) { dImg.src = img.currentSrc || img.src; dImg.alt = dish.querySelector('.dish__open').textContent; }
      else dImg.removeAttribute('src');
      dialog.querySelector('[data-dish-section]').textContent = dish.closest('[data-section]').querySelector('h3').textContent;
      dialog.querySelector('[data-dish-name]').textContent = dish.querySelector('.dish__open').textContent;
      dialog.querySelector('[data-dish-price]').innerHTML = dish.querySelector('.dish__price').innerHTML;
      dialog.querySelector('[data-dish-desc]').innerHTML = dish.querySelector('.dish__desc')?.innerHTML ?? '';
      dialog.querySelector('[data-dish-variants]').innerHTML = dish.querySelector('.dish__variants')?.innerHTML ?? '';
    };
    menuEl.addEventListener('click', (e) => {
      const open = e.target.closest('[data-dish]');
      if (!open) return;
      fill(open.closest('.dish'));
      dialog.showModal();
      dialog.scrollTop = 0;
    });
    let downOnBackdrop = false;
    dialog.addEventListener('pointerdown', (e) => { downOnBackdrop = e.target === dialog; });
    dialog.addEventListener('click', (e) => { if (downOnBackdrop && e.target === dialog) dialog.close(); });
    dialog.querySelector('[data-dish-close]').addEventListener('click', () => dialog.close());
  });
})();

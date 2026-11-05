// Behaviour shared by every Lago Verde page: mobile menu, floating tab bar,
// entrance animations, the demo newsletter form and the category search.
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

  // Category pages (gastronomia.html, bienestar.html, tiendas.html): live search over the venue cards.
  // Matches every word typed against the card text plus its data-tags, ignoring accents and case.
  // Pages split into .directory__section blocks (gastronomia.html) also get category buttons:
  // "todos" lists every section that has venues, any other button shows only its section
  // (with its "Muy pronto" note when it has no venues yet). The URL hash keeps the chosen tab.
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  document.querySelectorAll('[data-directory]').forEach((dir) => {
    const input = dir.querySelector('.directory__search input');
    const cards = [...dir.querySelectorAll('.directory__grid > article')];
    const count = dir.querySelector('.directory__count');
    const empty = dir.querySelector('.directory__empty');
    if (!input || !cards.length) return;
    const text = cards.map((c) => norm(c.textContent + ' ' + (c.dataset.tags || '')));
    const sections = [...dir.querySelectorAll('.directory__section')].map((el) => ({
      el,
      cat: el.dataset.category,
      cards: [...el.querySelectorAll('.directory__grid > article')],
      soon: el.querySelector('.directory__soon'),
    }));
    const filters = [...dir.querySelectorAll('.directory__filter')];
    const cats = new Set(sections.map((s) => s.cat));
    let current = 'todos';

    const update = () => {
      const words = norm(input.value).split(/\s+/).filter(Boolean);
      const visible = new Set(cards.filter((c, i) => words.every((w) => text[i].includes(w))));
      let shown = 0;
      cards.forEach((c) => {
        const inCat = current === 'todos' || c.closest('.directory__section')?.dataset.category === current;
        c.hidden = !(inCat && visible.has(c));
        if (!c.hidden) shown++;
      });
      const label = (n) => `${n} ${n === 1 ? dir.dataset.one : dir.dataset.many}`;
      let soonShown = false;
      sections.forEach((s) => {
        const picked = current === 'todos' || s.cat === current;
        const matches = s.cards.filter((c) => !c.hidden).length;
        // A category with no venues yet only appears when its own tab is chosen, as "Muy pronto".
        const isSoon = picked && current !== 'todos' && !s.cards.length;
        s.el.hidden = !(matches || isSoon);
        if (s.soon) s.soon.hidden = !isSoon;
        soonShown = soonShown || isSoon;
        const head = s.el.querySelector('.directory__head-count');
        if (head) head.textContent = isSoon ? 'Muy pronto' : label(matches);
      });
      count.textContent = label(shown);
      empty.hidden = shown > 0 || soonShown;
      // Each pill shows how many places in its category match the search ("Todos" = all categories)
      filters.forEach((b) => {
        const out = b.querySelector('.directory__filter-count');
        if (!out) return;
        const sec = sections.find((s) => s.cat === b.dataset.filter);
        out.textContent = (sec ? sec.cards : cards).filter((c) => visible.has(c)).length;
      });
    };

    // Pills of categories with no venues yet look dimmed (they still open their "Muy pronto" note)
    filters.forEach((b) => {
      const sec = sections.find((s) => s.cat === b.dataset.filter);
      b.classList.toggle('is-empty', !!sec && !sec.cards.length);
    });

    // On narrow screens the pills scroll sideways: bring the chosen one into view
    const rail = dir.querySelector('.directory__filters');
    const reveal = () => {
      const btn = filters.find((b) => b.dataset.filter === current);
      if (!rail || !btn || rail.scrollWidth <= rail.clientWidth) return;
      const { scrollLeft, clientWidth } = rail;
      if (btn.offsetLeft < scrollLeft || btn.offsetLeft + btn.offsetWidth > scrollLeft + clientWidth) {
        rail.scrollTo({ left: btn.offsetLeft - (clientWidth - btn.offsetWidth) / 2, behavior: 'smooth' });
      }
    };

    const select = (cat, push) => {
      current = cats.has(cat) ? cat : 'todos';
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === current)));
      if (push) history.replaceState(null, '', current === 'todos' ? location.pathname + location.search : `#${current}`);
      update();
      reveal();
    };

    filters.forEach((b) => b.addEventListener('click', () => select(b.dataset.filter, true)));
    window.addEventListener('hashchange', () => {
      const cat = location.hash.slice(1);
      if (cats.has(cat)) select(cat, false);
    });
    input.addEventListener('input', update);
    select(location.hash.slice(1), false);
  });
})();

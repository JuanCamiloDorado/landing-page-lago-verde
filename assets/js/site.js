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
  let stuck = false;
  const onScroll = () => {
    const next = window.scrollY > stickAt();
    if (next !== stuck) { stuck = next; topbar.classList.toggle('is-stuck', stuck); }
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
  // dialog with the full review. Motion pauses on hover/focus, off screen, while the dialog is open
  // and with the "Pausar movimiento" button; reduced motion turns it off.
  document.querySelectorAll('[data-reviews]').forEach((band) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const featured = band.querySelector('[data-featured]');
    const slides = [...featured.querySelectorAll('.featured__slide')];
    const dots = [...featured.querySelectorAll('.featured__dot')];
    const wall = band.querySelector('[data-wall]');
    const rows = [...wall.querySelectorAll('.marquee')];
    const pauseBtn = band.querySelector('[data-pause]');
    const dialog = band.querySelector('.rv-dialog');
    const state = { user: false, visible: false, hover: false, focus: false };

    const sync = () => {
      const still = state.user || !state.visible || dialog.open;
      band.classList.toggle('is-paused', still);
      band.classList.toggle('is-user-paused', state.user);
      featured.classList.toggle('is-paused', still || state.hover || state.focus);
    };
    new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; sync(); }).observe(band);
    pauseBtn.addEventListener('click', () => {
      state.user = !state.user;
      pauseBtn.querySelector('[data-label]').textContent = state.user ? 'Reanudar movimiento' : 'Pausar movimiento';
      sync();
    });

    // Score counts up from 0 the first time it scrolls into view
    const num = band.querySelector('[data-count]');
    const target = parseFloat(num.dataset.count);
    const fmt = (v) => v.toFixed(1).replace('.', ',');
    if (!reduce.matches) {
      num.textContent = fmt(0);
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (document.hidden) { num.textContent = fmt(target); return; }
        const t0 = performance.now() + 250;
        const tick = (t) => {
          const p = Math.min(1, Math.max(0, (t - t0) / 1500));
          num.textContent = fmt(target * (1 - (1 - p) ** 3));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 });
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
    featured.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { state.hover = true; sync(); } });
    featured.addEventListener('pointerleave', () => { state.hover = false; sync(); });
    featured.addEventListener('focusin', () => { state.focus = true; sync(); });
    featured.addEventListener('focusout', (e) => {
      if (!featured.contains(e.relatedTarget)) { state.focus = false; sync(); }
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

  // Demo newsletter form (no network request)
  document.getElementById('nl-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email;
    if (!email.checkValidity()) { email.focus(); email.style.borderBottomColor = '#93372B'; return; }
    e.target.querySelector('.nl-thanks').style.display = 'block';
  });

  // Category pages (comer.html, beber.html, cuidarte.html): live search over the venue cards.
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
})();

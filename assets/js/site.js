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

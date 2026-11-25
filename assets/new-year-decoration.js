(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261125-16', document.currentScript.src);
  const content = 'a, button, input, textarea, select, summary, img, svg, canvas:not(#fx), iframe, video, table, [role="button"], [contenteditable], .container, .wrap, dialog, [role="dialog"]';
  const clearance = 20;
  let timer;
  let frame;
  let decoration;
  let snow;
  let stylesReady = false;

  function updateGutters() {
    frame = undefined;
    if (decoration.hidden) return;
    const {clientWidth: width, clientHeight: height} = decoration;
    let leftmost = width / 2;
    let rightmost = width / 2;

    function accept(box) {
      if (box.width && box.height && box.right > 0 && box.bottom > 0 && box.left < width && box.top < height) {
        leftmost = Math.min(leftmost, box.left);
        rightmost = Math.max(rightmost, box.right);
      }
    }

    for (const element of document.body.querySelectorAll(content)) {
      accept(element.getBoundingClientRect());
    }

    // Include text in plain containers, not just the common text tags.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement.closest('script, style, noscript, template, .new-year-decoration, .new-year-snowflakes') || !node.nodeValue.trim()) continue;
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) accept(box);
    }

    const left = Math.max(0, Math.floor(leftmost - clearance));
    const right = Math.min(width, Math.ceil(rightmost + clearance));
    for (const layer of [decoration, snow]) {
      layer.style.setProperty('--art-left', `${left}px`);
      layer.style.setProperty('--art-right', `${right}px`);
    }
  }

  function requestGutters() {
    if (!decoration.hidden && frame === undefined) {
      frame = requestAnimationFrame(updateGutters);
    }
  }

  function setTheme(active) {
    document.documentElement.classList.toggle('new-year', active);
    const winterImage = document.getElementById('new-year-mascots');
    if (winterImage) winterImage.media = active ? 'all' : 'not all';

    if (active && !decoration) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = stylesheetUrl.href;
      stylesheet.addEventListener('load', () => {
        stylesReady = true;
        updateSeason();
      }, {once: true});
      document.head.append(stylesheet);

      decoration = document.createElement('div');
      decoration.className = 'new-year-decoration';
      decoration.setAttribute('aria-hidden', 'true');
      decoration.inert = true;
      snow = document.createElement('div');
      snow.className = 'new-year-snowflakes';
      snow.setAttribute('aria-hidden', 'true');
      snow.inert = true;
      const flakes = ['❄︎', '❅', '❆'];
      for (let index = 0; index < 36; index++) {
        const flake = document.createElement('span');
        const duration = 18 + index % 9;
        flake.textContent = flakes[index % flakes.length];
        flake.style.setProperty('--x', `${3 + (index * 37) % 95}%`);
        flake.style.setProperty('--size', `${18 + (index * 11) % 19}px`);
        flake.style.setProperty('--duration', `${duration}s`);
        flake.style.setProperty('--delay', `-${(index * 7 + 2) % duration}s`);
        flake.style.setProperty('--drift', `${(index % 2 === 0 ? 1 : -1) * (17 + index % 5 * 8)}px`);
        snow.append(flake);
      }
      decoration.hidden = snow.hidden = true;
      document.body.append(decoration, snow);
      window.addEventListener('scroll', requestGutters, {passive: true, capture: true});
      window.addEventListener('resize', requestGutters, {passive: true});
      document.addEventListener('load', requestGutters, true);
      document.fonts?.ready.then(requestGutters);
      new ResizeObserver(requestGutters).observe(document.body);
      new MutationObserver(requestGutters).observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    if (decoration) decoration.hidden = snow.hidden = !active || !stylesReady;
    if (active && stylesReady) requestGutters();
  }

  function updateSeason() {
    clearTimeout(timer);
    const now = Date.now();
    setTheme(now < endsAt);
    if (now < endsAt) {
      timer = setTimeout(updateSeason, Math.min(endsAt - now, 2_147_483_647));
    }
  }

  updateSeason();
  document.addEventListener('visibilitychange', updateSeason);
  window.addEventListener('pageshow', updateSeason);
})();

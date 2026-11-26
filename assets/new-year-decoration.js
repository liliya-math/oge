(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261126-19', document.currentScript.src);
  const content = 'a, button, input, textarea, select, summary, img, svg, canvas:not(#fx), iframe, video, table, [role="button"], [contenteditable], .container, .wrap, dialog, [role="dialog"]';
  const clearance = 20;
  let timer;
  let frame;
  let decoration;
  let snow;
  let snowGutters;
  let stylesReady = false;

  function updateSnowGutter(gutter, width, height, side) {
    const lanes = width >= 30 ? Math.max(1, Math.floor(width / 48)) : 0;
    const flakesPerLane = Math.max(1, Math.min(14, Math.floor((height + 72) / 66)));
    if (lanes) {
      // Leave room for each flake to turn and drift without reaching its neighbor.
      const maxSize = Math.floor((width / lanes - 12) / Math.SQRT2);
      gutter.style.setProperty('--max-size', `${maxSize}px`);
    }
    const layout = `${lanes}:${flakesPerLane}`;
    if (gutter.dataset.layout === layout) return;
    gutter.dataset.layout = layout;

    const flakes = document.createDocumentFragment();
    const shapes = ['❄︎', '❅', '❆'];
    for (let lane = 0; lane < lanes; lane++) {
      const duration = 20 + (lane * 5 + side * 3) % 9;
      const offset = (lane * 0.618 + side * 0.31) % 1;
      for (let row = 0; row < flakesPerLane; row++) {
        const flake = document.createElement('span');
        const progress = (row + offset) / flakesPerLane;
        flake.textContent = shapes[(lane + row + side) % shapes.length];
        flake.style.setProperty('--x', `${100 * (lane + 0.5) / lanes}%`);
        flake.style.setProperty('--y', `${100 * progress}%`);
        flake.style.setProperty('--size', `${18 + (lane * 7 + row * 5 + side * 3) % 9}px`);
        flake.style.setProperty('--duration', `${duration}s`);
        flake.style.setProperty('--delay', `${-progress * duration}s`);
        flake.style.setProperty('--drift', `${(lane + row + side) % 2 ? -4 : 4}px`);
        flakes.append(flake);
      }
    }
    gutter.replaceChildren(flakes);
  }

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
    updateSnowGutter(snowGutters[0], left, height, 0);
    updateSnowGutter(snowGutters[1], width - right, height, 1);
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
      snowGutters = ['left', 'right'].map(side => {
        const gutter = document.createElement('div');
        gutter.className = `new-year-snow-${side}`;
        snow.append(gutter);
        return gutter;
      });
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

(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261125-12', document.currentScript.src);
  const content = 'a, button, input, textarea, select, summary, img, svg, canvas:not(#fx), iframe, video, table, [role="button"], [contenteditable]';
  const clearance = 20;
  let timer;
  let frame;
  let decoration;

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
      if (node.parentElement.closest('script, style, noscript, template') || !node.nodeValue.trim()) continue;
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) accept(box);
    }

    const left = Math.max(0, Math.floor(leftmost - clearance));
    const right = Math.min(width, Math.ceil(rightmost + clearance));
    decoration.style.setProperty('--art-left', `${left}px`);
    decoration.style.setProperty('--art-right', `${right}px`);
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
      document.head.append(stylesheet);

      decoration = document.createElement('div');
      decoration.className = 'new-year-decoration';
      decoration.setAttribute('aria-hidden', 'true');
      decoration.inert = true;
      document.body.append(decoration);
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

    if (decoration) decoration.hidden = !active;
    if (active) requestGutters();
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

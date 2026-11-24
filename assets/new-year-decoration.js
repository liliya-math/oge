(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261125-6', document.currentScript.src);
  let timer;
  let decoration;
  let lights;
  let placementFrame;
  const garlands = [];
  const locations = [
    [0.27, 0.04, -7],
    [0.91, 0.18, 13],
    [0.10, 0.23, -14],
    [0.88, 0.44, -10],
    [0.11, 0.54, 11],
    [0.92, 0.76, 13],
    [0.08, 0.84, -8],
    [0.49, 0.36, 7],
    [0.56, 0.68, -11],
    [0.36, 0.90, 9]
  ];
  const controls = 'a, button, input, textarea, select, summary, img, svg, canvas, iframe, video, table, [role="button"], [contenteditable]';
  const clearance = 10;

  function visibleContent(width, height) {
    const boxes = [];
    function add(box) {
      if (box.width && box.height && box.right > 0 && box.bottom > 0 && box.left < width && box.top < height) {
        boxes.push(box);
      }
    }

    document.body.querySelectorAll(controls).forEach(element => {
      if (!decoration.contains(element)) add(element.getBoundingClientRect());
    });

    const text = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = text.nextNode(); node; node = text.nextNode()) {
      if (!node.parentElement.closest('script,style,noscript,template') && node.nodeValue.trim()) {
        range.selectNodeContents(node);
        for (const box of range.getClientRects()) add(box);
      }
    }
    return boxes;
  }

  function overlaps(box, other) {
    return box.left < other.right + clearance && box.right > other.left - clearance
      && box.top < other.bottom + clearance && box.bottom > other.top - clearance;
  }

  function arrangeGarlands() {
    placementFrame = undefined;
    if (decoration.hidden) return;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const occupied = visibleContent(width, height);
    const large = Math.min(300, Math.round(width * 0.205));
    const compact = Math.max(105, Math.round(large * 0.72));
    const sizes = width < 700 ? [150, 115] : [large, compact];

    for (const [index, garland] of garlands.entries()) {
      const [x, y, tilt] = locations[index];
      const angle = Math.abs(tilt * Math.PI / 180);
      let placement;
      for (const size of sizes) {
        const artworkHeight = size * 231 / 930;
        const halfWidth = (size * Math.cos(angle) + artworkHeight * Math.sin(angle)) / 2;
        const halfHeight = (size * Math.sin(angle) + artworkHeight * Math.cos(angle)) / 2;
        if (width < 2 * halfWidth + 2 * clearance || height < 2 * halfHeight + 2 * clearance) continue;
        const cx = Math.min(width - halfWidth - clearance, Math.max(halfWidth + clearance, x * width));
        const cy = Math.min(height - halfHeight - clearance, Math.max(halfHeight + clearance, y * height));
        const box = {left: cx - halfWidth, right: cx + halfWidth, top: cy - halfHeight, bottom: cy + halfHeight};
        if (occupied.some(item => overlaps(box, item))) continue;
        placement = {cx, cy, size};
        occupied.push(box);
        break;
      }
      garland.hidden = !placement;
      if (!placement) continue;
      const {cx, cy, size} = placement;
      garland.style.left = `${cx}px`;
      garland.style.top = `${cy}px`;
      garland.style.width = `${size}px`;
      garland.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
    }
  }

  function requestPlacement() {
    if (!decoration.hidden && placementFrame === undefined) {
      placementFrame = requestAnimationFrame(arrangeGarlands);
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
      decoration.style.pointerEvents = 'none';
      lights = document.createElement('div');
      lights.className = 'new-year-light-field';
      lights.setAttribute('aria-hidden', 'true');

      for (let index = 0; index < locations.length; index++) {
        const garland = document.createElement('span');
        garland.className = 'new-year-hanging-garland';
        garland.hidden = true;
        garlands.push(garland);
        decoration.append(garland);
      }

      document.body.append(lights, decoration);
      window.addEventListener('scroll', requestPlacement, {passive: true, capture: true});
      window.addEventListener('resize', requestPlacement);
      document.addEventListener('load', requestPlacement, true);
      document.fonts?.ready.then(requestPlacement);
      new ResizeObserver(requestPlacement).observe(document.body);
      new MutationObserver(requestPlacement).observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    if (decoration) decoration.hidden = !active;
    if (lights) lights.hidden = !active;
    if (active) requestPlacement();
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

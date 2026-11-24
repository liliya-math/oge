(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261125-8', document.currentScript.src);
  let timer;
  let decoration;
  let lights;
  let placementFrame;
  const garlands = [];
  const locations = [
    [0.92, 0.47, 79, 'right'],
    [0.08, 0.46, -81, 'left'],
    [0.34, 0.055, -2, 'top'],
    [0.90, 0.89, -22, 'right'],
    [0.10, 0.90, 19, 'left'],
    [0.88, 0.19, 12, 'right'],
    [0.12, 0.19, -12, 'left']
  ];
  // Tie points in the transparent paper-chain artwork.
  const tiePoints = [[0.025, 0.20], [0.97, 0.19]];
  const controls = 'a, button, input, textarea, select, summary, img, svg, canvas:not(#fx), iframe, video, table, [role="button"], [contenteditable]';
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

  function getSupports(cx, cy, size, artworkHeight, angle, edge, width) {
    return tiePoints.map(([x, y]) => {
      const dx = (x - 0.5) * size;
      const dy = (y - 0.5) * artworkHeight;
      const tieX = cx + dx * Math.cos(angle) - dy * Math.sin(angle);
      const tieY = cy + dx * Math.sin(angle) + dy * Math.cos(angle);
      const pinX = edge === 'top' ? tieX : edge === 'left' ? 6 : width - 6;
      const pinY = edge === 'top' ? 6 : Math.max(6, tieY - Math.min(28, Math.abs(tieX - pinX) * 0.28));
      return {
        pinX, pinY, tieX, tieY,
        box: {
          left: Math.min(pinX, tieX) - 3,
          right: Math.max(pinX, tieX) + 3,
          top: Math.min(pinY, tieY) - 3,
          bottom: Math.max(pinY, tieY) + 3
        }
      };
    });
  }

  function placeSupport({cord, pin}, {pinX, pinY, tieX, tieY}) {
    const dx = tieX - pinX;
    const dy = tieY - pinY;
    pin.style.left = cord.style.left = `${pinX}px`;
    pin.style.top = cord.style.top = `${pinY}px`;
    cord.style.width = `${Math.hypot(dx, dy)}px`;
    cord.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  }

  function arrangeGarlands() {
    placementFrame = undefined;
    if (decoration.hidden) return;
    const width = decoration.clientWidth;
    const height = decoration.clientHeight;
    const occupied = visibleContent(width, height);
    const large = Math.min(710, Math.round(width * 0.46));
    const sizes = width < 700
      ? [Math.min(260, Math.round(width * 0.62)), 165]
      : [large, Math.round(large * 0.80), Math.round(large * 0.64), Math.round(large * 0.52), Math.round(large * 0.47)];

    for (const [index, {group, garland, supports}] of garlands.entries()) {
      const [x, y, tilt, edge] = locations[index];
      const tiltRadians = tilt * Math.PI / 180;
      const angle = Math.abs(tiltRadians);
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
        const cords = getSupports(cx, cy, size, artworkHeight, tiltRadians, edge, width);
        if (cords.some(({box: line}) => occupied.some(item => overlaps(line, item)))) continue;
        placement = {cx, cy, size, cords};
        occupied.push(box, ...cords.map(({box: line}) => line));
        break;
      }
      group.hidden = !placement;
      if (!placement) continue;
      const {cx, cy, size, cords} = placement;
      supports.forEach((support, side) => placeSupport(support, cords[side]));
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
        const group = document.createElement('div');
        group.className = 'new-year-garland-group';
        group.hidden = true;
        const supports = tiePoints.map(() => {
          const cord = document.createElement('span');
          cord.className = 'new-year-garland-cord';
          const pin = document.createElement('span');
          pin.className = 'new-year-garland-pin';
          group.append(cord, pin);
          return {cord, pin};
        });
        const garland = document.createElement('span');
        garland.className = 'new-year-hanging-garland';
        group.append(garland);
        garlands.push({group, garland, supports});
        decoration.append(group);
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

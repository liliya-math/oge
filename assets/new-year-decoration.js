(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261126-23', document.currentScript.src);
  const musicUrl = new URL('new-year-music.mp3', document.currentScript.src);
  const musicPreference = 'lilimath-holiday-music';
  const controls = 'button, input, textarea, select, summary, [role="button"], [contenteditable]';
  const diagrams = 'svg:not(.new-year-snow-mask), math, mjx-container, canvas:not(#fx), iframe, video';
  const snowProtected = `${controls}, ${diagrams}`;
  const backgroundContent = `a, img, table, .container, .wrap, dialog, [role="dialog"], ${snowProtected}`;
  const clearance = 20;
  let timer;
  let frame;
  let decoration;
  let snow;
  let snowMask;
  let visibleArea;
  let protectedAreas;
  let music;
  let musicButton;
  let stylesReady = false;

  function playMusic() {
    music.play().catch(() => musicButton.setAttribute('aria-pressed', 'false'));
  }

  function addMusicControl() {
    music = document.createElement('audio');
    music.id = 'new-year-music';
    music.src = musicUrl.href;
    music.preload = 'none';
    music.loop = true;
    music.hidden = true;
    musicButton = document.createElement('button');
    musicButton.type = 'button';
    musicButton.className = 'new-year-music-toggle';
    musicButton.textContent = 'Музыка';
    musicButton.setAttribute('aria-label', 'Фоновая музыка');
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.hidden = true;
    for (const event of ['playing', 'pause', 'error']) {
      music.addEventListener(event, () => {
        musicButton.setAttribute('aria-pressed', String(event === 'playing'));
      });
    }
    musicButton.addEventListener('click', () => {
      const enable = music.paused;
      try { sessionStorage.setItem(musicPreference, String(enable)); } catch {}
      if (enable) playMusic();
      else music.pause();
    });
    document.body.append(music, musicButton);
  }

  function createSnowMask() {
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('class', 'new-year-snow-mask');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    snowMask = document.createElementNS(namespace, 'mask');
    snowMask.setAttribute('id', 'new-year-snow-mask');
    snowMask.setAttribute('maskUnits', 'userSpaceOnUse');
    snowMask.setAttribute('x', '0');
    snowMask.setAttribute('y', '0');
    visibleArea = document.createElementNS(namespace, 'rect');
    visibleArea.setAttribute('fill', 'white');
    protectedAreas = document.createElementNS(namespace, 'path');
    protectedAreas.setAttribute('fill', 'black');
    snowMask.append(visibleArea, protectedAreas);
    svg.append(snowMask);
    return svg;
  }

  function updateSnow(width, height) {
    const fallDistance = height + 20;
    if (Number(snowMask.getAttribute('width')) !== width ||
        Number(snowMask.getAttribute('height')) !== height) {
      for (const shape of [snowMask, visibleArea]) {
        shape.setAttribute('width', width);
        shape.setAttribute('height', height);
      }
      snow.style.setProperty('--fall-distance', `${fallDistance}px`);
    }
    const lanes = Math.max(1, Math.min(14, Math.floor(width / 115)));
    const flakesPerLane = Math.max(1, Math.min(8, Math.floor(fallDistance / 145)));
    const layout = `${lanes}:${flakesPerLane}`;
    if (snow.dataset.layout === layout) return;
    snow.dataset.layout = layout;

    const flakes = document.createDocumentFragment();
    for (let lane = 0; lane < lanes; lane++) {
      const duration = fallDistance / (8 + Math.random() * 5);
      const phase = Math.random();
      for (let row = 0; row < flakesPerLane; row++) {
        const flake = document.createElement('span');
        // Vary the spacing without letting two flakes in one lane catch up.
        const stagger = 0.72 * (Math.random() - 0.5);
        const progress = (phase + (row + 0.5 + stagger) / flakesPerLane) % 1;
        const horizontalOffset = 0.8 * (Math.random() - 0.5);
        flake.style.setProperty('--x', `${100 * (lane + 0.5 + horizontalOffset) / lanes}%`);
        flake.style.setProperty('--y', `${100 * progress}%`);
        flake.style.setProperty('--size', `${2.4 + 5 * Math.random() ** 1.8}px`);
        flake.style.setProperty('--flake-opacity', 0.26 + Math.random() * 0.36);
        flake.style.setProperty('--duration', `${duration}s`);
        flake.style.setProperty('--delay', `${-progress * duration}s`);
        flake.style.setProperty('--drift', `${(Math.random() - 0.5) * 18}px`);
        flakes.append(flake);
      }
    }
    snow.replaceChildren(flakes);
  }

  function updateCoverage() {
    frame = undefined;
    if (decoration.hidden) return;
    const {clientWidth: width, clientHeight: height} = decoration;
    let leftmost = width / 2;
    let rightmost = width / 2;

    const holes = [];
    function accept(box, protectFromSnow) {
      if (!box.width || !box.height || box.right <= 0 || box.bottom <= 0 ||
          box.left >= width || box.top >= height) return;
      leftmost = Math.min(leftmost, box.left);
      rightmost = Math.max(rightmost, box.right);
      if (!protectFromSnow) return;
      const left = Math.max(0, Math.floor(box.left - 10));
      const right = Math.min(width, Math.ceil(box.right + 10));
      const top = Math.max(0, Math.floor(box.top - 7));
      const bottom = Math.min(height, Math.ceil(box.bottom + 7));
      holes.push(`M${left} ${top}H${right}V${bottom}H${left}Z`);
    }

    for (const element of document.body.querySelectorAll(backgroundContent)) {
      accept(element.getBoundingClientRect(), element.matches(snowProtected));
    }

    // Include text in plain containers, not just the common text tags.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement.closest('script, style, noscript, template, .new-year-decoration, .new-year-snowflakes') || !node.nodeValue.trim()) continue;
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) accept(box, true);
    }

    const left = Math.max(0, Math.floor(leftmost - clearance));
    const right = Math.min(width, Math.ceil(rightmost + clearance));
    decoration.style.setProperty('--art-left', `${left}px`);
    decoration.style.setProperty('--art-right', `${right}px`);
    const path = holes.join('');
    if (protectedAreas.getAttribute('d') !== path) protectedAreas.setAttribute('d', path);
    updateSnow(width, height);
  }

  function requestCoverage() {
    if (!decoration.hidden && frame === undefined) {
      frame = requestAnimationFrame(updateCoverage);
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
      decoration.hidden = snow.hidden = true;
      document.body.append(decoration, snow, createSnowMask());
      if (window.top === window) addMusicControl();
      window.addEventListener('scroll', requestCoverage, {passive: true, capture: true});
      window.addEventListener('resize', requestCoverage, {passive: true});
      document.addEventListener('load', requestCoverage, true);
      document.fonts?.ready.then(requestCoverage);
      new ResizeObserver(requestCoverage).observe(document.body);
      new MutationObserver(requestCoverage).observe(document.body, {
        attributeFilter: ['class', 'hidden', 'open', 'aria-hidden'],
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    if (decoration) decoration.hidden = snow.hidden = !active || !stylesReady;
    if (musicButton) {
      const showMusic = active && stylesReady;
      const wasHidden = musicButton.hidden;
      musicButton.hidden = !showMusic;
      if (!showMusic) music.pause();
      else if (wasHidden) {
        let enabled;
        try { enabled = sessionStorage.getItem(musicPreference) === 'true'; } catch {}
        if (enabled) playMusic();
      }
    }
    if (active && stylesReady) requestCoverage();
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

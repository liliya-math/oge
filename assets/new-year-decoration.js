(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261127-playlist', document.currentScript.src);
  const assetBase = document.currentScript.src;
  // Note attacks measured from this recording, in hundredths of a second.
  const noteAttacks = [
    116, 169, 230, 283, 343, 397, 510, 625, 850, 1095, 1175, 1229, 1283, 1338, 1391,
    1500, 1605, 1659, 1712, 1766, 1928, 1982, 2036, 2141, 2249, 2302, 2355,
    2463, 2516, 2566, 2623, 2732, 2786, 2842, 2895, 2952, 3008, 3064, 3118,
    3175, 3231, 3283, 3334, 3386, 3439, 3492, 3651, 3702, 3758, 3861, 3920,
    3972, 4081, 4135, 4190, 4245, 4298, 4352, 4408, 4598, 4846, 4898, 5057,
    5106, 5191, 5258, 5443, 5689, 5741, 5796, 5851, 5905, 5958, 6068, 6124,
    6334, 6543, 6754, 6859, 7105, 7229, 7310, 7365, 7504, 7600, 7649, 7723,
    7788, 7824, 7870, 7941, 8007, 8076, 8142, 8233, 8322, 8384, 8442, 8504,
    8562, 8651, 8741, 8799, 8858, 8917, 9003, 9088, 9145, 9203, 9260, 9317,
    9373, 9431, 9487, 9542, 9598, 9654, 9711, 9766, 9823, 9878, 9989, 10045,
    10099, 10183, 10267, 10322, 10406, 10488, 10545, 10601, 10656, 10712, 10768, 10932,
    10988, 11045, 11154, 11211, 11267, 11378, 11435, 11489, 11546, 11600, 11656, 11710,
  ];
  const tracks = {
    tchaikovsky: {title: 'Танец феи Драже', file: 'new-year-music.mp3?v=20261126-35', attacks: noteAttacks},
    waltz: {title: 'Зимний вальс', file: 'new-year-winter-waltz.mp3', attacks: [0, 65, 130, 196, 261, 326, 391, 457, 522, 587, 652, 717, 783, 848, 913, 978, 1043, 1109, 1174, 1239, 1304, 1370, 1435, 1500, 1565, 1630, 1696, 1761, 1826, 1891, 1957, 2022, 2087, 2152, 2217, 2283, 2348, 2413, 2478, 2543, 2609, 2674, 2739, 2804, 2870, 2935]},
    bells: {title: 'Снежные колокольчики', file: 'new-year-snow-bells.mp3', attacks: [0, 54, 107, 161, 214, 268, 321, 375, 429, 482, 536, 589, 643, 696, 750, 804, 857, 911, 964, 1018, 1071, 1125, 1179, 1232, 1286, 1339, 1393, 1446, 1500, 1554, 1607, 1661, 1714, 1768, 1821, 1875, 1929, 1982, 2036, 2089, 2143, 2196, 2250, 2304, 2357, 2411, 2464, 2518, 2571, 2625, 2679, 2732, 2786, 2839, 2893, 2946, 3000, 3054, 3107, 3161, 3214]},
    jingle: {
      title: 'Jingle Bells (Calm)',
      file: 'new-year-jingle-bells-calm.mp3',
      attacks: [
        68, 124, 179, 230, 290, 449, 508, 559, 615, 666, 722, 942, 999, 1025, 1055,
        1110, 1172, 1305, 1383, 1439, 1492, 1518, 1545, 1599, 1835, 1948, 2057, 2167, 2273, 2382,
        2493, 2606, 2728, 2760, 2794, 2832, 2939, 3050, 3162, 3299, 3395, 3688, 3903, 4009, 4123,
        4165, 4223, 4329, 4436, 4486, 4542, 4595, 4645, 4679, 4705, 4733, 4759, 4785, 4812, 4868,
        4931, 4959, 4989, 5036, 5095, 5150, 5206, 5320, 5438, 5483, 5550, 5592, 5658, 5771, 5875,
        5908, 5987, 6070, 6211, 6267, 6322, 6350, 6381, 6431, 6464, 6515, 6548, 6595, 6649, 6711,
        6830, 6917, 7008, 7122, 7254, 7307, 7401, 7447, 7489, 7578, 7621, 7653, 7699, 7834, 7921,
        7956, 8037, 8240, 8308, 8351, 8393, 8474, 8519, 8653, 8692, 8772, 8821, 8861, 8997, 9037,
        9162, 9207, 9292, 9338, 9382, 9424, 9465, 9510, 9555, 9598, 9629, 9669, 9734, 9766, 9945,
        10062, 10106, 10156, 10199, 10251, 10298, 10345, 10439, 10466, 10534, 10599, 10629, 10726, 10776, 10827,
        10861, 10919, 10946, 11011, 11055, 11100, 11144, 11189, 11230, 11266, 11320, 11356, 11430, 11465, 11559,
        11596, 11654, 11745, 11797, 11847, 11944, 11995, 12047, 12115, 12142, 12247, 12291, 12333, 12396, 12444,
        12469, 12495, 12547, 12594, 12643, 12697, 12752, 12806, 12869, 12923, 12980, 13005, 13102, 13164, 13230,
        13283, 13456,
      ],
    },
  };
  const trackPreference = 'lilimath-holiday-track';
  let currentTrack = tracks.tchaikovsky;
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
  let musicControls;
  let garland;
  let garlandFrame;
  let stylesReady = false;

  function playMusic() {
    music.play().catch(() => setMusicPlaying(false));
  }

  function setMusicPlaying(playing) {
    musicButton.textContent = playing ? 'Выключить музыку' : 'Включить музыку';
    musicButton.dataset.playing = String(playing);
    if (playing && garlandFrame === undefined) {
      garlandFrame = requestAnimationFrame(updateGarland);
    } else if (!playing && garlandFrame !== undefined) {
      cancelAnimationFrame(garlandFrame);
      garlandFrame = undefined;
      garland.style.removeProperty('--garland-flash');
    }
  }

  function updateGarland() {
    // Use the audio clock so pauses, seeking and replay stay in sync.
    const now = music.currentTime * 100;
    let low = 0;
    const attacks = currentTrack.attacks;
    let high = attacks.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (attacks[middle] <= now) low = middle + 1;
      else high = middle;
    }
    const elapsed = (now - (attacks[low - 1] ?? -Infinity)) / 100;
    const rise = Math.min(1, elapsed / .035);
    const fade = Math.max(0, 1 - Math.max(0, elapsed - .105) / .25);
    garland.style.setProperty('--garland-flash', (rise * fade).toFixed(3));
    garlandFrame = requestAnimationFrame(updateGarland);
  }

  function addMusicControl() {
    music = document.createElement('audio');
    music.id = 'new-year-music';
    const select = document.createElement('select');
    select.className = 'new-year-track';
    select.setAttribute('aria-label', 'Новогодняя мелодия');
    for (const [id, track] of Object.entries(tracks)) select.add(new Option(track.title, id));
    try {
      const saved = sessionStorage.getItem(trackPreference);
      if (Object.hasOwn(tracks, saved)) select.value = saved;
    } catch {}
    currentTrack = tracks[select.value];
    music.src = new URL(currentTrack.file, assetBase).href;
    music.preload = 'none';
    music.loop = true;
    music.volume = .6;
    music.hidden = true;
    musicButton = document.createElement('button');
    musicButton.type = 'button';
    musicButton.className = 'new-year-music-toggle';
    setMusicPlaying(false);

    for (const event of ['playing', 'waiting', 'pause', 'error']) {
      music.addEventListener(event, () => {
        setMusicPlaying(event === 'playing');
      });
    }
    musicButton.addEventListener('click', () => {
      const enable = music.paused;
      try { sessionStorage.setItem(musicPreference, String(enable)); } catch {}
      if (enable) playMusic();
      else music.pause();
    });
    select.addEventListener('change', () => {
      const resume = !music.paused;
      music.pause();
      setMusicPlaying(false);
      currentTrack = tracks[select.value];
      music.src = new URL(currentTrack.file, assetBase).href;
      try { sessionStorage.setItem(trackPreference, select.value); } catch {}
      if (resume) playMusic();
    });
    const credit = document.createElement('details');
    credit.className = 'new-year-music-credit';
    const creditLabel = document.createElement('summary');
    creditLabel.textContent = 'О музыке';
    const creditText = document.createElement('p');
    const source = document.createElement('a');
    source.href = 'https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1100625';
    source.textContent = 'Кевин Маклауд (Incompetech)';
    const jingleSource = document.createElement('a');
    jingleSource.href = 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100188';
    jingleSource.textContent = 'Кевин Маклауд (Incompetech)';
    const license = document.createElement('a');
    license.href = 'https://creativecommons.org/licenses/by/4.0/';
    license.textContent = 'CC BY 4.0';
    for (const link of [source, jingleSource, license]) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    creditText.append('П. И. Чайковский, «Танец феи Драже». Аранжировка и запись: ',
      source, '. Лицензия ', license, '. «Зимний вальс» и «Снежные колокольчики» — оригинальные инструментальные мелодии для сайта.');
    creditText.append(document.createElement('br'), document.createElement('br'),
      '«Jingle Bells (Calm)». Аранжировка и запись: ', jingleSource,
      '. Лицензия ', license.cloneNode(true), '. MP3 перекодирован для сайта.');
    credit.append(creditLabel, creditText);
    musicControls = document.createElement('div');
    musicControls.className = 'new-year-music-controls';
    musicControls.hidden = true;
    musicControls.append(musicButton, select, credit);
    document.body.append(music, musicControls);
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
    const fallDistance = height + 38;
    if (Number(snowMask.getAttribute('width')) !== width ||
        Number(snowMask.getAttribute('height')) !== height) {
      for (const shape of [snowMask, visibleArea]) {
        shape.setAttribute('width', width);
        shape.setAttribute('height', height);
      }
      snow.style.setProperty('--fall-distance', `${fallDistance}px`);
    }
    const lanes = Math.max(1, Math.min(14, Math.floor(width / 138)));
    const flakesPerLane = Math.max(1, Math.min(8, Math.floor(fallDistance / 172)));
    const baseFlakes = lanes * flakesPerLane;
    const extraFlakes = baseFlakes >= 8 ? Math.max(1, Math.round(baseFlakes / 18)) : 0;
    const layout = `${lanes}:${flakesPerLane}`;
    if (snow.dataset.layout === layout) return;
    snow.dataset.layout = layout;

    const flakes = document.createDocumentFragment();
    for (let lane = 0; lane < lanes; lane++) {
      const phase = Math.random();
      const extraInLane = Math.round((lane + 1) * extraFlakes / lanes)
        - Math.round(lane * extraFlakes / lanes);
      const laneFlakes = flakesPerLane + extraInLane;
      for (let row = 0; row < laneFlakes; row++) {
        const flake = document.createElement('span');
        const stagger = 0.72 * (Math.random() - 0.5);
        const progress = (phase + (row + 0.5 + stagger) / laneFlakes) % 1;
        const horizontalOffset = 0.8 * (Math.random() - 0.5);
        const depth = Math.random() ** 1.5;
        const duration = fallDistance / (9 + depth * 23 + Math.random() * 6);
        const shimmerDuration = 3 + Math.random() * 5;
        flake.style.setProperty('--x', `${100 * (lane + 0.5 + horizontalOffset) / lanes}%`);
        flake.style.setProperty('--y', `${100 * progress}%`);
        flake.style.setProperty('--size', `${14 + depth * 20}px`);
        flake.style.setProperty('--flake-opacity', 0.65 + depth * 0.29);
        flake.style.setProperty('--turn', `${Math.round(Math.random() * 60)}deg`);
        flake.style.setProperty('--duration', `${duration}s`);
        flake.style.setProperty('--delay', `${-progress * duration}s`);
        flake.style.setProperty('--drift', `${(Math.random() - 0.5) * (22 + depth * 36)}px`);
        flake.style.setProperty('--shimmer-duration', `${shimmerDuration}s`);
        flake.style.setProperty('--shimmer-delay', `${-Math.random() * shimmerDuration}s`);
        flakes.append(flake);
      }
    }
    snow.replaceChildren(flakes);
  }

  function updateCoverage() {
    frame = undefined;
    if (decoration.hidden) return;
    const {clientWidth: width, clientHeight: height} = decoration;
    const backdropPanel = document.querySelector('[data-new-year-panel]')?.getBoundingClientRect();
    let leftmost = backdropPanel?.left ?? width / 2;
    let rightmost = backdropPanel?.right ?? width / 2;

    const holes = [];
    function accept(box, protectFromSnow, affectsBackdrop = true) {
      if (!box.width || !box.height || box.right <= 0 || box.bottom <= 0 ||
          box.left >= width || box.top >= height) return;
      if (!backdropPanel && affectsBackdrop) {
        leftmost = Math.min(leftmost, box.left);
        rightmost = Math.max(rightmost, box.right);
      }
      if (!protectFromSnow) return;
      const left = Math.max(0, Math.floor(box.left - 10));
      const right = Math.min(width, Math.ceil(box.right + 10));
      const top = Math.max(0, Math.floor(box.top - 7));
      const bottom = Math.min(height, Math.ceil(box.bottom + 7));
      holes.push(`M${left} ${top}H${right}V${bottom}H${left}Z`);
    }

    for (const element of document.body.querySelectorAll(backgroundContent)) {
      accept(element.getBoundingClientRect(), element.matches(snowProtected), !musicControls?.contains(element));
    }

    // Include text in plain containers, not just the common text tags.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement.closest('script, style, noscript, template, .new-year-decoration, .new-year-snowflakes') || !node.nodeValue.trim()) continue;
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) accept(box, true, !musicControls?.contains(node.parentElement));
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
    if (winterImage) {
      winterImage.media = active ? 'all' : 'not all';
      const fallbackImage = winterImage.parentElement.querySelector('img');
      if (fallbackImage && winterImage.dataset.alt) {
        const defaultAlt = fallbackImage.dataset.defaultAlt ?? fallbackImage.alt;
        fallbackImage.dataset.defaultAlt = defaultAlt;
        fallbackImage.alt = active ? winterImage.dataset.alt : defaultAlt;
      }
    }

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
      garland = document.createElement('div');
      garland.className = 'new-year-garland';
      garland.setAttribute('aria-hidden', 'true');
      garland.inert = true;
      snow = document.createElement('div');
      snow.className = 'new-year-snowflakes';
      snow.setAttribute('aria-hidden', 'true');
      snow.inert = true;
      decoration.hidden = garland.hidden = snow.hidden = true;
      document.body.append(decoration, garland, snow, createSnowMask());
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

    if (decoration) decoration.hidden = garland.hidden = snow.hidden = !active || !stylesReady;
    if (musicControls) {
      const showMusic = active && stylesReady;
      const wasHidden = musicControls.hidden;
      musicControls.hidden = !showMusic;
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

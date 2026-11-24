(() => {
  // Новогодний сезон 2026–2027, время Самары (UTC+4).
  const endsAt = Date.parse('2027-01-11T00:00:00+04:00');
  const stylesheetUrl = new URL('new-year-decoration.css?v=20261125-4', document.currentScript.src);
  const garlandUrl = new URL('../img/brand/new-year-paper-garland.webp', document.currentScript.src);
  let timer;
  let decoration;
  let banner;

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
      const lights = document.createElement('div');
      lights.className = 'new-year-garland';

      const isCabinet = location.pathname.endsWith('/kabinet.html');
      if (winterImage || isCabinet) {
        banner = document.createElement('div');
        banner.className = isCabinet ? 'new-year-site-banner new-year-cabinet-banner' : 'new-year-site-banner';
        banner.setAttribute('aria-hidden', 'true');
        const swag = document.createElement('img');
        swag.src = garlandUrl.href;
        swag.alt = '';
        swag.width = 1320;
        swag.height = 344;
        banner.append(swag);
        document.body.prepend(banner);
      } else {
        decoration.append(lights);
      }
      document.body.append(decoration);
    }

    if (decoration) decoration.hidden = !active;
    if (banner) banner.hidden = !active;
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

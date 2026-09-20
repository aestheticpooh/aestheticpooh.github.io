/* A small layered world: one shared animation loop, springy toys, and real image assets. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('#motion-toggle');
  const status = document.querySelector('#world-status');
  const bubble = document.querySelector('.toy-bubble');
  const shower = document.querySelector('.money-shower');
  const layers = [...document.querySelectorAll('.scene-layer')];
  const clouds = document.querySelector('.clouds-moving');
  const reflection = document.querySelector('.water-reflection');
  const ripples = document.querySelector('.water-ripples');
  const pillar = document.querySelector('.pillar-occluder');
  const billSources = ['assets/dollar-bill.webp'];
  const toys = [...document.querySelectorAll('.toy')].map((el, i) => ({
    el, inner: el.querySelector('.toy-motion'), phase: i * 1.77,
    depth: Number(el.dataset.depth), x: 0, y: 0, vx: 0, vy: 0,
    motion: el.dataset.motion || 'floating',
    angle: 0, angularVelocity: 0, cx: 0, cy: 0, size: 0,
  }));
  let paused = reduced.matches;
  let visible = true;
  let frame = 0;
  let last = 0;
  let clock = 0;
  let sceneX = 0;
  let sceneY = 0;
  let rect = hero.getBoundingClientRect();
  let bubbleTimer;
  let lastRain = 0;
  const pointer = { x: 0, y: 0, active: false };
  const liveBills = new Set();
  const visibleLanes = new Set();
  let walker = null;
  let walkerTimer = 0;
  function measure() {
    rect = hero.getBoundingClientRect();
    // Project the marble image's coordinates into the same cover crop as the
    // scenery. Seated bears stay on their steps as the viewport changes.
    const desktop = rect.width > 760;
    const layerWidth = rect.width * 1.03;
    const layerHeight = rect.height * 1.03;
    const scale = Math.max(layerWidth / 1536, layerHeight / 1024);
    const imageX = (layerWidth - 1536 * scale) / 2;
    const imageY = (layerHeight - 1024 * scale) / 2;
    const originX = imageX - rect.width * .015;
    const originY = imageY - rect.height * .015;
    if (pillar && desktop) {
      const edge = imageX + 548 * scale;
      const top = imageY + 112 * scale;
      const bottom = imageY + 395 * scale;
      pillar.style.clipPath = `polygon(0 ${top}px,${edge}px ${top}px,${edge}px ${bottom}px,0 ${bottom}px)`;
    }
    toys.forEach(t => {
      if (t.el.dataset.sceneX) {
        if (desktop) {
          const tablet = rect.width <= 1150;
          const width = Number(tablet && t.el.dataset.tabletWidth || t.el.dataset.sceneWidth) * scale;
          const baseline = Number(tablet && t.el.dataset.tabletY || t.el.dataset.sceneY);
          const height = width / Number(t.el.dataset.aspect || 1);
          t.el.style.width = `${width}px`;
          t.el.style.left = `${originX + Number(t.el.dataset.sceneX) * scale - width / 2}px`;
          t.el.style.top = `${originY + baseline * scale - height}px`;
        } else {
          ['width', 'left', 'top'].forEach(p => t.el.style.removeProperty(p));
        }
      }
      const r = t.el.getBoundingClientRect();
      t.cx = r.left - rect.left + r.width / 2;
      t.cy = r.top - rect.top + r.height / 2;
      t.size = r.width;
    });
  }
  new ResizeObserver(measure).observe(hero);
  document.fonts.ready.then(measure);
  hero.addEventListener('pointermove', e => {
    if (!finePointer.matches || e.pointerType === 'touch') return;
    rect = hero.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });

  function tick(now) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    const dt = Math.min((now - (last || now)) / 16.667, 2);
    last = now;
    clock += dt / 60;
    // Drive SVG scenery with the same clock as the toys so pausing is exact.
    clouds.style.transform = `translateX(${(Math.sin(clock * .06) * 45).toFixed(2)}px)`;
    reflection.style.transform = `translate(${(Math.sin(clock * .7) * 2).toFixed(2)}px,${(Math.cos(clock * .55) * 1.5).toFixed(2)}px) scale(1.003,${(1.01 + Math.sin(clock * .45) * .004).toFixed(4)})`;
    ripples.style.transform = `translate(${(Math.sin(clock * .4) * 15).toFixed(2)}px,${(Math.sin(clock * .6) * 4).toFixed(2)}px)`;
    ripples.style.opacity = (.22 + Math.sin(clock * .8) * .1).toFixed(3);
    const targetX = pointer.active ? (pointer.x / rect.width - .5) * 2 : 0;
    const targetY = pointer.active ? (pointer.y / rect.height - .5) * 2 : 0;
    sceneX += (targetX - sceneX) * .045 * dt;
    sceneY += (targetY - sceneY) * .045 * dt;
    layers.forEach(layer => {
      const d = Number(layer.dataset.depth);
      layer.style.transform = `translate3d(${-sceneX * 12 * d}px,${-sceneY * 8 * d}px,0)`;
    });
    toys.forEach(t => {
      let tx = 0;
      let ty = 0;
      if (pointer.active) {
        const dx = t.cx - pointer.x;
        const dy = t.cy - pointer.y;
        const distance = Math.hypot(dx, dy);
        const radius = t.size * .5 + 62;
        if (distance < radius) {
          const force = (1 - distance / radius) * 16;
          tx = dx / Math.max(distance, 1) * force;
          ty = dy / Math.max(distance, 1) * force;
        }
      }
      t.vx = (t.vx + (tx - t.x) * .042 * dt) * Math.pow(.84, dt);
      t.vy = (t.vy + (ty - t.y) * .042 * dt) * Math.pow(.84, dt);
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.angularVelocity = (t.angularVelocity - t.angle * .046 * dt) * Math.pow(.86, dt);
      t.angle += t.angularVelocity * dt;
      const resting = t.motion === 'seated' || t.motion === 'resting';
      const amplitude = resting ? .3 : t.motion === 'peek' ? 1.2 : t.motion === 'foreground' ? 1.7 : 6;
      const bob = Math.sin(clock * .95 + t.phase) * amplitude;
      const sway = Math.sin(clock * .55 + t.phase) * (resting ? .16 : t.motion === 'foreground' ? .45 : 1.2);
      const peek = t.motion === 'peek' ? Math.sin(clock * .32 + t.phase) * 7 : 0;
      const x = t.x + peek - sceneX * 16 * t.depth;
      const y = t.y + bob - sceneY * 11 * t.depth;
      t.inner.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(calc(var(--rotation) + ${(t.angle + sway).toFixed(2)}deg))`;
      t.el.style.setProperty('--shadow-x', `${(x * .35).toFixed(1)}px`);
      t.el.style.setProperty('--shadow-scale', (1 - Math.max(-.1, Math.min(.18, y * -.006))).toFixed(3));
    });
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (frame || paused || !visible || document.hidden) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }
  function syncAmbientAnimations() {
    // Explicitly sync the browser's animation timelines as well as CSS state.
    // Ambient light and the atmosphere below the hero share the global control.
    document.getAnimations().forEach(animation => {
      if (!(animation instanceof CSSAnimation)) return;
      const target = animation.effect?.target;
      if (!target?.closest('.world,.toys,.page-atmosphere,.contact-pool,.tiny-walker')) return;
      const shouldPause = paused || document.hidden || (!!target.closest('.hero') && !visible);
      if (shouldPause) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
  }
  function applyMotion() {
    hero.classList.toggle('is-paused', paused);
    document.body.classList.toggle('is-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume scene animation' : 'Pause scene animation');
    motionButton.querySelector('.motion-label').textContent = paused ? 'Resume motion' : 'Pause motion';
    syncMoney();
    syncWalkers();
    syncAmbientAnimations();
    if (paused) { stopSpraying(); stop(); } else start();
  }
  motionButton.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reduced.addEventListener('change', e => { paused = e.matches; applyMotion(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    hero.classList.toggle('is-offscreen', !visible);
    document.body.classList.toggle('reading', !visible);
    syncAmbientAnimations();
    syncMoney();
    if (visible) { measure(); start(); } else { pointer.active = false; stop(); }
  }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('is-hidden', document.hidden);
    if (document.hidden) { stopSpraying(); stop(); } else start();
    syncWalkers();
    syncAmbientAnimations();
    syncMoney();
  });

  // Money is created only by the visitor: load the sprayer, then aim and click.
  let sprayerReady = false;
  let sprayTimer = 0;
  let sprayStarted = 0;
  let lastSpray = -Infinity;
  let sprayPoint = null;
  const maxBills = 90;

  function syncMoney() {
    liveBills.forEach(b => {
      if (document.hidden || (paused && !b.fadeOnly)) b.animation.pause();
      else b.animation.play();
    });
  }
  function createBill(width, kind = '') {
    const el = document.createElement('span');
    el.className = `falling-bill ${kind}`.trim();
    el.style.width = `${width}px`;
    const img = new Image();
    img.src = billSources[0];
    img.alt = '';
    img.draggable = false;
    el.append(img);
    shower.append(el);
    return el;
  }
  function animateBill(el, frames, timing, fadeOnly = false) {
    const animation = el.animate(frames, timing);
    const entry = { el, animation, fadeOnly };
    liveBills.add(entry);
    const cleanup = () => { el.remove(); liveBills.delete(entry); };
    animation.finished.then(cleanup).catch(cleanup);
  }
  function say(t, message) {
    rect = hero.getBoundingClientRect();
    const r = t.el.getBoundingClientRect();
    bubble.textContent = message;
    bubble.style.left = `${Math.min(rect.width - 75, Math.max(75, r.left - rect.left + r.width / 2))}px`;
    bubble.style.top = `${Math.max(60, r.top - rect.top + 10)}px`;
    bubble.classList.add('visible');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('visible'), 1300);
  }
  function nearestToy(x, y) {
    let closest = null;
    let distance = 420;
    toys.forEach(t => {
      if (!t.el.offsetWidth || t.el.hidden) return;
      const r = t.el.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      if (d < distance) { closest = t; distance = d; }
    });
    return closest;
  }
  function sprayAt(x, y, target = nearestToy(x, y)) {
    const now = performance.now();
    if (!sprayerReady || document.hidden || now - lastSpray < 110 || liveBills.size >= maxBills) return;
    lastSpray = now;
    const still = paused || reduced.matches;
    let angle = -.25;
    let reach = 150;
    if (target) {
      const r = target.el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - x;
      const dy = r.top + r.height / 2 - y;
      const distance = Math.hypot(dx, dy);
      if (distance > 20) { angle = Math.atan2(dy, dx); reach = Math.min(420, distance + 50); }
      if (!paused) {
        target.vx += Math.cos(angle) * 2.1;
        target.vy -= 3;
        target.angularVelocity += Math.cos(angle) * 1.2;
      }
      say(target, target.el.classList.contains('toy-reclining') ? 'funding my nap ♡' : 'keep it coming ♡');
    }
    const count = Math.min(still ? 3 : 4, maxBills - liveBills.size);
    for (let i = 0; i < count; i++) {
      const w = (innerWidth < 761 ? 29 : 35) + Math.random() * 18;
      const el = createBill(w, 'spray-bill');
      const a = angle + (Math.random() - .5) * .45;
      const distance = reach * (.8 + Math.random() * .5);
      const spin = Math.random() * 90 - 45;
      if (still) {
        el.style.transform = `translate(${x + (i - 1) * 28 - w / 2}px,${y - 30 - Math.random() * 35}px) rotate(${spin}deg)`;
        animateBill(el, [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .65 }, { opacity: 0 }], { duration: 1300, easing: 'ease-out' }, true);
      } else {
        const frames = Array.from({ length: 9 }, (_, j) => {
          const p = j / 8;
          const launch = 1 - Math.pow(1 - p, 2);
          const px = x + Math.cos(a) * distance * launch - w / 2;
          const py = y + Math.sin(a) * distance * launch + 170 * p * p - w / 5;
          return { transform: `translate3d(${px}px,${py}px,0) rotate(${spin + p * 170}deg) rotateY(${Math.sin(p * 9 + i) * 55}deg)`, opacity: p === 1 ? 0 : 1 };
        });
        animateBill(el, frames, { duration: 1050 + Math.random() * 450, delay: i * 28, easing: 'linear', fill: 'both' });
      }
    }
    status.textContent = target ? 'Money sprayed at the bear!' : 'A little money magic.';
  }
  function stopSpraying() {
    clearTimeout(sprayTimer);
    sprayTimer = 0;
    sprayPoint = null;
  }
  function keepSpraying() {
    if (!sprayPoint || paused || document.hidden || performance.now() - sprayStarted > 6000) { stopSpraying(); return; }
    sprayAt(sprayPoint.x, sprayPoint.y);
    sprayTimer = setTimeout(keepSpraying, 155);
  }
  hero.addEventListener('pointerdown', e => {
    if (!sprayerReady || !finePointer.matches || e.pointerType === 'touch' || e.button !== 0) return;
    if (e.target.closest('a,button') && !e.target.closest('.toy')) return;
    stopSpraying();
    sprayStarted = performance.now();
    sprayPoint = { x: e.clientX, y: e.clientY };
    sprayAt(e.clientX, e.clientY);
    if (!paused && !reduced.matches) sprayTimer = setTimeout(keepSpraying, 260);
  });
  hero.addEventListener('pointermove', e => {
    if (sprayPoint) sprayPoint = { x: e.clientX, y: e.clientY };
  }, { passive: true });
  hero.addEventListener('pointerleave', stopSpraying);
  document.addEventListener('pointerup', stopSpraying);
  document.addEventListener('pointercancel', stopSpraying);
  window.addEventListener('blur', stopSpraying);

  toys.forEach((t, i) => {
    t.el.addEventListener('pointerenter', e => {
      if (paused || !finePointer.matches || e.pointerType === 'touch') return;
      t.vy -= 1.3;
      t.angularVelocity += (i % 2 ? -1 : 1) * .7;
    });
    t.el.addEventListener('click', e => {
      if (!sprayerReady) {
        say(t, 'load the sprayer ↑');
        status.textContent = 'Click Spawn money to load the sprayer, then click a bear.';
        return;
      }
      const r = t.el.getBoundingClientRect();
      const x = e.detail ? e.clientX : r.left - 30;
      const y = e.detail ? e.clientY : r.top + r.height / 2;
      sprayAt(x, y, t);
    });
  });

  function rain() {
    const now = performance.now();
    if (now - lastRain < 600) return;
    lastRain = now;
    sprayerReady = true;
    hero.dataset.sprayerReady = 'true';
    document.querySelector('.play-hint').textContent = 'click or hold to spray the bears';
    const still = paused || reduced.matches;
    const count = Math.min(still ? 6 : (innerWidth < 761 ? 18 : 30), maxBills - liveBills.size);
    for (let i = 0; i < count; i++) {
      const w = (innerWidth < 761 ? 45 : 60) + Math.random() * 45;
      const el = createBill(w);
      const x = Math.random() * (innerWidth - w);
      const spin = Math.random() * 150 - 75;
      if (still) {
        el.style.transform = `translate(${x}px,${60 + Math.random() * (innerHeight - 180)}px) rotate(${spin}deg)`;
        animateBill(el, [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: 1600, easing: 'ease-out' }, true);
      } else {
        const drift = (Math.random() - .5) * 200;
        const frames = Array.from({ length: 9 }, (_, j) => {
          const p = j / 8;
          return { transform: `translate3d(${x + drift * p + Math.sin(p * 8) * 25}px,${-150 + (innerHeight + 300) * p}px,0) rotate(${spin + p * 210}deg) rotateY(${Math.sin(p * 10 + i) * 60}deg)`, opacity: p === 1 ? 0 : 1 };
        });
        animateBill(el, frames, { duration: 4300 + Math.random() * 1700, delay: Math.random() * 900, easing: 'linear', fill: 'both' });
      }
    }
    status.textContent = 'Sprayer loaded! Click or hold to spray money at the bears.';
  }
  document.querySelector('#spawn').addEventListener('click', rain);


  // Tiny visitors use the empty space BETWEEN entries, never the reading surface.
  const laneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleLanes.add(entry.target);
      else visibleLanes.delete(entry.target);
    });
    if (walker && !visibleLanes.has(walker.lane)) {
      walker.animation.cancel();
      walker.el.remove();
      walker = null;
    }
    syncWalkers();
  }, { threshold: .5 });
  [...document.querySelectorAll('.timeline .job')].slice(0, -1).forEach(job => {
    const lane = document.createElement('div');
    lane.className = 'bear-lane';
    lane.setAttribute('aria-hidden', 'true');
    job.append(lane);
    laneObserver.observe(lane);
  });

  function syncWalkers() {
    clearTimeout(walkerTimer);
    walkerTimer = 0;
    const canWalk = !paused && !document.hidden && visibleLanes.size > 0;
    if (walker) {
      walker.el.classList.toggle('walking-visible', canWalk);
      if (canWalk) walker.animation.play(); else walker.animation.pause();
    } else if (canWalk) {
      walkerTimer = setTimeout(spawnWalker, 1600 + Math.random() * 4000);
    }
  }

  function spawnWalker() {
    walkerTimer = 0;
    if (paused || document.hidden || !visibleLanes.size || walker) return;
    const lanes = [...visibleLanes];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const el = document.createElement('span');
    el.className = 'tiny-walker walking-visible';
    const reverse = Math.random() < .5;
    el.style.setProperty('--direction', reverse ? -1 : 1);
    const shadow = document.createElement('span');
    shadow.className = 'walker-shadow';
    const body = document.createElement('span');
    body.className = 'walker-body';
    const img = new Image();
    img.src = 'assets/bear-walking-worn.webp';
    img.alt = '';
    body.append(img);
    el.append(shadow, body);
    lane.append(el);
    const ends = [-45, lane.clientWidth + 45];
    if (reverse) ends.reverse();
    const animation = el.animate(ends.map(x => ({ transform: `translateX(${x}px)` })), {
      duration: 14000 + Math.random() * 7000, easing: 'linear', fill: 'both',
    });
    const current = { el, animation, lane };
    walker = current;
    const cleanup = () => {
      el.remove();
      if (walker === current) { walker = null; syncWalkers(); }
    };
    animation.finished.then(cleanup).catch(cleanup);
    img.addEventListener('error', () => animation.cancel(), { once: true });
  }

  const chapterLinks = [...document.querySelectorAll('.reading-nav>div a')];
  const chapterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      chapterLinks.forEach(a => {
        if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -60% 0px' });
  ['about', 'experience', 'projects', 'toolkit', 'education', 'contact'].forEach(id => chapterObserver.observe(document.getElementById(id)));

  // A missing decorative image must never hide the résumé or block navigation.
  toys.forEach(t => t.el.querySelector('img').addEventListener('error', () => { t.el.hidden = true; }));
  measure();
  applyMotion();
})();

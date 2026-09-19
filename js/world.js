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
  const ambient = document.querySelector('.ambient-money');
  const layers = [...document.querySelectorAll('.scene-layer')];
  const clouds = document.querySelector('.clouds-moving');
  const reflection = document.querySelector('.water-reflection');
  const ripples = document.querySelector('.water-ripples');
  const billSources = ['assets/dollar-bill.webp'];
  const toys = [...document.querySelectorAll('.toy')].map((el, i) => ({
    el, inner: el.querySelector('.toy-motion'), phase: i * 1.77,
    depth: Number(el.dataset.depth), x: 0, y: 0, vx: 0, vy: 0,
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
  let lastPoke = 0;
  const pointer = { x: 0, y: 0, active: false };
  const liveBills = new Set();
  const visibleLanes = new Set();
  let walker = null;
  let walkerTimer = 0;
  let copyZones = [];

  // Positions leave the copy and navigation readable while framing the scene.
  const billPositions = [
    [-3, 13, 8, -32, .7], [27, -3, 7, -45, .3], [45, 12, 5, -27, 0],
    [60, 10, 6, 31, 0], [76, 13, 5, 23, .1], [71, 39, 4, -30, .2],
    [-3, 62, 6, -25, .6], [35, 66, 5, 32, 0], [44, 78, 6, 42, .2],
    [60, 70, 4, -26, 0], [78, 82, 6, -38, .2], [58, 90, 8, -24, .5],
    [21, 85, 6, -32, .6], [47, 99, 8, 22, .8],
  ];
  const bills = billPositions.map(([x, y, w, angle, blur], i) => {
    const el = document.createElement('div');
    el.className = 'ambient-bill';
    el.style.cssText = `left:${x}%;top:${y}%;width:${w}%;filter:blur(${blur}px) drop-shadow(3px 7px 5px #60472830)`;
    const img = new Image();
    img.src = billSources[i % billSources.length];
    img.alt = '';
    img.draggable = false;
    el.append(img);
    ambient.append(el);
    el.style.transform = `rotate(${angle}deg)`;
    return { el, angle, x, y, phase: i * 1.9, depth: .3 + (w / 12) };
  });

  function measure() {
    rect = hero.getBoundingClientRect();
    copyZones = [...hero.querySelectorAll('.topbar,.intro,.identity,.chapter-nav,.world-caption')]
      .filter(el => el.offsetWidth).map(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left - rect.left - 22, right: r.right - rect.left + 22,
          top: r.top - rect.top - (el.classList.contains('identity') ? 55 : 18), bottom: r.bottom - rect.top + 18 };
      });
    // Keep each bill's entire drift envelope out of the typography.
    bills.forEach(b => {
      const w = b.el.offsetWidth;
      const radius = w * .58 + 26;
      const x = b.x / 100 * rect.width + w / 2;
      const y = b.y / 100 * rect.height + w / 4.8;
      const obscures = copyZones.some(z => x + radius > z.left && x - radius < z.right && y + radius > z.top && y - radius < z.bottom);
      b.el.classList.toggle('is-obscuring', obscures);
    });
    toys.forEach(t => {
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
      const bob = Math.sin(clock * .95 + t.phase) * (2.2 + t.depth * 2.3);
      const sway = Math.sin(clock * .55 + t.phase) * 1.2;
      const x = t.x - sceneX * 16 * t.depth;
      const y = t.y + bob - sceneY * 11 * t.depth;
      t.inner.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(calc(var(--rotation) + ${(t.angle + sway).toFixed(2)}deg))`;
      t.el.style.setProperty('--shadow-x', `${(x * .35).toFixed(1)}px`);
      t.el.style.setProperty('--shadow-scale', (1 - Math.max(-.1, Math.min(.18, y * -.006))).toFixed(3));
    });
    bills.forEach(b => {
      const x = Math.sin(clock * .38 + b.phase) * 9 - sceneX * 12 * b.depth;
      const y = Math.cos(clock * .55 + b.phase) * 10 - sceneY * 8 * b.depth;
      const rz = b.angle + Math.sin(clock * .5 + b.phase) * 5;
      const ry = Math.sin(clock * .65 + b.phase) * 20;
      b.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rz.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
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
      if (!target?.closest('.world,.page-atmosphere,.contact-pool,.tiny-walker')) return;
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
    liveBills.forEach(b => { if (paused || !visible || document.hidden) b.animation.pause(); else b.animation.play(); });
    syncWalkers();
    syncAmbientAnimations();
    if (paused) stop(); else start();
  }
  motionButton.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reduced.addEventListener('change', e => { paused = e.matches; applyMotion(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    hero.classList.toggle('is-offscreen', !visible);
    document.body.classList.toggle('reading', !visible);
    syncAmbientAnimations();
    liveBills.forEach(b => { if (paused || !visible || document.hidden) b.animation.pause(); else b.animation.play(); });
    if (visible) { measure(); start(); } else { pointer.active = false; stop(); }
  }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('is-hidden', document.hidden);
    if (document.hidden) stop(); else start();
    syncWalkers();
    syncAmbientAnimations();
    liveBills.forEach(b => {
      if (document.hidden || paused || !visible) b.animation.pause(); else b.animation.play();
    });
  });

  toys.forEach((t, i) => {
    t.el.addEventListener('pointerenter', e => {
      if (paused || !finePointer.matches || e.pointerType === 'touch') return;
      t.vy -= 1.8;
      t.angularVelocity += (i % 2 ? -1 : 1) * .8;
    });
    t.el.addEventListener('click', e => {
      const now = performance.now();
      if (now - lastPoke < 220) return;
      lastPoke = now;
      const r = t.el.getBoundingClientRect();
      const x = e.detail ? e.clientX : r.left + r.width / 2;
      const y = e.detail ? e.clientY : r.top + r.height / 2;
      if (!paused) {
        t.vy -= t.el.dataset.reaction === 'bounce' ? 7 : 3.5;
        t.angularVelocity += (i % 2 ? -1 : 1) * 3;
      } else if (!reduced.matches) {
        t.inner.animate([
          { transform: 'translateY(0) rotate(var(--rotation))' },
          { transform: 'translateY(-13px) rotate(calc(var(--rotation) + 6deg))', offset: .25 },
          { transform: 'translateY(3px) rotate(calc(var(--rotation) - 3deg))', offset: .6 },
          { transform: 'translateY(0) rotate(var(--rotation))' },
        ], { duration: 650, easing: 'ease-out' });
      }
      const messages = ['hey! ♡', 'hehe', 'just floating…', 'oh, hi!', 'you found me ♡'];
      bubble.textContent = messages[i % messages.length];
      bubble.style.left = `${Math.min(rect.width - 65, Math.max(65, x - rect.left))}px`;
      bubble.style.top = `${Math.max(60, y - rect.top - 35)}px`;
      bubble.classList.add('visible');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove('visible'), 1200);
      status.textContent = `The bear says ${messages[i % messages.length]}`;
      const ring = document.createElement('span');
      ring.className = 'poke-ring';
      ring.style.cssText = `left:${x - rect.left}px;top:${y - rect.top}px`;
      hero.append(ring);
      const animation = ring.animate([{ opacity: .7, transform: 'scale(.5)' }, { opacity: 0, transform: `scale(${reduced.matches ? 1 : 2.8})` }], { duration: 500, easing: 'ease-out' });
      animation.finished.then(() => ring.remove()).catch(() => ring.remove());
    });
  });

  function rain() {
    const now = performance.now();
    if (now - lastRain < 600) return;
    lastRain = now;
    const still = paused || reduced.matches;
    const count = still ? 4 : (innerWidth < 761 ? 12 : 22);
    const available = Math.max(0, 60 - liveBills.size);
    for (let i = 0; i < Math.min(count, available); i++) {
      const el = document.createElement('span');
      el.className = 'falling-bill';
      const img = new Image();
      img.src = billSources[i % billSources.length];
      img.alt = '';
      el.append(img);
      const w = (innerWidth < 761 ? 55 : 70) + Math.random() * 62;
      el.style.width = `${w}px`;
      shower.append(el);
      const x = Math.random() * (rect.width - w);
      const drift = (Math.random() - .5) * 220;
      const spin = Math.random() * 150 - 75;
      let animation;
      if (still) {
        el.style.transform = `translate(${x}px,${rect.height * .7 + Math.random() * rect.height * .15}px) rotate(${spin}deg)`;
        animation = el.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: 1600, easing: 'ease-out' });
      } else {
        const frames = Array.from({ length: 7 }, (_, j) => {
          const p = j / 6;
          const px = x + drift * p + Math.sin(p * 8) * 25;
          const py = -150 + (rect.height + 320) * p;
          const behindCopy = copyZones.some(z => px + w > z.left && px < z.right && py + w * .6 > z.top && py < z.bottom);
          return { transform: `translate3d(${px}px,${py}px,0) rotateZ(${spin + p * 210}deg) rotateY(${Math.sin(p * 10 + i) * 65}deg) rotateX(${Math.cos(p * 8) * 25}deg)`, opacity: p === 1 || behindCopy ? 0 : .85 };
        });
        animation = el.animate(frames, { duration: 4800 + Math.random() * 2000, delay: Math.random() * 1400, easing: 'linear', fill: 'both' });
      }
      const entry = { el, animation };
      liveBills.add(entry);
      const cleanup = () => { el.remove(); liveBills.delete(entry); };
      animation.finished.then(cleanup).catch(cleanup);
    }
    status.textContent = still ? 'A little money magic.' : 'It’s raining money!';
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
    img.src = 'assets/bear-walking.webp';
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

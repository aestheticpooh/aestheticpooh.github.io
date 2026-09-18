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

  // Positions leave the copy and navigation readable while framing the scene.
  const billPositions = [
    [-2, 8, 11, -32, 1.5], [25, -3, 11, -45, 0], [28, 16, 7, 17, 0],
    [43, 8, 7, -27, 0], [55, 8, 7, 31, 0], [67, 1, 10, -34, .6],
    [78, 13, 8, 23, .1], [61, 24, 9, 41, 0], [71, 36, 5, -30, .3],
    [1, 45, 7, -25, .9], [30, 39, 8, -19, 0], [20, 50, 11, -47, .5],
    [36, 49, 6, 32, 0], [43, 71, 10, 42, .3], [54, 71, 6, -26, 0],
    [65, 61, 8, 9, .1], [84, 70, 8, -55, .2], [64, 87, 12, -24, 1],
    [24, 87, 14, -32, 2], [48, 99, 15, 22, 2], [88, 92, 11, 42, 1.4],
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
    return { el, angle, phase: i * 1.9, depth: .3 + (w / 12) };
  });

  function measure() {
    rect = hero.getBoundingClientRect();
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
  function applyMotion() {
    hero.classList.toggle('is-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume scene animation' : 'Pause scene animation');
    motionButton.querySelector('.motion-label').textContent = paused ? 'Resume motion' : 'Pause motion';
    liveBills.forEach(b => { if (paused) b.animation.pause(); else b.animation.play(); });
    if (paused) stop(); else start();
  }
  motionButton.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reduced.addEventListener('change', e => { paused = e.matches; applyMotion(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { measure(); start(); } else { pointer.active = false; stop(); }
  }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
    liveBills.forEach(b => {
      if (document.hidden || paused) b.animation.pause(); else b.animation.play();
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
    const count = still ? 6 : (innerWidth < 761 ? 18 : 32);
    const available = Math.max(0, 80 - liveBills.size);
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
      const x = Math.random() * (innerWidth - w);
      const drift = (Math.random() - .5) * 220;
      const spin = Math.random() * 150 - 75;
      let animation;
      if (still) {
        el.style.transform = `translate(${x}px,${70 + Math.random() * (innerHeight * .7)}px) rotate(${spin}deg)`;
        animation = el.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: 1600, easing: 'ease-out' });
      } else {
        const frames = Array.from({ length: 7 }, (_, j) => {
          const p = j / 6;
          return { transform: `translate3d(${x + drift * p + Math.sin(p * 8) * 25}px,${-150 + (innerHeight + 320) * p}px,0) rotateZ(${spin + p * 210}deg) rotateY(${Math.sin(p * 10 + i) * 65}deg) rotateX(${Math.cos(p * 8) * 25}deg)`, opacity: p === 1 ? 0 : 1 };
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

  // A missing decorative image must never hide the résumé or block navigation.
  toys.forEach(t => t.el.querySelector('img').addEventListener('error', () => { t.el.hidden = true; }));
  measure();
  applyMotion();
})();

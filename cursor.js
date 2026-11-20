// 커스텀 커서: 노란 원 fill (데스크톱) — 메인·아티클 페이지 공용
(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) {
    const root = document.documentElement;
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span class="cursor-ring__shape"></span><span class="cursor-ring__label">View ↗</span>';
    document.body.append(ring);
    root.classList.add('has-cursor');

    let x = -100, y = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      root.classList.add('is-cursor-on');
      const onCard = !!e.target.closest('.card a:not(.is-soon)');
      const onLink = !onCard && !!e.target.closest('a:not(.is-soon), button:not(:disabled)');
      ring.classList.toggle('is-view', onCard);
      ring.classList.toggle('is-link', onLink);
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('is-cursor-on'));
    window.addEventListener('blur', () => root.classList.remove('is-cursor-on'));
    window.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    window.addEventListener('pointerup', () => ring.classList.remove('is-down'));

    (function loop() {
      rx += (x - rx) * 0.25;
      ry += (y - ry) * 0.25;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
  }
})();

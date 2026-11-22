// 이스터에그: 아주 작은 친구가 사이트를 보는 동안 이곳저곳에 은근슬쩍 나타났다 사라짐
// - 15~30초마다 지금 화면에 보이는 요소(제목·카드·이력·글 목록 등) 중 하나 위에 살짝 앉음
// - 몇 초 있다가 조용히 사라짐. 마우스를 올리면 갸웃, 누르면 폴짝 사라짐
(() => {
  const PERCHES = [
    '.hero__word', '.hero__meta', '.about__name', '.portrait', '.resume__head',
    '.works__title', '.cards .card', '.contact__note', '.contact__info',
    '.article__title', '.article__item a',
  ].join(',');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TEXT = '.hero__word, .hero__meta, .about__name, .resume__head, .works__title, .article__title';
  const meter = document.createElement('canvas').getContext('2d');
  // 요소 안 글자 하나의 가로 중심과 실제 글자 윗선(화면 좌표)
  const onGlyph = (el) => {
    const chars = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = walk.nextNode());) {
      for (let i = 0; i < n.length; i++) if (/[A-Za-z0-9가-힣]/.test(n.data[i])) chars.push([n, i]);
    }
    if (!chars.length) return null;
    const [node, i] = chars[Math.floor(Math.random() * chars.length)];
    const range = document.createRange();
    range.setStart(node, i); range.setEnd(node, i + 1);
    const rr = range.getBoundingClientRect();
    const cs = getComputedStyle(node.parentElement);
    meter.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const fm = meter.measureText('Hg'), gm = meter.measureText(node.data[i]);
    const fA = fm.fontBoundingBoxAscent, fD = fm.fontBoundingBoxDescent;
    const base = rr.top + (rr.height - (fA + fD)) / 2 + fA;
    return { cx: rr.left + rr.width / 2, top: base - gm.actualBoundingBoxAscent };
  };

  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'buddy';
  b.setAttribute('aria-label', '작은 친구');
  b.innerHTML = '<img src="assets/buddy.png" alt="" width="360" height="246" draggable="false">';
  document.body.append(b);

  let hideTimer;
  const hide = () => { b.classList.remove('is-on'); };
  const show = () => {
    if (document.hidden || document.documentElement.classList.contains('is-project-open')) return;
    const vh = window.innerHeight, vw = window.innerWidth;
    const spots = [...document.querySelectorAll(PERCHES)].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 60 && r.top > 80 && r.top < vh - 120 && r.left >= 0 && r.right <= vw;
    });
    if (!spots.length) return;
    const el = spots[Math.floor(Math.random() * spots.length)];
    const w = b.offsetWidth, h = b.offsetHeight;
    let x, y;
    const spot = el.matches(TEXT) ? onGlyph(el) : null;
    if (spot) {
      // 글자 하나를 골라 그 글자 머리 꼭대기에 정확히 앉음
      x = spot.cx - w / 2 + window.scrollX;
      y = spot.top - h + 2 + window.scrollY;
    } else {
      const r = el.getBoundingClientRect();
      x = r.left + window.scrollX + (0.1 + Math.random() * 0.8) * (r.width - w);
      y = r.top + window.scrollY - h + 1;
    }
    b.style.left = `${Math.round(x)}px`;
    b.style.top = `${Math.round(y)}px`;
    b.classList.toggle('is-flip', Math.random() < 0.5);
    b.classList.add('is-on');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 4000 + Math.random() * 2500);
  };

  const loop = () => {
    setTimeout(() => { show(); loop(); }, 15000 + Math.random() * 15000);
  };
  setTimeout(show, 6000 + Math.random() * 4000);   // 첫 등장은 조금 기다렸다가
  loop();

  // 스크롤하면 앉아 있던 자리에서 벗어나니까 조용히 사라짐
  window.addEventListener('scroll', () => { if (b.classList.contains('is-on')) { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 600); } }, { passive: true });
  b.addEventListener('click', () => {
    b.classList.add('is-hop');
    setTimeout(() => { b.classList.remove('is-on', 'is-hop'); }, reduce ? 0 : 380);
  });
})();

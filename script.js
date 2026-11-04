// 스크롤 위치에 따라 GNB 활성 메뉴 표시 + Top 버튼 노출 (첫 화면에서는 숨김)
const sections = [...document.querySelectorAll('main > section')];
const links = document.querySelectorAll('.gnb a');
const topBtn = document.getElementById('top');

function sync() {
  const line = window.innerHeight * 0.5;
  let current = sections[0].id;
  for (const s of sections) {
    if (s.getBoundingClientRect().top <= line) current = s.id;
  }
  links.forEach((a) => a.classList.toggle('is-active', a.dataset.target === current));
  topBtn.classList.toggle('is-on', current !== 'home');
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { sync(); ticking = false; });
}, { passive: true });
window.addEventListener('resize', sync);
sync();

topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// About: 태그를 누르면 해당 설명글 표시, 같은 태그를 다시 누르면 닫힘
const portrait = document.querySelector('.portrait');
const tags = portrait.querySelectorAll('.tag');
const bios = document.querySelectorAll('#bio [data-bio]');

tags.forEach((tag) => {
  tag.addEventListener('click', () => {
    const key = tag.dataset.bio;
    const willOpen = tag.getAttribute('aria-pressed') !== 'true';
    tags.forEach((t) => t.setAttribute('aria-pressed', String(willOpen && t === tag)));
    bios.forEach((p) => { p.hidden = !(willOpen && p.dataset.bio === key); });
    portrait.classList.toggle('has-pick', willOpen);
  });
});

// About: 번호(제목)를 누르면 이력 내용 펼침/접힘
document.querySelectorAll('.acc .resume__head:not(:disabled)').forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    // 한 번에 하나만 펼침 (섹션 높이 1024 고정이라 여러 개 열면 잘림)
    document.querySelectorAll('.acc.is-open').forEach((acc) => {
      acc.classList.remove('is-open');
      acc.querySelector('.resume__head').setAttribute('aria-expanded', 'false');
    });
    btn.setAttribute('aria-expanded', String(open));
    btn.closest('.acc').classList.toggle('is-open', open);
  });
});

// ---------- 스크롤 등장 애니메이션 ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealGroups = [
  // [선택자, 시작 지연(초), 요소 간 간격(초)]
  ['.hero__word--product, .hero__word--designer, .hero__word--year', 0.1, 0.12],
  ['.hero__meta, .hero__tagline, .hero__at', 0.55, 0.1],
  ['.portrait, .about__name, .about__bio', 0.05, 0.1],
  ['.resume .acc', 0.15, 0.08],
  ['.works__top, .works__title--second', 0, 0.1],
  ['.cards .card', 0.05, 0.07],
  ['.contact__info', 0.05, 0],
  ['.contact__note', 0.2, 0],
];
revealGroups.forEach(([sel, start, step]) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    // 카드는 줄마다 지연을 다시 시작
    const idx = el.matches('.card') ? [...el.parentElement.children].indexOf(el) : i;
    el.style.setProperty('--d', `${start + idx * step}s`);
  });
});

if (reduceMotion || !('IntersectionObserver' in window)) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
} else {
  // clip-path 로 가려진 히어로 글자는 자기 자신이 '안 보임'으로 잡히므로 섹션을 대신 관찰
  const watchers = new Map(); // 관찰 대상 → 등장시킬 요소들
  document.querySelectorAll('.reveal').forEach((el) => {
    const target = el.matches('.hero__word') ? el.closest('section') : el;
    if (!watchers.has(target)) watchers.set(target, []);
    watchers.get(target).push(el);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      watchers.get(entry.target).forEach((el) => el.classList.add('is-in'));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  watchers.forEach((_, target) => io.observe(target));
}

// 등장이 끝나면 전환 지연을 지워서 호버 반응이 늦지 않게
document.addEventListener('transitionend', (e) => {
  const el = e.target;
  if (el.classList && el.classList.contains('is-in')) el.style.removeProperty('--d');
});

// ---------- 클릭 물결 (태그 · Top 버튼) ----------
document.querySelectorAll('.tag, .top').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => {
    if (reduceMotion) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.width = dot.style.height = `${size}px`;
    // zoom 영향 없이 버튼 안 좌표로 계산
    dot.style.left = `${((e.clientX - r.left) / r.width) * btn.offsetWidth - size / 2}px`;
    dot.style.top = `${((e.clientY - r.top) / r.height) * btn.offsetHeight - size / 2}px`;
    btn.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  });
});

// ---------- 커스텀 커서: 노란 원 fill (데스크톱) ----------
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) {
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
    const onCard = !!e.target.closest('.card a');
    const onLink = !onCard && !!e.target.closest('a, button:not(:disabled)');
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

// ---------- 프로젝트 줄: 마우스로 끌어서 가로 스크롤 ----------
document.querySelectorAll('.cards').forEach((row) => {
  let startX = 0, startScroll = 0, moved = false, down = false;

  row.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;   // 터치는 기본 스크롤 사용
    down = true; moved = false;
    startX = e.clientX;
    startScroll = row.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) { moved = true; row.classList.add('is-dragging'); }
    if (moved) row.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (moved) requestAnimationFrame(() => row.classList.remove('is-dragging'));
  });
  // 끌었을 때는 카드 링크가 눌리지 않게
  row.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
});

// ---------- 프로젝트 상세 (카드 클릭 → 전체 화면) ----------
const projectPanels = {};
document.querySelectorAll('.project').forEach((panel) => {
  projectPanels[panel.id.replace('project-', '')] = panel;
});
let openPanel = null;
// 상세를 열기 직전 위치(페이지 세로 + 카드 줄 가로)를 기억했다가 닫을 때 그대로 복원
let savedPos = null;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function savePosition() {
  savedPos = { y: window.scrollY, rows: [...document.querySelectorAll('.cards')].map((r) => r.scrollLeft) };
}
function restorePosition() {
  if (!savedPos) return;
  const { y, rows } = savedPos;
  const apply = () => {
    window.scrollTo({ top: y, behavior: 'instant' });
    document.querySelectorAll('.cards').forEach((r, i) => { r.scrollLeft = rows[i] || 0; });
  };
  apply();
  requestAnimationFrame(apply);            // 뒤로가기 처리 뒤에도 한 번 더
  setTimeout(apply, 60);
}
// 화면이 바뀌면 커서의 View·링크 상태를 초기화 (마우스가 안 움직여도)
function resetCursor() {
  const ring = document.querySelector('.cursor-ring');
  if (ring) ring.classList.remove('is-view', 'is-link', 'is-down');
}
let lastFocus = null;
let pushedState = false;

function openProject(key, { push = true } = {}) {
  const panel = projectPanels[key];
  if (!panel || openPanel === panel) return;
  if (!openPanel) savePosition();
  lastFocus = document.activeElement;
  panel.hidden = false;
  panel.scrollTop = 0;
  requestAnimationFrame(() => panel.classList.add('is-open'));
  document.documentElement.classList.add('is-project-open');
  resetCursor();
  openPanel = panel;
  if (push) { history.pushState({ project: key }, '', `#${key}`); pushedState = true; }
  setTimeout(() => panel.querySelector('.project__close').focus({ preventScroll: true }), 50);

}

function closeProject({ fromHistory = false } = {}) {
  if (!openPanel) return;
  const panel = openPanel;
  openPanel = null;
  panel.classList.remove('is-open');
  document.documentElement.classList.remove('is-project-open');
  resetCursor();
  setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 700);
  if (lastFocus) lastFocus.focus({ preventScroll: true });
  if (!fromHistory && pushedState) { pushedState = false; history.back(); }
  else if (!fromHistory) history.replaceState(null, '', location.pathname + location.search);
  restorePosition();
}

document.querySelectorAll('[data-project]').forEach((link) => {
  link.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;          // 가로 드래그 직후의 클릭은 무시
    e.preventDefault();
    openProject(link.dataset.project);
  });
});
document.querySelectorAll('.project__close, .project__back').forEach((btn) => {
  btn.addEventListener('click', () => closeProject());
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && openPanel) closeProject();
});
window.addEventListener('popstate', () => {
  const key = location.hash.slice(1);
  if (projectPanels[key]) openProject(key, { push: false });
  else { pushedState = false; closeProject({ fromHistory: true }); }
});
// 주소에 #harubee 가 있으면 바로 열기
if (projectPanels[location.hash.slice(1)]) openProject(location.hash.slice(1), { push: false });

// ---------- 프로젝트 줄: 마우스 휠(세로)로 가로 이동 ----------
// 줄 끝에 닿으면 막지 않고 페이지 세로 스크롤로 넘김
document.querySelectorAll('.cards').forEach((row) => {
  row.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;                                   // 핀치 줌은 그대로
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;     // 트랙패드 가로 스와이프는 기본 동작
    const max = row.scrollWidth - row.clientWidth;
    if (max <= 1) return;                                    // 넘칠 카드가 없으면 패스
    const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    const atStart = row.scrollLeft <= 0 && dy < 0;
    const atEnd = row.scrollLeft >= max - 1 && dy > 0;
    if (atStart || atEnd) return;
    e.preventDefault();
    row.classList.add('is-wheeling');                         // 휠 도중엔 스냅 끔
    row.scrollLeft += dy;
    clearTimeout(row._wheelTimer);
    row._wheelTimer = setTimeout(() => row.classList.remove('is-wheeling'), 180);
  }, { passive: false });
});

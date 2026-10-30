// Quotes — random quote with trail, favourites, copy/share and deep links (?q=123).
const $ = s => document.querySelector(s);
const el = {
  quote: $('#quote'), text: $('#text'), author: $('#author'), counter: $('#counter'),
  prev: $('#prev-btn'), next: $('#next-btn'), like: $('#like-btn'), copy: $('#copy-btn'), share: $('#share-btn'),
  favsBtn: $('#favs-btn'), favCount: $('#fav-count'), list: $('#fav-list'), empty: $('#fav-empty'),
  drawerCount: $('#drawer-count'), toast: $('#toast'), theme: $('#theme-btn'),
};
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

let QUOTES = [], trail = [], cur = -1, busy = false;
let favs = store.get('q-favs', []);

const fmt = n => String(n + 1).padStart(4, '0');
const HUES = [265, 225, 320, 195, 15, 285, 345, 240];   // curated moods: violet, blue, rose, teal, ember...
const hueOf = i => HUES[i % HUES.length];

function render(i, instant) {
  const [t, a] = QUOTES[i];
  const words = t.split(/\s+/);
  el.text.innerHTML = words.map((w, k) => `<span class="w" style="--i:${k}">${w.replace(/</g, '&lt;')}</span>`).join(' ');
  el.author.textContent = a;
  // long quotes get smaller type so they always fit
  const len = t.length;
  const size = len < 60 ? 'clamp(34px, 6.4vw, 84px)' : len < 140 ? 'clamp(28px, 4.8vw, 62px)' : len < 240 ? 'clamp(24px, 3.6vw, 46px)' : 'clamp(20px, 2.8vw, 36px)';
  el.quote.style.setProperty('--qsize', size);
  document.documentElement.style.setProperty('--hue', hueOf(i));
  el.counter.textContent = `№ ${fmt(i)} / ${QUOTES.length.toLocaleString('en')}`;
  el.quote.classList.remove('out');
  el.quote.classList.remove('ready');
  requestAnimationFrame(() => el.quote.classList.add('ready'));
  el.like.setAttribute('aria-pressed', favs.includes(i));
  el.prev.disabled = trail.length < 2 || cur <= 0;
  const url = new URL(location); url.searchParams.set('q', i + 1);
  window.history.replaceState(null, '', url);
  document.title = `“${t.length > 60 ? t.slice(0, 57) + '…' : t}” — ${a}`;
  if (instant) el.quote.querySelectorAll('.w').forEach(w => { w.style.animationDelay = '0ms'; });
}

function go(i) {
  if (busy) return;
  busy = true;
  el.quote.classList.add('out');
  setTimeout(() => { render(i); busy = false; }, 340);
}
function next() {
  el.next.classList.remove('spin'); void el.next.offsetWidth; el.next.classList.add('spin');
  if (cur < trail.length - 1) { cur++; return go(trail[cur]); }
  let i; do { i = Math.floor(Math.random() * QUOTES.length); } while (trail.includes(i) && trail.length < QUOTES.length);
  trail.push(i); cur = trail.length - 1; go(i);
}
function prev() { if (cur > 0) { cur--; go(trail[cur]); } }

function toast(msg) {
  el.toast.textContent = msg; el.toast.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.toast.classList.remove('show'), 1600);
}
const current = () => { const [t, a] = QUOTES[trail[cur]]; return { t, a, text: `“${t}” — ${a}`, url: location.href }; };

async function copy() {
  try { await navigator.clipboard.writeText(current().text); toast('Copied to clipboard'); }
  catch { toast('Copy not available here'); }
}
async function share() {
  const c = current();
  if (navigator.share) { try { await navigator.share({ text: c.text, url: c.url }); } catch {} return; }
  window.open(`https://x.com/intent/post?text=${encodeURIComponent(c.text)}&url=${encodeURIComponent(c.url)}`, '_blank', 'noopener');
}

function toggleLike() {
  const i = trail[cur], k = favs.indexOf(i);
  if (k >= 0) { favs.splice(k, 1); toast('Removed from saved'); } else { favs.unshift(i); toast('Saved ♥'); }
  store.set('q-favs', favs); el.like.setAttribute('aria-pressed', k < 0); drawFavs();
}
function drawFavs() {
  el.favCount.hidden = !favs.length; el.favCount.textContent = favs.length;
  el.drawerCount.textContent = favs.length ? `· ${favs.length}` : '';
  el.empty.hidden = !!favs.length;
  el.list.innerHTML = favs.map(i => `<li data-i="${i}"><p>${QUOTES[i][0].replace(/</g, '&lt;')}</p><small>— ${QUOTES[i][1]}</small>
    <button aria-label="Remove" data-rm="${i}"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button></li>`).join('');
}
const drawer = open => {
  document.body.classList.toggle('drawer-open', open);
  $('#drawer').setAttribute('aria-hidden', !open);
  if (open) $('#close-btn').focus();
};
el.list.addEventListener('click', e => {
  const rm = e.target.closest('[data-rm]');
  if (rm) { favs = favs.filter(x => x !== +rm.dataset.rm); store.set('q-favs', favs); drawFavs(); el.like.setAttribute('aria-pressed', favs.includes(trail[cur])); return; }
  const li = e.target.closest('li'); if (!li) return;
  const i = +li.dataset.i; trail.splice(cur + 1, 0, i); cur++; drawer(false); go(i);
});

function toggleTheme() {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('q-theme', t); } catch {}
  document.querySelector('meta[name=theme-color]').content = t === 'dark' ? '#0b0b12' : '#f7f4ee';
}

el.next.onclick = next; el.prev.onclick = prev; el.like.onclick = toggleLike; el.copy.onclick = copy; el.share.onclick = share;
el.theme.onclick = toggleTheme; el.favsBtn.onclick = () => drawer(true);
$('#close-btn').onclick = () => drawer(false); $('#scrim').onclick = () => drawer(false);

addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'escape') return drawer(false);
  if (document.body.classList.contains('drawer-open')) return;
  if (k === ' ' || k === 'arrowright' || k === 'enter' && e.target === document.body) { e.preventDefault(); next(); }
  else if (k === 'arrowleft') prev();
  else if (k === 'l') toggleLike();
  else if (k === 'c') copy();
  else if (k === 's') share();
  else if (k === 'f') drawer(true);
  else if (k === 't') toggleTheme();
});
// swipe on phones
let sx = null;
addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
addEventListener('touchend', e => {
  if (sx == null || document.body.classList.contains('drawer-open')) return;
  const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (dx < -60) next(); else if (dx > 60) prev();
});

(q => {
  QUOTES = q; drawFavs();
  const n = parseInt(new URLSearchParams(location.search).get('q'), 10);
  const i = n >= 1 && n <= q.length ? n - 1 : Math.floor(Math.random() * q.length);
  trail = [i]; cur = 0; render(i);
})(window.QUOTES);

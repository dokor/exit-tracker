const APP_VERSION = '1.2.0';
const SW_PATH = 'sw.js';
const STORAGE_KEYS = {
  DONE: 'exit_done_v1',
  GAMES_OVERRIDE: 'exit_games_override_v1',
  IMG_CACHE: 'exit_img_cache_v1'
};
const DATA_URL = 'data/games.json';

let masterGames = [];
let currentFilter = 'all';
let query = '';
let done = loadJSON(STORAGE_KEYS.DONE, {});
let imgCache = loadJSON(STORAGE_KEYS.IMG_CACHE, {});

document.addEventListener('DOMContentLoaded', async () => {
  attachUI();
  await loadGames();
  render();
  setupPWA();
});

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(SW_PATH).catch(console.error);
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const iosTip = document.getElementById('iosTip');
  if (isIOS && !isStandalone) iosTip.hidden = false;

  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function attachUI() {
  const search = document.getElementById('search');
  search.addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); render(); });

  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.diff;
      render();
    });
  });

  const fileInput = document.getElementById('fileInput');
  document.getElementById('importBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', onImportFile);

  document.getElementById('exportBtn').addEventListener('click', onExportState);
}

async function loadGames() {
  const builtIn = await fetch(DATA_URL, {cache:'no-store'}).then(r => r.json()).catch(() => []);
  const override = loadJSON(STORAGE_KEYS.GAMES_OVERRIDE, null);
  masterGames = Array.isArray(override) && override.length ? override : builtIn;
  const ids = new Set(masterGames.map(g => g.id));
  Object.keys(done).forEach(id => { if (!ids.has(id)) delete done[id]; });
  saveJSON(STORAGE_KEYS.DONE, done);
}

function render() {
  const list = document.getElementById('gameList');
  const tpl = document.getElementById('gameItemTpl');
  list.innerHTML = '';

  const visible = masterGames
    .filter(byFilter)
    .filter(byQuery)
    .sort(sortByDifficultyThenTitle);

  for (const g of visible) {
    const node = tpl.content.cloneNode(true);
    const li = node.querySelector('li');
    li.dataset.id = g.id;

    const checkbox = node.querySelector('.doneToggle');
    checkbox.checked = !!done[g.id];
    checkbox.addEventListener('change', () => {
      done[g.id] = checkbox.checked || undefined;
      if (!checkbox.checked) delete done[g.id];
      saveJSON(STORAGE_KEYS.DONE, done);
      updateStats();
    });

    node.querySelector('.title').textContent = g.titre;
    node.querySelector('.meta').innerHTML = [
      `<span class="badge">${g.difficulte ?? '—'}</span>`,
      g.annee ? `• ${g.annee}` : '',
      g.editeur ? `• ${escapeHTML(g.editeur)}` : ''
    ].join(' ');

    const imgEl = node.querySelector('.cover');
    resolveCover(g).then(src => { if (src) imgEl.src = src; imgEl.alt = g.titre; });

    list.appendChild(node);
  }

  list.setAttribute('aria-busy', 'false');
  updateStats(visible.length);
}

function byFilter(g) {
  return currentFilter === 'all' ? true : (g.difficulte === currentFilter);
}
function byQuery(g) {
  if (!query) return true;
  return g.titre.toLowerCase().includes(query);
}
function sortByDifficultyThenTitle(a, b) {
  const order = { 'Débutant': 0, 'Confirmé': 1, 'Expert': 2 };
  const da = order[a.difficulte] ?? 99;
  const db = order[b.difficulte] ?? 99;
  if (da !== db) return da - db;
  return a.titre.localeCompare(b.titre, 'fr');
}

function updateStats(visibleCount = null) {
  const total = masterGames.length;
  const doneCount = Object.keys(done).length;
  const visible = visibleCount ?? total;
  document.getElementById('totalCount').textContent = total;
  document.getElementById('doneCount').textContent = doneCount;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  document.getElementById('progressPct').textContent = `${pct}%`;
}

function escapeHTML(s){ return s?.replace?.(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m])) ?? s; }

async function onImportFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const incoming = JSON.parse(text);
    if (!Array.isArray(incoming)) throw new Error('Format JSON invalide: attendu un tableau.');
    const map = new Map(masterGames.map(g => [g.id, g]));
    for (const g of incoming) {
      if (!g.id || !g.titre) continue;
      map.set(g.id, { ...map.get(g.id), ...g });
    }
    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.GAMES_OVERRIDE, JSON.stringify(merged));
    masterGames = merged;
    render();
    alert('Liste importée avec succès ✅');
  } catch (err) {
    console.error(err);
    alert('Échec de l’import. Vérifie le fichier JSON.');
  } finally {
    e.target.value = '';
  }
}

function onExportState() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    done
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exit-mon-etat.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Images: si g.image absent, on tente og:image de la page IELLO via proxy r.jina.ai (évite CORS)
async function resolveCover(g){
  if (g.image) return g.image;
  if (!g.imagePage) return '';
  const cached = imgCache[g.id];
  if (cached) return cached;
  try{
    const proxied = 'https://r.jina.ai/' + (g.imagePage.startsWith('http') ? g.imagePage : ('https://' + g.imagePage.replace(/^\\/+/,'')));
    const html = await fetch(proxied, {cache:'force-cache'}).then(r => r.text());
    const m = html.match(/<meta[^>]+property=[\"']og:image[\"'][^>]+content=[\"']([^\"']+)[\"'][^>]*>/i);
    const url = m?.[1] || '';
    if (url){
      imgCache[g.id] = url;
      saveJSON(STORAGE_KEYS.IMG_CACHE, imgCache);
    }
    return url;
  }catch(e){ console.warn('img fetch failed', e); return ''; }
}
const APP_VERSION = '1.3.0';        // <- bump version pour SW
const SW_PATH = 'sw.js';
const DATA_URL = 'data/games.json';

const STORAGE_KEYS = { DONE:'exit_done_v1', IMG_CACHE:'exit_img_cache_v1' };
let masterGames = [];
let done = loadJSON(STORAGE_KEYS.DONE, {});
let imgCache = loadJSON(STORAGE_KEYS.IMG_CACHE, {});

document.addEventListener('DOMContentLoaded', async () => {
  setupPWA();
  await loadGames();
  render();
});

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(SW_PATH).catch(console.error);
  }
}

function loadJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } }
function saveJSON(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

async function loadGames(){
  // 1) essaie de charger data/games.json
  try{
    const res = await fetch(DATA_URL + '?v=' + APP_VERSION, {cache:'no-store'});
    if (!res.ok) throw new Error('fetch fail');
    masterGames = await res.json();
    return;
  }catch(e){
    console.warn('Impossible de charger data/games.json, passage au fallback intégré.', e);
  }
  // 2) fallback intégré : toujours visible même si fetch rate
  masterGames = GAMES_FALLBACK;
}

// ------- Rendu (liste complète, sans recherche/filtre) -------
function render(){
  const list = document.getElementById('gameList');
  const tpl = document.getElementById('gameItemTpl');
  list.innerHTML = '';

  const visible = masterGames.slice().sort((a,b)=>{
    // tri par année desc, puis titre
    const ya = a.annee ?? 0, yb = b.annee ?? 0;
    if (yb !== ya) return yb - ya;
    return a.titre.localeCompare(b.titre, 'fr');
  });

  for (const g of visible){
    const node = tpl.content.cloneNode(true);
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
      g.difficulte ? `<span class="badge">${g.difficulte}</span>` : '',
      g.annee ? `• ${g.annee}` : '',
      g.editeur ? `• ${escapeHTML(g.editeur)}` : ''
    ].filter(Boolean).join(' ');

    const imgEl = node.querySelector('.cover');
    resolveCover(g).then(src => { if (src) imgEl.src = src; imgEl.alt = g.titre; });

    list.appendChild(node);
  }

  list.setAttribute('aria-busy', 'false');
  updateStats(visible.length);
}

function updateStats(){
  const total = masterGames.length;
  const doneCount = Object.keys(done).length;
  const pct = total ? Math.round(doneCount/total*100) : 0;
  document.getElementById('totalCount').textContent = total;
  document.getElementById('doneCount').textContent = doneCount;
  document.getElementById('progressPct').textContent = `${pct}%`;
}

function escapeHTML(s){ return s?.replace?.(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[m])) ?? s; }

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
  }catch(e){ return '' }
}

// ------- Fallback embarqué (extrait) -------
const GAMES_FALLBACK = [
  { "id":"exit-intrigue-a-venise", "titre":"EXIT – Intrigue à Venise", "annee":2025, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-intrigue-a-venise/" },
  { "id":"exit-course-poursuite-a-amsterdam", "titre":"EXIT – Course Poursuite à Amsterdam", "annee":2025, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-course-poursuite-a-amsterdam/" },
  { "id":"exit-lacademie-de-magie", "titre":"EXIT – L’Académie de Magie", "annee":2024, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-lacademie-de-magie/" },
  { "id":"exit-levasion-de-prison", "titre":"EXIT – L’évasion de Prison", "annee":2024, "difficulte":"Expert", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-levasion-de-prison/" },
  { "id":"exit-lheritage-du-voyageur", "titre":"EXIT – L’héritage du Voyageur", "annee":2024, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-lheritage-du-voyageur/" },
  { "id":"exit-la-disparition-de-sherlock-holmes", "titre":"EXIT – La disparition de Sherlock Holmes", "annee":2023, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-la-disparition-de-sherlock-holmes/" },
  { "id":"exit-le-bandit-de-fortune-city", "titre":"EXIT – Le Bandit de Fortune City", "annee":2023, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-bandit-de-fortune-city/" },
  { "id":"exit-le-retour-a-la-cabane-abandonnee", "titre":"EXIT – Le Retour à la Cabane Abandonnée", "annee":2023, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-retour-a-la-cabane-abandonnee/" },
  { "id":"exit-perils-en-terres-du-milieu", "titre":"EXIT – Périls en Terres du Milieu", "annee":2022, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-perils-en-terres-du-milieu/" },
  { "id":"exit-le-cimetiere-des-ombres", "titre":"EXIT – Le Cimetière des Ombres", "annee":2022, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-cimetiere-des-ombres/" },
  { "id":"exit-la-porte-entre-les-mondes", "titre":"EXIT – La Porte entre les Mondes", "annee":2022, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-la-porte-entre-les-mondes/" },
  { "id":"exit-le-jeu-le-manoir-sinistre", "titre":"EXIT : Le Jeu – Le Manoir Sinistre", "annee":2019, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-manoir-sinistre/" },
  { "id":"exit-le-jeu-le-musee-mysterieux", "titre":"EXIT : Le Jeu – Le Musée Mystérieux", "annee":2019, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-musee-mysterieux/" },
  { "id":"exit-le-tresor-englouti", "titre":"EXIT – Le Trésor Englouti", "annee":2018, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-tresor-englouti/" },
  { "id":"exit-le-jeu-le-chateau-interdit", "titre":"EXIT : Le Jeu – Le Château Interdit", "annee":2018, "difficulte":"Expert", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-chateau-interdit/" },
  { "id":"exit-le-jeu-la-station-polaire", "titre":"EXIT : Le Jeu – La Station Polaire", "annee":2018, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-la-station-polaire/" },
  { "id":"exit-le-jeu-le-laboratoire-secret", "titre":"EXIT : Le Jeu – Le Laboratoire Secret", "annee":2017, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-laboratoire-secret/" },
  { "id":"exit-le-jeu-le-tombeau-du-pharaon", "titre":"EXIT : Le Jeu – Le Tombeau du Pharaon", "annee":2017, "difficulte":"Expert", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-tombeau-du-pharaon/" },
  { "id":"exit-le-jeu-la-cabane-abandonnee", "titre":"EXIT : Le Jeu – La Cabane Abandonnée", "annee":2017, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-la-cabane-abandonnee/" }
];
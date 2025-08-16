const APP_VERSION = '1.4.0';   // pas de fetch, liste embarquée
const SW_PATH = 'sw.js';

// stockage local
const STORAGE_KEYS = { DONE:'exit_done_v1', IMG_CACHE:'exit_img_cache_v1' };
let done = loadJSON(STORAGE_KEYS.DONE, {});
let imgCache = loadJSON(STORAGE_KEYS.IMG_CACHE, {});

// ---- LISTE COMPLÈTE EMBARQUÉE (boîtes classiques uniquement) ----
const GAMES = [
  { "id":"exit-intrigue-a-venise", "titre":"EXIT – Intrigue à Venise", "annee":2025, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-intrigue-a-venise/" },
  { "id":"exit-course-poursuite-a-amsterdam", "titre":"EXIT – Course Poursuite à Amsterdam", "annee":2025, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-course-poursuite-a-amsterdam/" },

  { "id":"exit-lacademie-de-magie", "titre":"EXIT – L’Académie de Magie", "annee":2024, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-lacademie-de-magie/" },
  { "id":"exit-levasion-de-prison", "titre":"EXIT – L’évasion de Prison", "annee":2024, "difficulte":"Expert", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-levasion-de-prison/" },
  { "id":"exit-lheritage-du-voyageur", "titre":"EXIT – L’héritage du Voyageur", "annee":2024, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-lheritage-du-voyageur/" },

  { "id":"exit-la-disparition-de-sherlock-holmes", "titre":"EXIT – La disparition de Sherlock Holmes", "annee":2023, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-la-disparition-de-sherlock-holmes/" },
  { "id":"exit-le-bandit-de-fortune-city", "titre":"EXIT – Le Bandit de Fortune City", "annee":2023, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-bandit-de-fortune-city/" },
  { "id":"exit-le-retour-a-la-cabane-abandonnee", "titre":"EXIT – Le Retour à la Cabane Abandonnée", "annee":2023, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-retour-a-la-cabane-abandonnee/" },

  { "id":"exit-perils-en-terres-du-milieu", "titre":"EXIT – Périls en Terres du Milieu", "annee":2022, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-perils-en-terres-du-milieu/" },
  { "id":"exit-la-dame-de-la-brume", "titre":"EXIT – La Dame de la Brume", "annee":2022, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-la-dame-de-la-brume/" },
  { "id":"exit-le-labyrinthe-maudit", "titre":"EXIT – Le Labyrinthe Maudit", "annee":2022, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-labyrinthe-maudit/" },
  { "id":"exit-le-cimetiere-des-ombres", "titre":"EXIT – Le Cimetière des Ombres", "annee":2022, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-cimetiere-des-ombres/" },
  { "id":"exit-la-porte-entre-les-mondes", "titre":"EXIT – La Porte entre les Mondes", "annee":2022, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-la-porte-entre-les-mondes/" },

  { "id":"exit-puzzle-le-temple-perdu", "titre":"EXIT Puzzle – Le Temple Perdu", "annee":2021, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-puzzle-le-temple-perdu/" },  // <- Puzzles : si tu veux les retirer, je peux les enlever
  { "id":"exit-puzzle-le-phare-solitaire", "titre":"EXIT Puzzle – Le Phare Solitaire", "annee":2021, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-puzzle-le-phare-solitaire/" }, // idem

  { "id":"exit-le-vol-vers-linconnu", "titre":"EXIT – Le Vol vers l’Inconnu", "annee":2021, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-vol-vers-linconnu/" },
  { "id":"exit-laffaire-du-mississippi", "titre":"EXIT – L’Affaire du Mississippi", "annee":2021, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-laffaire-du-mississippi/" },

  { "id":"exit-la-maison-des-enigmes", "titre":"EXIT – La Maison des Énigmes", "annee":2020, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-la-maison-des-enigmes/" },
  { "id":"exit-le-parc-de-lhorreur", "titre":"EXIT – Le Parc de l’Horreur", "annee":2020, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-parc-de-lhorreur/" },
  { "id":"exit-les-catacombes-de-leffroi", "titre":"EXIT – Les Catacombes de l’Effroi", "annee":2020, "difficulte":"Expert", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-les-catacombes-de-leffroi/" },

  { "id":"exit-le-jeu-le-musee-mysterieux", "titre":"EXIT : Le Jeu – Le Musée Mystérieux", "annee":2019, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-musee-mysterieux/" },
  { "id":"exit-le-jeu-le-manoir-sinistre", "titre":"EXIT : Le Jeu – Le Manoir Sinistre", "annee":2019, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-manoir-sinistre/" },

  { "id":"exit-le-tresor-englouti", "titre":"EXIT – Le Trésor Englouti", "annee":2018, "difficulte":"Débutant", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-tresor-englouti/" },
  { "id":"exit-le-cadavre-de-lorient-express", "titre":"EXIT : Le Cadavre de l’Orient Express", "annee":2018, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-cadavre-de-lorient-express/" },
  { "id":"exit-le-jeu-lile-oubliee", "titre":"EXIT : Le Jeu – L’Île Oubliée", "annee":2018, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-lile-oubliee/" },
  { "id":"exit-le-jeu-le-chateau-interdit", "titre":"EXIT : Le Jeu – Le Château Interdit", "annee":2018, "difficulte":"Expert", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-chateau-interdit/" },
  { "id":"exit-le-jeu-la-station-polaire", "titre":"EXIT : Le Jeu – La Station Polaire", "annee":2018, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-la-station-polaire/" },

  { "id":"exit-le-jeu-le-laboratoire-secret", "titre":"EXIT : Le Jeu – Le Laboratoire Secret", "annee":2017, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-laboratoire-secret/" },
  { "id":"exit-le-jeu-le-tombeau-du-pharaon", "titre":"EXIT : Le Jeu – Le Tombeau du Pharaon", "annee":2017, "difficulte":"Expert", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-le-tombeau-du-pharaon/" },
  { "id":"exit-le-jeu-la-cabane-abandonnee", "titre":"EXIT : Le Jeu – La Cabane Abandonnée", "annee":2017, "difficulte":"Confirmé", "editeur":"IELLO", "imagePage":"iello.fr/jeux/exit-le-jeu-la-cabane-abandonnee/" }
];

// ---- démarrage ----
document.addEventListener('DOMContentLoaded', () => {
  setupPWA();
  render(GAMES);
});

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(SW_PATH).catch(console.error);
  }
}

function loadJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } }
function saveJSON(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

function render(games){
  const list = document.getElementById('gameList');
  const tpl = document.getElementById('gameItemTpl');
  list.innerHTML = '';

  const visible = games.slice().sort((a,b)=>{
    const ya=a.annee??0, yb=b.annee??0;
    if (yb!==ya) return yb-ya;
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
      updateStats(games.length);
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

  list.setAttribute('aria-busy','false');
  updateStats(games.length);
}

function updateStats(total){
  const doneCount = Object.keys(done).length;
  const pct = total ? Math.round(doneCount/total*100) : 0;
  document.getElementById('totalCount').textContent = total;
  document.getElementById('doneCount').textContent = doneCount;
  document.getElementById('progressPct').textContent = `${pct}%`;
}

function escapeHTML(s){ return s?.replace?.(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m])) ?? s; }

// récup de l’image via og:image de la page IELLO (proxy texte no-CORS)
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
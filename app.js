// Version de test ultra-simple — aucune image, aucune requête réseau
const APP_VERSION = '1.5.0';
const STORAGE_KEYS = { DONE:'exit_done_v1' };

let done = loadJSON(STORAGE_KEYS.DONE, {});

// Marqueur visuel "JS OK"
document.addEventListener('DOMContentLoaded', () => {
  const d = document.getElementById('debug');
  if (d) d.textContent = 'JS OK ✅ (v' + APP_VERSION + ')';
  render(GAMES);
});

function loadJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } }
function saveJSON(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

// Liste minimale (boîtes classiques)
const GAMES = [
  {"id":"exit-intrigue-a-venise","titre":"EXIT – Intrigue à Venise","annee":2025,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-course-poursuite-a-amsterdam","titre":"EXIT – Course Poursuite à Amsterdam","annee":2025,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-lacademie-de-magie","titre":"EXIT – L’Académie de Magie","annee":2024,"difficulte":"Débutant","editeur":"IELLO"},
  {"id":"exit-levasion-de-prison","titre":"EXIT – L’évasion de Prison","annee":2024,"difficulte":"Expert","editeur":"IELLO"},
  {"id":"exit-lheritage-du-voyageur","titre":"EXIT – L’héritage du Voyageur","annee":2024,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-la-disparition-de-sherlock-holmes","titre":"EXIT – La disparition de Sherlock Holmes","annee":2023,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-le-bandit-de-fortune-city","titre":"EXIT – Le Bandit de Fortune City","annee":2023,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-le-retour-a-la-cabane-abandonnee","titre":"EXIT – Le Retour à la Cabane Abandonnée","annee":2023,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-perils-en-terres-du-milieu","titre":"EXIT – Périls en Terres du Milieu","annee":2022,"difficulte":"Débutant","editeur":"IELLO"},
  {"id":"exit-le-cimetiere-des-ombres","titre":"EXIT – Le Cimetière des Ombres","annee":2022,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-la-porte-entre-les-mondes","titre":"EXIT – La Porte entre les Mondes","annee":2022,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-le-vol-vers-linconnu","titre":"EXIT – Le Vol vers l’Inconnu","annee":2021,"difficulte":"Débutant","editeur":"IELLO"},
  {"id":"exit-laffaire-du-mississippi","titre":"EXIT – L’Affaire du Mississippi","annee":2021,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-la-maison-des-enigmes","titre":"EXIT – La Maison des Énigmes","annee":2020,"difficulte":"Débutant","editeur":"IELLO"},
  {"id":"exit-le-parc-de-lhorreur","titre":"EXIT – Le Parc de l’Horreur","annee":2020,"difficulte":"Débutant","editeur":"IELLO"},
  {"id":"exit-les-catacombes-de-leffroi","titre":"EXIT – Les Catacombes de l’Effroi","annee":2020,"difficulte":"Expert","editeur":"IELLO"},
  {"id":"exit-le-jeu-le-musee-mysterieux","titre":"EXIT : Le Jeu – Le Musée Mystérieux","annee":2019,"difficulte":"Débutant","editeur":"IELLO"},
  {"id":"exit-le-jeu-le-manoir-sinistre","titre":"EXIT : Le Jeu – Le Manoir Sinistre","annee":2019,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-le-tresor-englouti","titre":"EXIT – Le Trésor Englouti","annee":2018,"difficulte":"Débutant","editeur":"IELLO"},
  {"id":"exit-le-jeu-le-chateau-interdit","titre":"EXIT : Le Jeu – Le Château Interdit","annee":2018,"difficulte":"Expert","editeur":"IELLO"},
  {"id":"exit-le-jeu-la-station-polaire","titre":"EXIT : Le Jeu – La Station Polaire","annee":2018,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-le-jeu-le-laboratoire-secret","titre":"EXIT : Le Jeu – Le Laboratoire Secret","annee":2017,"difficulte":"Confirmé","editeur":"IELLO"},
  {"id":"exit-le-jeu-le-tombeau-du-pharaon","titre":"EXIT : Le Jeu – Le Tombeau du Pharaon","annee":2017,"difficulte":"Expert","editeur":"IELLO"},
  {"id":"exit-le-jeu-la-cabane-abandonnee","titre":"EXIT : Le Jeu – La Cabane Abandonnée","annee":2017,"difficulte":"Confirmé","editeur":"IELLO"}
];

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
      updateStats(visible.length);
    });
    node.querySelector('.title').textContent = g.titre;
    node.querySelector('.meta').innerHTML = [
      g.difficulte ? `<span class="badge">${g.difficulte}</span>` : '',
      g.annee ? `• ${g.annee}` : '',
      g.editeur ? `• ${escapeHTML(g.editeur)}` : ''
    ].filter(Boolean).join(' ');
    list.appendChild(node);
  }
  list.setAttribute('aria-busy','false');
  updateStats(visible.length);
}

function updateStats(total){
  const doneCount = Object.keys(done).length;
  const pct = total ? Math.round(doneCount/total*100) : 0;
  document.getElementById('totalCount').textContent = total;
  document.getElementById('doneCount').textContent = doneCount;
  document.getElementById('progressPct').textContent = `${pct}%`;
}

function escapeHTML(s){ return s?.replace?.(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m])) ?? s; }
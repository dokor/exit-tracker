# exit-tracker

Petit tracker web (statique) pour suivre les jeux **EXIT** (IELLO) d’une liste partagée :
- état **Acheté**
- état **Réalisé**
- filtres par **difficulté**
- **PWA** (fonctionne hors-ligne pour l’UI)
- **sync temps réel** via **Firebase Firestore**

## Fonctionnement (vue d’ensemble)

### 1) Affichage de la liste
L’app affiche une grille de jeux (cartes) avec :
- titre, année, difficulté, éditeur
- une image de couverture (si disponible)
- 2 cases à cocher : **Acheté** / **Réalisé**
- stats globales (total / % achetés / % réalisés)

Le filtre par difficulté (Tout / Débutant / Confirmé / Expert) met à jour la liste et les stats.

### 2) Données des jeux
- La liste des jeux est actuellement **embarquée dans `index.html`** (tableau `GAMES`).
- Le dossier `data/` contient aussi `data/games.json` (pratique comme source de données), mais il n’est pas automatiquement chargé par l’UI à ce stade.

### 3) Images + cache local
- Si une URL d’image est connue, elle est utilisée directement.
- Sinon, l’app tente de “détecter” une image depuis la page du jeu (IELLO) en passant par un proxy texte pour éviter les problèmes CORS, puis :
    - extraction de `og:image` si présent
    - sinon sélection heuristique de la meilleure balise `<img>`

Les URLs d’images trouvées sont **mises en cache dans `localStorage`** (pour accélérer les chargements suivants).

### 4) États partagés (Firestore)
Les coches **Acheté/Réalisé** sont partagées en temps réel avec Firestore :
- une liste commune (par défaut `LIST_ID = "main"`)
- un document par jeu (id = `gameId`) dans une sous-collection de statuts

> Remarque : la configuration Firebase est “publique” côté navigateur (comportement standard Firebase Web).  
> La sécurité se fait via les **règles Firestore** (à configurer dans la console Firebase).

### 5) PWA / hors-ligne
- `sw.js` met en cache les fichiers essentiels pour que l’interface reste accessible hors-ligne.
- `manifest.webmanifest` permet l’installation sur mobile/desktop.

## Structure du projet

- `index.html` : UI + logique principale (filtre, rendu, Firestore, images)
- `style.css` : styles (si utilisé par la version courante)
- `sw.js` : service worker (cache PWA)
- `manifest.webmanifest` : manifest PWA
- `data/games.json` : données de jeux (source potentielle)
- `app.js` : version alternative / test (localStorage only)

## Lancer en local

Comme c’est une app statique, un serveur HTTP suffit (recommandé pour que le Service Worker fonctionne) :

- Via IntelliJ IDEA : ouvrir `index.html` avec un serveur / preview HTTP
- Ou via n’importe quel serveur statique (ex. extension “Live Server”, `python -m http.server`, etc.)

Ensuite ouvrir :
- `http://localhost:<PORT>/`

## Configuration Firebase (si vous dupliquez le projet)

Dans `index.html`, remplacer la config Firebase par la vôtre :
js const firebaseConfig = { apiKey: "<FIREBASE_API_KEY>", authDomain: " .firebaseapp.com", projectId: "  ", storageBucket: ".appspot.com", messagingSenderId: "  ", appId: "" };


Et vérifier les règles Firestore pour autoriser (ou non) l’écriture/lecture selon votre besoin.

## Idées d’amélioration (optionnel)
- Charger `data/games.json` au lieu de dupliquer la liste dans `index.html`
- Ajouter une page “admin” / import pour mettre à jour les jeux
- Ajouter une recherche (titre)
- Gérer plusieurs listes (plusieurs `LIST_ID`)
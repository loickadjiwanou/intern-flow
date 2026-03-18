# Guide de démarrage — InternFlow

InternFlow est un CRM de gestion de stagiaires fullstack composé d'un **frontend React** (port 3000) et d'un **backend Express/Node.js** (port 8001) connecté à **MongoDB**.

---

## Prérequis

- Node.js >= 18
- npm ou yarn
- MongoDB installé localement **ou** un compte MongoDB Atlas
- Git

---

## 1. Cloner le projet

```bash
git clone <url-du-repo>
cd intern-flow
```

---

## 2. Démarrer le Backend

### 2.1 Installer les dépendances

```bash
cd backend
npm install
```

### 2.2 Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `backend/` :

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=internflow

# JWT
JWT_SECRET=un_secret_tres_long_et_securise

# Serveur
PORT=8001
```

> Si tu utilises **MongoDB Atlas**, remplace `MONGO_URL` par ton URI de connexion Atlas :
> `MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net`

### 2.3 Lancer le serveur

**Mode développement** (avec rechargement automatique) :
```bash
npm run dev
```

**Mode production** :
```bash
npm start
```

Le backend sera disponible sur `http://localhost:8001`.

Confirmation dans le terminal :
```
✅ MongoDB connected successfully
✅ Server is running on port 8001
```

---

## 3. Démarrer le Frontend

### 3.1 Installer les dépendances

Ouvre un **nouveau terminal**, puis :

```bash
cd frontend
yarn install
```

> Si tu n'as pas yarn : `npm install -g yarn`

### 3.2 Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `frontend/` :

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

> Cette variable indique au frontend où se trouve l'API backend.

### 3.3 Lancer le serveur de développement

```bash
yarn start
```

L'application s'ouvrira automatiquement sur `http://localhost:3000`.

---

## 4. Connexion à l'application

Une fois les deux serveurs démarrés, utilise ce compte admin pour te connecter :

| Champ | Valeur |
|-------|--------|
| Email | `admin@internflow.com` |
| Mot de passe | `admin123` |

---

## 5. Structure des ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (React) | 3000 | http://localhost:3000 |
| Backend (Express) | 8001 | http://localhost:8001 |
| MongoDB (local) | 27017 | mongodb://localhost:27017 |

---

## 6. Scripts disponibles

### Backend (`backend/`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre en mode dev avec Nodemon (rechargement auto) |
| `npm start` | Démarre en mode production |

### Frontend (`frontend/`)

| Commande | Description |
|----------|-------------|
| `yarn start` | Démarre le serveur de développement |
| `yarn build` | Génère le build de production dans `/build` |
| `yarn test` | Lance les tests |

---

## 7. Erreurs courantes

**MongoDB ne se connecte pas**
- Vérifie que MongoDB est bien lancé : `mongod --version` puis `brew services start mongodb-community` (macOS)
- Vérifie que `MONGO_URL` et `DB_NAME` sont corrects dans `backend/.env`

**Erreur CORS / API inaccessible depuis le frontend**
- Vérifie que `REACT_APP_BACKEND_URL` dans `frontend/.env` pointe bien sur le port 8001
- Redémarre les deux serveurs après avoir modifié les `.env`

**`yarn: command not found`**
```bash
npm install -g yarn
```

**Port déjà utilisé**
```bash
# Trouver le processus qui utilise le port 8001
lsof -i :8001
kill -9 <PID>
```

# SOTRAL — Interface Web d'Administration

**Système d'Information Voyageurs**

Version Angular 17+ | Frontend TypeScript | Standalone Components | OpenStreetMap + Leaflet

---

## Vue d'ensemble

SOTRAL est la **plateforme centralisée de gestion du réseau de transport**. Cette interface web permet aux administrateurs de :

- 📊 **Voir les statistiques** du réseau (Dashboard)
- 🛤️ **Gérer les lignes** (création, modification, suppression)
- 📍 **Localiser les arrêts** sur une carte et les assigner aux lignes
- 🚌 **Administrer le parc de bus** et leurs statuts
- 🔗 **Créer des affectations** (bus ↔ ligne)
- 🗺️ **Suivre les bus en temps réel** sur une carte OpenStreetMap
- 👤 **Gérer les comptes** administrateurs et usagers
- 🔔 **Consulter l'historique des notifications**

## Architecture

### Stack Technologique

| Composant | Détail |
|-----------|--------|
| **Framework** | Angular 17+ avec Standalone Components |
| **Langage** | TypeScript |
| **Styling** | SCSS avec variables CSS SOTRAL |
| **Carte** | OpenStreetMap + Leaflet (ngx-leaflet) |
| **HTTP** | HttpClient avec JWT Interceptor |
| **Sécurité** | AuthGuard + JWT en mémoire |
| **Routing** | Lazy loading des pages |

### Couleurs de Marque

```
🟢 Vert SOTRAL    : #1A7A3F  ← Boutons primaires, sidebar
🔴 Rouge SOTRAL   : #C0392B  ← Suppression, alertes
⚪ Blanc SOTRAL   : #FFFFFF  ← Fond principal
⚙️  Gris clair    : #F5F5F5  ← Fond pages
📐 Gris bordure   : #E0E0D0  ← Séparateurs
⚫ Noir texte     : #212121  ← Texte courant
```

## Installation

### Prérequis

- Node.js 18+
- npm 9+
- Angular CLI 21+

### Étapes

```bash
# 1. Cloner le repository
git clone <repository-url>
cd SmartSotralfront

# 2. Installer les dépendances
npm install

# 3. Installer Leaflet pour la carte
npm install leaflet @types/leaflet ngx-leaflet

# 4. (Optionnel) Installer Angular Material pour les composants UI
ng add @angular/material

# 5. Démarrer le serveur de développement
npm start
```

L'application sera accessible à **http://localhost:4200**.

## Structure du Projet

```
src/
├── app/
│   ├── core/                          ← Services, guards, interceptors
│   │   ├── guards/auth.guard.ts
│   │   ├── interceptors/jwt.interceptor.ts
│   │   └── services/
│   │       ├── base.service.ts        ← CRUD générique
│   │       ├── auth.service.ts        ← Authentification
│   │       ├── bus.service.ts
│   │       ├── ligne.service.ts
│   │       ├── arret.service.ts
│   │       ├── affectation.service.ts
│   │       ├── compte.service.ts
│   │       ├── position-gps.service.ts
│   │       ├── prediction.service.ts
│   │       └── notification.service.ts
│   ├── shared/                        ← Composants & Modèles réutilisables
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   ├── header/
│   │   │   ├── data-table/
│   │   │   ├── badge/
│   │   │   ├── modal/
│   │   │   └── confirm-dialog/
│   │   └── models/
│   │       ├── auth.model.ts
│   │       ├── ligne.model.ts
│   │       ├── arret.model.ts
│   │       ├── bus.model.ts
│   │       ├── affectation.model.ts
│   │       ├── compte.model.ts
│   │       ├── position-gps.model.ts
│   │       ├── prediction.model.ts
│   │       ├── notification.model.ts
│   │       └── ligne-arret.model.ts
│   ├── pages/                         ← Pages/Composants d'application
│   │   ├── auth/login/
│   │   ├── dashboard/
│   │   ├── lignes/
│   │   ├── arrets/
│   │   ├── bus/
│   │   ├── affectations/
│   │   ├── suivi-carte/
│   │   ├── comptes/
│   │   └── notifications/
│   ├── app.routes.ts                  ← Configuration du routing
│   ├── app.config.ts                  ← Configuration globale
│   ├── app.ts                         ← Bootstrap
│   └── layout.component.ts            ← Layout principal (Sidebar + Header)
├── environments/
│   ├── environment.ts                 ← Configuration dev
│   └── environment.prod.ts            ← Configuration production
├── styles.scss                        ← Styles globaux + variables SOTRAL
└── index.html

```

## Endpoints API Attendus

L'application communique avec un backend Spring Boot. Endpoints requis :

### Authentification
- `POST /api/auth/login` → `{ token, admin }`

### Lignes
- `GET /api/lignes` → Liste toutes les lignes
- `POST /api/lignes` → Créer une ligne
- `PUT /api/lignes/{id}` → Modifier
- `DELETE /api/lignes/{id}` → Supprimer
- `GET /api/lignes/{id}/arrets` → Arrêts d'une ligne

### Arrêts
- `GET /api/arrets` → Liste
- `POST /api/arrets` → Créer
- `PUT /api/arrets/{id}` → Modifier
- `DELETE /api/arrets/{id}` → Supprimer
- `POST /api/ligne-arrets` → Assigner à une ligne
- `DELETE /api/ligne-arrets/{id}` → Désassigner

### Bus
- `GET /api/bus` → Liste
- `POST /api/bus` → Créer
- `PUT /api/bus/{id}` → Modifier
- `DELETE /api/bus/{id}` → Supprimer
- `PATCH /api/bus/{id}/statut` → Changer statut
- `GET /api/bus/stats` → Statistiques

### Affectations
- `GET /api/affectations` → Liste
- `GET /api/affectations/actives` → Affectations en cours
- `POST /api/affectations` → Créer
- `PATCH /api/affectations/{id}/terminer` → Terminer

### Positions GPS & Prédictions
- `GET /api/positions/dernieres` → Positions actuelles des bus
- `GET /api/predictions/arret/{id}` → Prédictions d'arrivée

### Comptes
- `GET /api/comptes` → Liste
- `POST /api/comptes` → Créer admin
- `PATCH /api/comptes/{id}/statut` → Actif/Suspendu
- `DELETE /api/comptes/{id}` → Supprimer

### Notifications
- `GET /api/notifications` → Historique
- `GET /api/notifications/recent` → Récentes
- `GET /api/notifications?statut=ECHEC` → Filtrées
- `PATCH /api/notifications/{id}/reessayer` → Renvoyer

## Commandes de Développement

```bash
# Démarrer le serveur
npm start

# Build production
npm run build

# Tests unitaires
npm run test

# Linter
npm run lint

# Générer un composant
ng generate component shared/components/mon-composant --standalone

# Générer un service
ng generate service core/services/mon-service
```

## Configuration du Proxy (Développement)

Un fichier `proxy.conf.json` doit être créé pour éviter les problèmes CORS :

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Démarrer avec : `ng serve --proxy-config proxy.conf.json`

## Guide d'Implémentation

Voir [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) pour :
- État détaillé du projet
- Checklist des pages restantes à compléter
- Améliorations UI/UX recommandées
- Prochaines étapes

## Authentification

### Flux de Connexion

1. Utilisateur accède à `/login`
2. Entre email + mot de passe
3. Appelle `POST /api/auth/login` via AuthService
4. Backend retourne JWT token + profil admin
5. Token stocké **en mémoire** (pas localStorage)
6. Redirection vers `/dashboard`
7. AuthGuard protège toutes les autres routes

### Stockage du Token

⚠️ **Important** : Le JWT est stocké **uniquement en mémoire** pour la sécurité de l'admin. 
- Avantage : Pas d'accès XSS au token
- Inconvénient : Actualisation page =  déconnexion

### JwtInterceptor

Automatiquement, chaque requête HTTP reçoit :
```
Authorization: Bearer {token}
```

## Page Suivi-Carte (Leaflet)

La page `/suivi-carte` affiche une carte OpenStreetMap avec :
- ✅ Marqueurs des bus (mis à jour toutes les 5s)
- ✅ Panneau latéral avec liste des bus
- ✅ Marqueurs des arrêts (optionnel)
- ✅ Prédictions d'arrivée au clic sur un arrêt

Configuration Leaflet dans `angular.json` :

```json
"styles": [
  "node_modules/leaflet/dist/leaflet.css"
]
```

## Dépannage

### Erreur `Can't resolve '@asymmetrik/ngx-leaflet'`
```bash
npm install @asymmetrik/ngx-leaflet
```

### Erreur CORS lors des appels API
→ Configurer `proxy.conf.json` et utiliser `ng serve --proxy-config proxy.conf.json`

### Authentification 401 Unauthorized
→ Vérifier que le token est bien ajouté dans les en-têtes (JwtInterceptor)

### Token expiré
→ Implémenter un refresh token ou redemander la connexion

## Déploiement

### Production Build

```bash
npm run build
```

Fichiers générés dans `dist/smart-sotralfront/`

### Serveur Web

```bash
# Avec Node.js express
npx http-server dist/smart-sotralfront

# Ou utiliser Nginx/Apache
```

## Contribution

1. Créer une branche pour votre feature
2. Respecter la structure Angular
3. Tester avant de commiter
4. Utiliser les variables CSS SOTRAL

## Documentation Externe

- [Angular Documentation](https://angular.dev)
- [Leaflet Documentation](https://leafletjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Créé le**: 13 mars 2026  
**Maintenu par**: Équipe SOTRAL  
**License**: Propriétaire SOTRAL

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


• Fichier ajouté : observation.md à la racine. Il résume tous les écarts front/
  back et les champs attendus par l’API Spring.

  Ce qu’il faut faire pour lier correctement les modèles au backend (DB) :

  - Identifiants : passer toutes les opérations get/update/delete sur les
    services vers des trackingId: string (UUID). Le backend n’utilise pas d’ID
    numériques en écriture.
  - Modèles TypeScript à réaligner sur les DTO Spring :
      - Bus → { id, trackingId, code }.
      - Nouveau Vehicule → { id, trackingId, matricule, marque, modele, statut:
        DISPONIBLE|EN_SERVICE|EN_MAINTENANCE }.
      - BusVehicule → { id, trackingId, busTrackingId, vehiculeTrackingId,
        statut }.
      - Ligne → { id, trackingId, numero, depart, arrive,
        typeLigneTrackingId }; TypeLigne → { id, trackingId, nom }.
      - Arret → { id, trackingId, nom, latitude, longitude }; LigneArret →
        { id, trackingId, ligneTrackingId, arretTrackingId, ordre }.
      - Mission (remplace l’actuelle “Affectation”) → { id, trackingId,
        busVehiculeTrackingId, conducteurTrackingId, dateDebut, dateFin,
        statut: ACTIVE|TERMINEE }.
      - Prediction → { id, trackingId, busTrackingId, arretTrackingId,
        distanceRestanteKm, tempsRestantMinutes, heureEstimeeArrivee,
        horodatage }.
      - Temps réel : CapteurResponse et PositionBusDTO (positions des bus
        actifs) plutôt que le modèle PositionGPS actuel.
      - Auth : LoginResponse fournit trackingId, token, type, firstName,
        lastName, phone, email, roles, rolesList, country, active.
  - Services à repointer sur les bons endpoints :
      - /api/bus, /api/vehicules, /api/bus-vehicules
      - /api/lignes, /api/type-lignes, /api/ligne-arrets, /api/arrets
      - /api/missions (remplace /affectations inexistant)
      - /api/capteurs/… pour la carte : dernieres, dernieres/ligne/
        {trackingId}, dernieres/arret/{trackingId}
      - /api/predictions/arret/{trackingId}, /api/predictions/bus/{trackingId}
      - /api/users pour login, register, liste paginée, patch état.
  - Pages à ajuster / mettre en pause :
      - pages/affectations → basculer sur missions + sélection bus-vehicule.
      - pages/notifications → aucune API côté backend ; désactiver ou stub tant
        que la partie Spring n’est pas développée.
      - pages/comptes → utiliser /api/users/all et PATCH /api/users/etat/
        {trackingId}?etat=true|false.
      - suivi-carte → consommer les DTO de positions réelles (capteurs) et les
        UUID.
  - Vérifs rapides : garder environment.apiUrl = http://localhost:8080/api, la
    ncer avec proxy (ng serve --proxy-config proxy.conf.json), tester le flux
    login → bus → missions → capteurs → prédictions.

  Si tu veux, je peux appliquer ces changements aux modèles/services ou
  détailler page par page à partir des fichiers concernés.

# Observations de synchronisation front/back — 14 mars 2026

- Identifiants : toutes les routes Spring utilisent `trackingId` (UUID) pour lire,
  mettre à jour ou supprimer. Le `BaseService` front doit donc accepter un
  `string trackingId` pour `get/update/delete`. Endpoints CRUD principaux :
  `/api/bus`, `/api/arrets`, `/api/lignes`, `/api/type-lignes`,
  `/api/ligne-arrets`, `/api/vehicules`, `/api/bus-vehicules`, `/api/capteurs`,
  `/api/predictions`, `/api/missions`, `/api/courses`.

- Modèles à corriger côté front pour coller aux DTO Spring :
  - **Bus** : {id, trackingId, code}. Les champs immatriculation/marque/modèle
    appartiennent au modèle **Vehicule**.
  - **Vehicule** : {id, trackingId, matricule, marque, modele, statut:
    DISPONIBLE|EN_SERVICE|EN_MAINTENANCE}.
  - **BusVehicule** : {id, trackingId, busTrackingId, vehiculeTrackingId, statut}.
  - **Ligne** : {id, trackingId, numero, depart, arrive, typeLigneTrackingId};
    **TypeLigne** : {id, trackingId, nom}.
  - **Arret** : {id, trackingId, nom, latitude, longitude}; **LigneArret** :
    {id, trackingId, ligneTrackingId, arretTrackingId, ordre}.
  - **Mission** (remplace l’« Affectation » front) :
    {id, trackingId, busVehiculeTrackingId, conducteurTrackingId, dateDebut,
    dateFin, statut: ACTIVE|TERMINEE}.
  - **Prediction** : {id, trackingId, busTrackingId, arretTrackingId,
    distanceRestanteKm, tempsRestantMinutes, heureEstimeeArrivee, horodatage}.
  - **Capteur/Positions temps réel** : CapteurResponse
    {id, trackingId, vehiculeTrackingId, latitude, longitude, vitesse, cap,
    horodatage, sourceSignal}; PositionBusDTO {vehiculeTrackingId,
    busTrackingId, busCode, latitude, longitude, vitesse, horodatage,
    missionActive}.
  - **Auth/LoginResponse** : trackingId, token, type, firstName, lastName, phone,
    email, roles, rolesList, country, active.

- Pages à ré-aligner faute d’API existante ou de modèle divergeant :
  - `pages/affectations` : aucune route `/affectations` côté Spring. Basculer
    vers `/api/missions` (+ `/api/bus-vehicules` pour choisir le couple
    bus/véhicule) et utiliser des trackingId.
  - `pages/notifications` : aucune API notification dans le backend actuel ;
    page à désactiver ou à stub tant que la partie Spring n’existe pas.
  - `CompteService` : doit cibler `/api/users` (login, register, all, patch
    `/etat?etat=true|false`) au lieu de `/comptes`.
  - `PositionGPSService` & Suivi-Carte : utiliser `/api/capteurs/dernieres`,
    `/dernieres/ligne/{ligneTrackingId}`, `/dernieres/arret/{arretTrackingId}`;
    identifiants en UUID.
  - `PredictionService` : appeler `/api/predictions/arret/{arretTrackingId}`
    (UUID) et aligner le modèle sur les champs backend.

- Vérifs rapides à faire dès les ajustements :
  1) confirmer `environment.apiUrl` si le backend tourne ailleurs que
     `http://localhost:8080/api`;
  2) lancer `ng serve --proxy-config proxy.conf.json` pour éviter le CORS ;
  3) tester un flux complet : login → GET /bus → POST /missions →
     GET /capteurs/dernieres → GET /predictions/arret/{id}.

export type BusStatut = 'EN_SERVICE' | 'EN_PANNE' | 'HORS_SERVICE' | 'EN_RETARD';

// Aligne le modèle front sur le DTO backend (BusResponse) tout en gardant
// certains champs optionnels hérités de l'ancienne maquette pour éviter
// de casser l'UI actuelle.
export interface Bus {
  id?: number;
  trackingId?: string;
  code?: string;

  // Champs legacy utilisés par l'UI actuelle (optionnels)
  immatriculation?: string;
  marque?: string;
  modele?: string;
  capacite?: number;
  annee?: number;
  statut?: BusStatut;
  ligneTrackingId?: string;
  createdAt?: string;
  updatedAt?: string;
}

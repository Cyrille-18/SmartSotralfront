export type MissionStatut = 'ACTIVE' | 'TERMINEE' | 'TERMINÉE' | 'PLANIFIÉE' | 'EN_COURS' | 'ANNULÉE';

// Aligné sur MissionResponse backend
export interface Mission {
  id?: number;
  trackingId?: string;
  busVehiculeTrackingId?: string;
  conducteurTrackingId?: string;
  dateDebut?: string; // ISO datetime
  dateFin?: string;  // ISO datetime
  statut: MissionStatut;
  createdAt?: string;
  updatedAt?: string;

  // Champs legacy pour compat UI actuelle
  busTrackingId?: string;
  ligneTrackingId?: string;
  dateTrajet?: string;
  heureDepart?: string;
  heureArriveeEstimee?: string;
}

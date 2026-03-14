export type AffectationStatut = 'ACTIVE' | 'TERMINEE';

export interface Affectation {
  id?: number;
  trackingId?: string;
  busId: number;
  ligneId: number;
  dateDebut: string;
  dateFin?: string;
  statut: AffectationStatut;
}

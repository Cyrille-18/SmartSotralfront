export type AffectationStatut = 'ACTIVE' | 'TERMINEE';

export interface Affectation {
  id?: number;
  busId: number;
  ligneId: number;
  dateDebut: string;
  dateFin?: string;
  statut: AffectationStatut;
}

export type CompteRole = 'ADMIN' | 'USAGER' | 'CONDUCTEUR';
export type CompteStatut = 'ACTIF' | 'SUSPENDU';

export interface Compte {
  id?: number;
  trackingId?: string;
  nom: string;
  prenom?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  telephone?: string;
  role: CompteRole;
  statut: CompteStatut;
  dateCreation?: string;
  motDePasse?: string;
  createdAt?: string;
  updatedAt?: string;
}

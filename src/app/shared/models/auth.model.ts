export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  trackingId: string;
  token: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roles: string;
  rolesList: string[];
  country: string;
  active: boolean;
}

export type CompteRole = 'ADMIN' | 'CONDUCTEUR' | 'USAGER';

export interface Compte {
  id?: number;
  trackingId?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email: string;
  role: CompteRole;
  country?: string;
  active?: boolean;
  statut?: 'ACTIF' | 'SUSPENDU';
  dateCreation?: string;
}

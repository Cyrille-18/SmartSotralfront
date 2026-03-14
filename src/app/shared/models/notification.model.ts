export type NotificationStatut = 'ENVOYEE' | 'ECHEC' | 'EN_ATTENTE';
export type NotificationSeuil = '5km' | '3km' | '2km' | '1km';

export interface Notification {
  id?: number;
  compteId: number;
  busId: number;
  arretId: number;
  seuil: NotificationSeuil;
  statut: NotificationStatut;
  dateEnvoi: string;
}

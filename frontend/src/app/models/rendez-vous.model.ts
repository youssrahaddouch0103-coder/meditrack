export type StatutRendezVous = 'EN_ATTENTE' | 'CONFIRME' | 'REFUSE' | 'ANNULE';

export interface CreationRendezVousRequest {
  nomComplet: string;
  telephone: string;
  email: string;
  soin: string;
  dateSouhaitee: string; // Format YYYY-MM-DD
  heureSouhaitee: string; // Format HH:mm
  message?: string;
}

export interface RendezVousResponse {
  id: number;
  nomComplet: string;
  telephone: string;
  email: string;
  soin: string;
  dateSouhaitee: string;
  heureSouhaitee: string;
  message?: string;
  statut: StatutRendezVous;
  motifRefus?: string;
  dateCreation: string;
  dateModification: string;
  notificationEnvoyee?: boolean;
  notificationWarning?: string;
}

export interface RefusRendezVousRequest {
  motifRefus?: string;
}

export interface CreationMessageContactRequest {
  nomComplet: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
}

export interface MessageContactResponse {
  id: number;
  nomComplet: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  dateEnvoi: string;
  lu: boolean;
}

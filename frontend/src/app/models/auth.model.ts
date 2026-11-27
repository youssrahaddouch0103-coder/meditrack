export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface JwtAuthResponse {
  token: string;
  tokenType: string;
  email: string;
  role: string;
}

export interface GenericResponse {
  success: boolean;
  message: string;
}

export interface AdminAccountInfoResponse {
  id: number;
  nom: string;
  loginEmail: string;
  role: string;
  actif: boolean;
  dateCreation: string;
  dateModification: string;
  activeRecoveryCodesCount: number;
}

export interface EmergencyCodesResponse {
  codes: string[];
  warning: string;
}

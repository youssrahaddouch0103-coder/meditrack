package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EmergencyRecoveryRequest {

    @NotBlank(message = "Le code de récupération d'urgence est obligatoire")
    private String recoveryCode;

    @NotBlank(message = "La nouvelle adresse e-mail de connexion est obligatoire")
    @Email(message = "Format d'adresse e-mail invalide")
    private String newLoginEmail;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 6, max = 100, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String newPassword;

    public EmergencyRecoveryRequest() {
    }

    public EmergencyRecoveryRequest(String recoveryCode, String newLoginEmail, String newPassword) {
        this.recoveryCode = recoveryCode;
        this.newLoginEmail = newLoginEmail;
        this.newPassword = newPassword;
    }

    public String getRecoveryCode() {
        return recoveryCode;
    }

    public void setRecoveryCode(String recoveryCode) {
        this.recoveryCode = recoveryCode;
    }

    public String getNewLoginEmail() {
        return newLoginEmail;
    }

    public void setNewLoginEmail(String newLoginEmail) {
        this.newLoginEmail = newLoginEmail;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

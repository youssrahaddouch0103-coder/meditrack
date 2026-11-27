package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateLoginEmailRequest {

    @NotBlank(message = "Le nouvel email de connexion est obligatoire")
    @Email(message = "Format d'email invalide")
    private String newLoginEmail;

    @NotBlank(message = "Le mot de passe actuel est obligatoire pour des raisons de sécurité")
    private String currentPassword;

    public UpdateLoginEmailRequest() {
    }

    public String getNewLoginEmail() {
        return newLoginEmail;
    }

    public void setNewLoginEmail(String newLoginEmail) {
        this.newLoginEmail = newLoginEmail;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
}

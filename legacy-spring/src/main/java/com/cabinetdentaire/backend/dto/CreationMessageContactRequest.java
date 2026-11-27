package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreationMessageContactRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit comporter entre 2 et 100 caractères")
    private String nomComplet;

    @NotBlank(message = "L'adresse e-mail est obligatoire")
    @Email(message = "Format d'adresse e-mail invalide")
    private String email;

    @Pattern(regexp = "^$|^[0-9\\s\\+\\-\\.\\(\\)]{8,20}$", message = "Format de téléphone invalide")
    private String telephone;

    @NotBlank(message = "Le sujet est obligatoire")
    @Size(max = 150, message = "Le sujet ne peut pas dépasser 150 caractères")
    private String sujet;

    @NotBlank(message = "Le message est obligatoire")
    @Size(min = 5, max = 2000, message = "Le message doit comporter entre 5 et 2000 caractères")
    private String message;

    public CreationMessageContactRequest() {
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getSujet() {
        return sujet;
    }

    public void setSujet(String sujet) {
        this.sujet = sujet;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

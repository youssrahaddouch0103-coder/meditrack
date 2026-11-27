package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public class CreationRendezVousRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit comporter entre 2 et 100 caractères")
    private String nomComplet;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^[0-9\\s\\+\\-\\.\\(\\)]{8,20}$", message = "Format de téléphone invalide")
    private String telephone;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "Format d'adresse email invalide")
    private String email;

    @NotBlank(message = "Le soin souhaité est obligatoire")
    private String soin;

    @NotNull(message = "La date souhaitée est obligatoire")
    @FutureOrPresent(message = "La date souhaitée doit être aujourd'hui ou dans le futur")
    private LocalDate dateSouhaitee;

    @NotNull(message = "L'heure souhaitée est obligatoire")
    private LocalTime heureSouhaitee;

    @Size(max = 500, message = "Le message ne peut pas dépasser 500 caractères")
    private String message;

    public CreationRendezVousRequest() {
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSoin() {
        return soin;
    }

    public void setSoin(String soin) {
        this.soin = soin;
    }

    public LocalDate getDateSouhaitee() {
        return dateSouhaitee;
    }

    public void setDateSouhaitee(LocalDate dateSouhaitee) {
        this.dateSouhaitee = dateSouhaitee;
    }

    public LocalTime getHeureSouhaitee() {
        return heureSouhaitee;
    }

    public void setHeureSouhaitee(LocalTime heureSouhaitee) {
        this.heureSouhaitee = heureSouhaitee;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

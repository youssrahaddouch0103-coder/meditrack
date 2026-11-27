package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreationAvisRequest {

    @NotBlank(message = "Le nom ou prénom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nomAuteur;

    @NotNull(message = "La note globale est obligatoire")
    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    private Integer note;

    @NotBlank(message = "Le soin concerné est obligatoire")
    @Size(max = 150, message = "Le soin concerné ne peut pas dépasser 150 caractères")
    private String soinConcerne;

    @NotBlank(message = "Le commentaire est obligatoire")
    @Size(min = 5, max = 500, message = "Le commentaire doit comporter entre 5 et 500 caractères")
    private String commentaire;

    public CreationAvisRequest() {
    }

    public String getNomAuteur() {
        return nomAuteur;
    }

    public void setNomAuteur(String nomAuteur) {
        this.nomAuteur = nomAuteur;
    }

    public Integer getNote() {
        return note;
    }

    public void setNote(Integer note) {
        this.note = note;
    }

    public String getSoinConcerne() {
        return soinConcerne;
    }

    public void setSoinConcerne(String soinConcerne) {
        this.soinConcerne = soinConcerne;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}

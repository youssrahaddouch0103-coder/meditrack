package com.cabinetdentaire.backend.dto;

import com.cabinetdentaire.backend.entity.StatutSoin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreationSoinRequest {

    @NotBlank(message = "Le titre du soin est obligatoire")
    @Size(min = 2, max = 150, message = "Le titre doit contenir entre 2 et 150 caractères")
    private String titre;

    @NotBlank(message = "La description courte est obligatoire")
    @Size(max = 500, message = "La description courte ne peut pas dépasser 500 caractères")
    private String descriptionCourte;

    @NotBlank(message = "La description détaillée est obligatoire")
    private String descriptionDetaillee;

    private String photoCouvertureAlt;

    private Integer ordreAffichage;

    private StatutSoin statut = StatutSoin.PUBLIE;

    public CreationSoinRequest() {
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescriptionCourte() {
        return descriptionCourte;
    }

    public void setDescriptionCourte(String descriptionCourte) {
        this.descriptionCourte = descriptionCourte;
    }

    public String getDescriptionDetaillee() {
        return descriptionDetaillee;
    }

    public void setDescriptionDetaillee(String descriptionDetaillee) {
        this.descriptionDetaillee = descriptionDetaillee;
    }

    public String getPhotoCouvertureAlt() {
        return photoCouvertureAlt;
    }

    public void setPhotoCouvertureAlt(String photoCouvertureAlt) {
        this.photoCouvertureAlt = photoCouvertureAlt;
    }

    public Integer getOrdreAffichage() {
        return ordreAffichage;
    }

    public void setOrdreAffichage(Integer ordreAffichage) {
        this.ordreAffichage = ordreAffichage;
    }

    public StatutSoin getStatut() {
        return statut;
    }

    public void setStatut(StatutSoin statut) {
        this.statut = statut;
    }
}

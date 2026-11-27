package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CreationMembreEquipeRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;

    @NotBlank(message = "Le titre ou fonction est obligatoire")
    private String titre;

    private String specialite;

    private String description;

    private String photoAlt;

    @Min(value = 0, message = "L'ordre d'affichage doit être supérieur ou égal à 0")
    private Integer ordreAffichage = 0;

    private Boolean actif = true;

    @Pattern(regexp = "^(https?://.*)?$", message = "L'URL Instagram doit être valide et commencer par http:// ou https://")
    private String instagramUrl;

    @Pattern(regexp = "^(https?://.*)?$", message = "L'URL LinkedIn doit être valide et commencer par http:// ou https://")
    private String linkedinUrl;

    public CreationMembreEquipeRequest() {
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoAlt() {
        return photoAlt;
    }

    public void setPhotoAlt(String photoAlt) {
        this.photoAlt = photoAlt;
    }

    public Integer getOrdreAffichage() {
        return ordreAffichage;
    }

    public void setOrdreAffichage(Integer ordreAffichage) {
        this.ordreAffichage = ordreAffichage;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
}

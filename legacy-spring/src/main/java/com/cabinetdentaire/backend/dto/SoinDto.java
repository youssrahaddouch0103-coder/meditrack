package com.cabinetdentaire.backend.dto;

import com.cabinetdentaire.backend.entity.Soin;
import com.cabinetdentaire.backend.entity.StatutSoin;
import java.time.LocalDateTime;

public class SoinDto {

    private Long id;
    private String codeSlug;
    private String titre;
    private String descriptionCourte;
    private String descriptionDetaillee;
    private String photoCouvertureUrl;
    private String photoCouvertureAlt;
    private Integer ordreAffichage;
    private StatutSoin statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    public SoinDto() {
    }

    public SoinDto(Soin entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.codeSlug = entity.getCodeSlug();
            this.titre = entity.getTitre();
            this.descriptionCourte = entity.getDescriptionCourte();
            this.descriptionDetaillee = entity.getDescriptionDetaillee();
            this.photoCouvertureUrl = entity.getPhotoCouvertureUrl();
            this.photoCouvertureAlt = entity.getPhotoCouvertureAlt();
            this.ordreAffichage = entity.getOrdreAffichage();
            this.statut = entity.getStatut();
            this.dateCreation = entity.getDateCreation();
            this.dateModification = entity.getDateModification();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodeSlug() {
        return codeSlug;
    }

    public void setCodeSlug(String codeSlug) {
        this.codeSlug = codeSlug;
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

    public String getPhotoCouvertureUrl() {
        return photoCouvertureUrl;
    }

    public void setPhotoCouvertureUrl(String photoCouvertureUrl) {
        this.photoCouvertureUrl = photoCouvertureUrl;
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

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }
}

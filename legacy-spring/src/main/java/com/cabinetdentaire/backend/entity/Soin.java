package com.cabinetdentaire.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soins", indexes = {
    @Index(name = "idx_soins_code_slug", columnList = "code_slug", unique = true),
    @Index(name = "idx_soins_statut_ordre", columnList = "statut, ordre_affichage")
})
public class Soin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_slug", nullable = false, unique = true, length = 100)
    private String codeSlug;

    @Column(name = "titre", nullable = false, length = 150)
    private String titre;

    @Column(name = "description_courte", nullable = false, length = 500)
    private String descriptionCourte;

    @Column(name = "description_detaillee", nullable = false, columnDefinition = "TEXT")
    private String descriptionDetaillee;

    @Column(name = "photo_couverture_url", length = 500)
    private String photoCouvertureUrl;

    @Column(name = "photo_couverture_alt", length = 255)
    private String photoCouvertureAlt;

    @Column(name = "ordre_affichage", nullable = false)
    private Integer ordreAffichage = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutSoin statut = StatutSoin.PUBLIE;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification = LocalDateTime.now();

    public Soin() {
    }

    public Soin(String codeSlug, String titre, String descriptionCourte, String descriptionDetaillee, String photoCouvertureUrl, String photoCouvertureAlt, Integer ordreAffichage, StatutSoin statut) {
        this.codeSlug = codeSlug;
        this.titre = titre;
        this.descriptionCourte = descriptionCourte;
        this.descriptionDetaillee = descriptionDetaillee;
        this.photoCouvertureUrl = photoCouvertureUrl;
        this.photoCouvertureAlt = photoCouvertureAlt;
        this.ordreAffichage = ordreAffichage != null ? ordreAffichage : 0;
        this.statut = statut != null ? statut : StatutSoin.PUBLIE;
        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.dateModification = LocalDateTime.now();
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

package com.cabinetdentaire.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "avis")
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nom_auteur", nullable = false, length = 100)
    private String nomAuteur;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "note", nullable = false)
    private Integer note;

    @NotBlank
    @Size(max = 150)
    @Column(name = "soin_concerne", nullable = false, length = 150)
    private String soinConcerne;

    @NotBlank
    @Size(max = 500)
    @Column(name = "commentaire", nullable = false, length = 500)
    private String commentaire;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutAvis statut = StatutAvis.EN_ATTENTE;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    public Avis() {
    }

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutAvis.EN_ATTENTE;
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public StatutAvis getStatut() {
        return statut;
    }

    public void setStatut(StatutAvis statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateDecision() {
        return dateDecision;
    }

    public void setDateDecision(LocalDateTime dateDecision) {
        this.dateDecision = dateDecision;
    }
}

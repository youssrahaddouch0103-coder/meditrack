package com.cabinetdentaire.backend.dto;

import com.cabinetdentaire.backend.entity.Avis;
import com.cabinetdentaire.backend.entity.StatutAvis;
import java.time.LocalDateTime;

public class AvisResponse {

    private Long id;
    private String nomAuteur;
    private Integer note;
    private String soinConcerne;
    private String commentaire;
    private StatutAvis statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDecision;

    public AvisResponse() {
    }

    public static AvisResponse fromEntity(Avis entity) {
        AvisResponse dto = new AvisResponse();
        dto.setId(entity.getId());
        dto.setNomAuteur(entity.getNomAuteur());
        dto.setNote(entity.getNote());
        dto.setSoinConcerne(entity.getSoinConcerne());
        dto.setCommentaire(entity.getCommentaire());
        dto.setStatut(entity.getStatut());
        dto.setDateCreation(entity.getDateCreation());
        dto.setDateDecision(entity.getDateDecision());
        return dto;
    }

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

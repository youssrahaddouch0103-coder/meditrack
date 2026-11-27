package com.cabinetdentaire.backend.dto;

import com.cabinetdentaire.backend.entity.RendezVous;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class RendezVousResponse {

    private Long id;
    private String nomComplet;
    private String telephone;
    private String email;
    private String soin;
    private LocalDate dateSouhaitee;
    private LocalTime heureSouhaitee;
    private String message;
    private StatutRendezVous statut;
    private String motifRefus;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private Boolean notificationEnvoyee;
    private String notificationWarning;

    public RendezVousResponse() {
    }

    public static RendezVousResponse fromEntity(RendezVous rdv) {
        RendezVousResponse dto = new RendezVousResponse();
        dto.setId(rdv.getId());
        dto.setNomComplet(rdv.getNomComplet());
        dto.setTelephone(rdv.getTelephone());
        dto.setEmail(rdv.getEmail());
        dto.setSoin(rdv.getSoin());
        dto.setDateSouhaitee(rdv.getDateSouhaitee());
        dto.setHeureSouhaitee(rdv.getHeureSouhaitee());
        dto.setMessage(rdv.getMessage());
        dto.setStatut(rdv.getStatut());
        dto.setMotifRefus(rdv.getMotifRefus());
        dto.setDateCreation(rdv.getDateCreation());
        dto.setDateModification(rdv.getDateModification());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public StatutRendezVous getStatut() {
        return statut;
    }

    public void setStatut(StatutRendezVous statut) {
        this.statut = statut;
    }

    public String getMotifRefus() {
        return motifRefus;
    }

    public void setMotifRefus(String motifRefus) {
        this.motifRefus = motifRefus;
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

    public Boolean getNotificationEnvoyee() {
        return notificationEnvoyee;
    }

    public void setNotificationEnvoyee(Boolean notificationEnvoyee) {
        this.notificationEnvoyee = notificationEnvoyee;
    }

    public String getNotificationWarning() {
        return notificationWarning;
    }

    public void setNotificationWarning(String notificationWarning) {
        this.notificationWarning = notificationWarning;
    }
}

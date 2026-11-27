package com.cabinetdentaire.backend.dto;

import java.time.LocalDateTime;

public class AdminAccountInfoResponse {

    private Long id;
    private String nom;
    private String loginEmail;
    private String role;
    private boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private int activeRecoveryCodesCount;

    public AdminAccountInfoResponse() {
    }

    public AdminAccountInfoResponse(Long id, String nom, String loginEmail,
                                   String role, boolean actif, LocalDateTime dateCreation,
                                   LocalDateTime dateModification, int activeRecoveryCodesCount) {
        this.id = id;
        this.nom = nom;
        this.loginEmail = loginEmail;
        this.role = role;
        this.actif = actif;
        this.dateCreation = dateCreation;
        this.dateModification = dateModification;
        this.activeRecoveryCodesCount = activeRecoveryCodesCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getLoginEmail() { return loginEmail; }
    public void setLoginEmail(String loginEmail) { this.loginEmail = loginEmail; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }

    public int getActiveRecoveryCodesCount() { return activeRecoveryCodesCount; }
    public void setActiveRecoveryCodesCount(int activeRecoveryCodesCount) { this.activeRecoveryCodesCount = activeRecoveryCodesCount; }
}

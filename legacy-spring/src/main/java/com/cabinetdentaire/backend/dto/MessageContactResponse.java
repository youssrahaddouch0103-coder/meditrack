package com.cabinetdentaire.backend.dto;

import com.cabinetdentaire.backend.entity.MessageContact;
import java.time.LocalDateTime;

public class MessageContactResponse {

    private Long id;
    private String nomComplet;
    private String email;
    private String telephone;
    private String sujet;
    private String message;
    private LocalDateTime dateEnvoi;
    private boolean lu;

    public MessageContactResponse() {
    }

    public static MessageContactResponse fromEntity(MessageContact entity) {
        MessageContactResponse dto = new MessageContactResponse();
        dto.setId(entity.getId());
        dto.setNomComplet(entity.getNomComplet());
        dto.setEmail(entity.getEmail());
        dto.setTelephone(entity.getTelephone());
        dto.setSujet(entity.getSujet());
        dto.setMessage(entity.getMessage());
        dto.setDateEnvoi(entity.getDateEnvoi());
        dto.setLu(entity.isLu());
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getSujet() {
        return sujet;
    }

    public void setSujet(String sujet) {
        this.sujet = sujet;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(LocalDateTime dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public boolean isLu() {
        return lu;
    }

    public void setLu(boolean lu) {
        this.lu = lu;
    }
}

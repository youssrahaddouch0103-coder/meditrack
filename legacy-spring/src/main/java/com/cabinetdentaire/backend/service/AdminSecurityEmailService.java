package com.cabinetdentaire.backend.service;

public interface AdminSecurityEmailService {

    void sendPasswordResetEmail(String toEmail, String resetLink);

    void sendSecurityNotification(String toEmail, String subject, String messageText);
}

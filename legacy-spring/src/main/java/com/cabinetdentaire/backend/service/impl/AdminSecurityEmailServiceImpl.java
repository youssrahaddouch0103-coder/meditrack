package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.service.AdminSecurityEmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class AdminSecurityEmailServiceImpl implements AdminSecurityEmailService {

    private static final Logger log = LoggerFactory.getLogger(AdminSecurityEmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:${spring.mail.username:contact@meditrack.local}}")
    private String fromEmail;

    @Value("${app.mail.cabinet-name:Cabinet Dentaire YT Smile Center}")
    private String cabinetName;

    public AdminSecurityEmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String subject = "Réinitialisation de votre mot de passe administrateur – " + cabinetName;
        String html = String.format("""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f8fafc; padding: 20px; }
                        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; }
                        .header { text-align: center; margin-bottom: 25px; }
                        .title { color: #0284c7; font-size: 22px; margin: 0; }
                        .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: bold; margin: 20px 0; }
                        .note { font-size: 13px; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="header">
                            <h2 class="title">%s</h2>
                        </div>
                        <p>Bonjour,</p>
                        <p>Une demande de réinitialisation de mot de passe a été effectuée pour le compte administrateur.</p>
                        <p style="text-align: center;">
                            <a href="%s" class="btn">Réinitialiser mon mot de passe</a>
                        </p>
                        <p>Ce lien est valide pendant <strong>30 minutes</strong> et ne peut être utilisé qu'une seule fois.</p>
                        <p class="note">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                    </div>
                </body>
                </html>
                """, cabinetName, resetLink);

        sendMail(toEmail, subject, html);
    }

    @Override
    public void sendSecurityNotification(String toEmail, String subject, String messageText) {
        String fullSubject = subject + " – " + cabinetName;
        String html = String.format("""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f8fafc; padding: 20px; }
                        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; }
                        .header { text-align: center; margin-bottom: 25px; }
                        .title { color: #0284c7; font-size: 20px; margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="header">
                            <h2 class="title">%s</h2>
                        </div>
                        <p>Bonjour,</p>
                        <p>%s</p>
                        <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Message de sécurité automatique de votre espace administrateur.</p>
                    </div>
                </body>
                </html>
                """, cabinetName, messageText);

        sendMail(toEmail, fullSubject, html);
    }

    private void sendMail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            String senderEmail = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "contact@meditrack.local";
            helper.setFrom(senderEmail, cabinetName);
            helper.setTo(toEmail.trim());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            log.info("[PASSWORD RESET EMAIL] FROM = {} | TO = {}", senderEmail, toEmail.trim());
            mailSender.send(message);
            log.info("E-mail de sécurité envoyé avec succès à {}", toEmail.trim());
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'e-mail de sécurité à {} : {}", toEmail, e.getMessage(), e);
        }
    }
}

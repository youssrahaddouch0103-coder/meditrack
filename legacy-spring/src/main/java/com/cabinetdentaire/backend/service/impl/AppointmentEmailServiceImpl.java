package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.entity.MessageContact;
import com.cabinetdentaire.backend.entity.RendezVous;
import com.cabinetdentaire.backend.service.AppointmentEmailService;
import com.cabinetdentaire.backend.service.NotificationService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
public class AppointmentEmailServiceImpl implements AppointmentEmailService, NotificationService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentEmailServiceImpl.class);
    private static final DateTimeFormatter FRENCH_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:${spring.mail.username:contact@meditrack.local}}")
    private String fromEmail;

    @Value("${app.mail.cabinet-name:Cabinet dentaire}")
    private String cabinetName;

    public AppointmentEmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public boolean sendAppointmentConfirmation(RendezVous rdv) {
        String sujet = "Confirmation de votre rendez-vous – " + cabinetName;
        String htmlContent = construireHtmlConfirmation(rdv);
        return envoyerEmailMetier(rdv.getEmail(), sujet, htmlContent, rdv.getId(), "CONFIRMATION", null, null);
    }

    @Override
    public boolean sendAppointmentRejection(RendezVous rdv, String motif) {
        String sujet = "Votre rendez-vous a été refusé – " + cabinetName;
        String htmlContent = construireHtmlRefus(rdv, motif);
        return envoyerEmailMetier(rdv.getEmail(), sujet, htmlContent, rdv.getId(), "REFUS", null, null);
    }

    @Override
    public boolean sendAppointmentCancellation(RendezVous rdv) {
        String sujet = "Annulation de votre rendez-vous – " + cabinetName;
        String htmlContent = construireHtmlAnnulation(rdv);
        return envoyerEmailMetier(rdv.getEmail(), sujet, htmlContent, rdv.getId(), "ANNULATION", null, null);
    }

    // E-mail 1 de Contact : Notification interne au Cabinet
    // FROM: contact@meditrack.local | TO: contact@meditrack.local | REPLY-TO: patient@gmail.com
    public boolean sendContactMessageNotificationToCabinet(MessageContact msg) {
        String sujet = "Nouveau message de contact : " + msg.getSujet() + " – " + cabinetName;
        String htmlContent = construireHtmlContactCabinet(msg);
        String cabinetTarget = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "contact@meditrack.local";
        return envoyerEmailMetier(cabinetTarget, sujet, htmlContent, msg.getId(), "CONTACT_CABINET", msg.getEmail(), msg.getNomComplet());
    }

    // E-mail 2 de Contact : Accusé de réception automatique au Patient
    // FROM: contact@meditrack.local | TO: patient@gmail.com
    public boolean sendContactAcknowledgementToPatient(MessageContact msg) {
        String sujet = "Accusé de réception de votre message – " + cabinetName;
        String htmlContent = construireHtmlContactAccusePatient(msg);
        return envoyerEmailMetier(msg.getEmail(), sujet, htmlContent, msg.getId(), "CONTACT_PATIENT", null, null);
    }

    // Compatibilité avec l'interface NotificationService
    @Override
    public boolean notifierPatientConfirmation(RendezVous rdv) {
        return sendAppointmentConfirmation(rdv);
    }

    @Override
    public boolean notifierPatientRefus(RendezVous rdv, String motif) {
        return sendAppointmentRejection(rdv, motif);
    }

    @Override
    public boolean notifierPatientAnnulation(RendezVous rdv) {
        return sendAppointmentCancellation(rdv);
    }

    private boolean envoyerEmailMetier(String toEmail, String sujet, String htmlContent, Long idReference, String typeNotification, String customReplyToEmail, String customReplyToName) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Impossible d'envoyer l'e-mail [{}] : adresse destinataire vide pour l'ID {}", typeNotification, idReference);
            return false;
        }

        String senderEmail = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "contact@meditrack.local";

        log.info("Appointment email:\ntype={}\nfromConfigured={}\npatientEmailPresent={}\nrecipientSource=APPOINTMENT.patientEmail",
                typeNotification,
                (!senderEmail.isBlank()),
                (!toEmail.isBlank()));

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            // FROM SMTP toujours l'adresse officielle du cabinet
            helper.setFrom(senderEmail, cabinetName);

            // REPLY-TO : adresse du patient avec son nom pour le formulaire de contact, sinon l'adresse du cabinet
            String replyToEmail = (customReplyToEmail != null && !customReplyToEmail.isBlank()) ? customReplyToEmail.trim() : senderEmail;
            String replyToName = (customReplyToName != null && !customReplyToName.isBlank()) ? customReplyToName.trim() : cabinetName;
            helper.setReplyTo(replyToEmail, replyToName);

            helper.setTo(toEmail.trim());
            helper.setSubject(sujet);
            helper.setText(htmlContent, true);

            log.info("[CONTACT/APPOINTMENT EMAIL {}] FROM = {} | TO = {} | REPLY-TO = {} ({}) | ID = {}",
                    typeNotification, senderEmail, maskEmail(toEmail.trim()), maskEmail(replyToEmail), replyToName, idReference);

            mailSender.send(message);
            log.info("Email [{}] sent successfully for ID {}", typeNotification, idReference);
            return true;
        } catch (Exception e) {
            log.error("Email [{}] failed for ID {} : {}", typeNotification, idReference, e.getMessage(), e);
            return false;
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int atIdx = email.indexOf('@');
        String name = email.substring(0, atIdx);
        String domain = email.substring(atIdx);
        if (name.length() <= 2) {
            return name.charAt(0) + "***" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + domain;
    }

    private String construireHtmlConfirmation(RendezVous rdv) {
        String nomEscaped = HtmlUtils.htmlEscape(rdv.getNomComplet());
        String soinEscaped = HtmlUtils.htmlEscape(rdv.getSoin());
        String dateFormatted = rdv.getDateSouhaitee().format(FRENCH_DATE_FORMATTER);
        String heureStr = HtmlUtils.htmlEscape(rdv.getHeureSouhaitee().toString());
        String cabinetEscaped = HtmlUtils.htmlEscape(cabinetName);

        return String.format("""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
                        .header { background-color: #0284c7; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center; }
                        .content { padding: 20px; }
                        .details { background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #0284c7; }
                        .footer { margin-top: 20px; font-size: 0.9em; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>%s</h2>
                        </div>
                        <div class="content">
                            <p>Bonjour <strong>%s</strong>,</p>
                            <p>Votre rendez-vous a été confirmé par le cabinet dentaire.</p>
                            <div class="details">
                                <p style="margin: 4px 0;"><strong>Soin :</strong> %s</p>
                                <p style="margin: 4px 0;"><strong>Date :</strong> %s</p>
                                <p style="margin: 4px 0;"><strong>Heure :</strong> %s</p>
                            </div>
                            <p>Merci de vous présenter quelques minutes avant l’heure prévue.</p>
                            <div class="footer">
                                <p>Cordialement,<br><strong>%s</strong></p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """, cabinetEscaped, nomEscaped, soinEscaped, dateFormatted, heureStr, cabinetEscaped);
    }

    private String construireHtmlRefus(RendezVous rdv, String motif) {
        String nomEscaped = HtmlUtils.htmlEscape(rdv.getNomComplet());
        String soinEscaped = HtmlUtils.htmlEscape(rdv.getSoin());
        String dateFormatted = rdv.getDateSouhaitee().format(FRENCH_DATE_FORMATTER);
        String heureStr = HtmlUtils.htmlEscape(rdv.getHeureSouhaitee().toString());
        String cabinetEscaped = HtmlUtils.htmlEscape(cabinetName);

        String motifBlock = "";
        if (motif != null && !motif.isBlank()) {
            motifBlock = String.format("<p style=\"margin: 4px 0;\"><strong>Motif :</strong> %s</p>", HtmlUtils.htmlEscape(motif.trim()));
        }

        return String.format("""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
                        .header { background-color: #dc2626; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center; }
                        .content { padding: 20px; }
                        .details { background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc2626; }
                        .footer { margin-top: 20px; font-size: 0.9em; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>%s</h2>
                        </div>
                        <div class="content">
                            <p>Bonjour <strong>%s</strong>,</p>
                            <p>Nous sommes désolés, votre demande de rendez-vous n’a pas pu être acceptée.</p>
                            <div class="details">
                                <p style="margin: 4px 0;"><strong>Soin :</strong> %s</p>
                                <p style="margin: 4px 0;"><strong>Date demandée :</strong> %s</p>
                                <p style="margin: 4px 0;"><strong>Heure demandée :</strong> %s</p>
                                %s
                            </div>
                            <p>Vous pouvez contacter le cabinet ou effectuer une nouvelle demande afin de choisir un autre créneau.</p>
                            <div class="footer">
                                <p>Cordialement,<br><strong>%s</strong></p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """, cabinetEscaped, nomEscaped, soinEscaped, dateFormatted, heureStr, motifBlock, cabinetEscaped);
    }

    private String construireHtmlAnnulation(RendezVous rdv) {
        String nomEscaped = HtmlUtils.htmlEscape(rdv.getNomComplet());
        String dateFormatted = rdv.getDateSouhaitee().format(FRENCH_DATE_FORMATTER);
        String heureStr = HtmlUtils.htmlEscape(rdv.getHeureSouhaitee().toString());
        String cabinetEscaped = HtmlUtils.htmlEscape(cabinetName);

        return String.format("""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                </head>
                <body>
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Votre rendez-vous prévu le %s à %s a été annulé.</p>
                    <p>Cordialement,<br>%s</p>
                </body>
                </html>
                """, nomEscaped, dateFormatted, heureStr, cabinetEscaped);
    }

    private String construireHtmlContactCabinet(MessageContact msg) {
        String nomEscaped = HtmlUtils.htmlEscape(msg.getNomComplet());
        String emailEscaped = HtmlUtils.htmlEscape(msg.getEmail());
        String telEscaped = msg.getTelephone() != null ? HtmlUtils.htmlEscape(msg.getTelephone()) : "Non précisé";
        String sujetEscaped = HtmlUtils.htmlEscape(msg.getSujet());
        String messageEscaped = HtmlUtils.htmlEscape(msg.getMessage());
        String cabinetEscaped = HtmlUtils.htmlEscape(cabinetName);

        return String.format("""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
                        .header { background-color: #0284c7; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center; }
                        .content { padding: 20px; }
                        .details { background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #0284c7; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>%s - Nouveau message de contact</h2>
                        </div>
                        <div class="content">
                            <p>Vous avez reçu un nouveau message depuis le formulaire de contact :</p>
                            <div class="details">
                                <p style="margin: 4px 0;"><strong>Expéditeur :</strong> %s (%s)</p>
                                <p style="margin: 4px 0;"><strong>Téléphone :</strong> %s</p>
                                <p style="margin: 4px 0;"><strong>Sujet :</strong> %s</p>
                                <p style="margin: 4px 0;"><strong>Message :</strong></p>
                                <p style="white-space: pre-wrap; margin: 4px 0;">%s</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """, cabinetEscaped, nomEscaped, emailEscaped, telEscaped, sujetEscaped, messageEscaped);
    }

    private String construireHtmlContactAccusePatient(MessageContact msg) {
        String nomEscaped = HtmlUtils.htmlEscape(msg.getNomComplet());
        String sujetEscaped = HtmlUtils.htmlEscape(msg.getSujet());
        String cabinetEscaped = HtmlUtils.htmlEscape(cabinetName);

        return String.format("""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
                        .header { background-color: #0284c7; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center; }
                        .content { padding: 20px; }
                        .footer { margin-top: 20px; font-size: 0.9em; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>%s</h2>
                        </div>
                        <div class="content">
                            <p>Bonjour <strong>%s</strong>,</p>
                            <p>Nous avons bien reçu votre message concernant : <strong>%s</strong>.</p>
                            <p>Notre équipe le traitera dans les plus brefs délais.</p>
                            <div class="footer">
                                <p>Cordialement,<br><strong>%s</strong></p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """, cabinetEscaped, nomEscaped, sujetEscaped, cabinetEscaped);
    }
}

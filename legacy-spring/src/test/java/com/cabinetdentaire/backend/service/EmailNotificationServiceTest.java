package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.entity.RendezVous;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
import com.cabinetdentaire.backend.service.impl.AppointmentEmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailNotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private AppointmentEmailServiceImpl appointmentEmailService;

    private RendezVous rendezVous;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(appointmentEmailService, "fromEmail", "contact@meditrack.local");
        ReflectionTestUtils.setField(appointmentEmailService, "cabinetName", "Cabinet dentaire YT Smile Center");

        rendezVous = new RendezVous();
        rendezVous.setId(1L);
        rendezVous.setNomComplet("Jean Dupont");
        rendezVous.setEmail("patient@example.com");
        rendezVous.setTelephone("0612345678");
        rendezVous.setSoin("Consultation");
        rendezVous.setDateSouhaitee(LocalDate.of(2026, 8, 15));
        rendezVous.setHeureSouhaitee(LocalTime.of(10, 30));
        rendezVous.setStatut(StatutRendezVous.EN_ATTENTE);
    }

    @Test
    @DisplayName("Envoi reussi de l'email de confirmation avec sujet, destinataire, date et soin")
    void sendAppointmentConfirmation_Succes() throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        boolean resultat = appointmentEmailService.sendAppointmentConfirmation(rendezVous);

        assertTrue(resultat);
        verify(mailSender, times(1)).send(any(MimeMessage.class));

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        MimeMessage sentMessage = captor.getValue();

        assertEquals("patient@example.com", sentMessage.getAllRecipients()[0].toString());
        assertTrue(sentMessage.getSubject().contains("Confirmation de votre rendez-vous"));
    }

    @Test
    @DisplayName("Envoi reussi de l'email de refus avec motif")
    void sendAppointmentRejection_AvecMotif_Succes() throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        boolean resultat = appointmentEmailService.sendAppointmentRejection(rendezVous, "Créneau indisponible");

        assertTrue(resultat);
        verify(mailSender, times(1)).send(any(MimeMessage.class));

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        MimeMessage sentMessage = captor.getValue();

        assertEquals("patient@example.com", sentMessage.getAllRecipients()[0].toString());
        assertTrue(sentMessage.getSubject().contains("Réponse à votre demande de rendez-vous"));
    }

    @Test
    @DisplayName("Gestion des erreurs SMTP sans exception non geree (retourne false et n'interrompt pas le flux)")
    void sendAppointmentConfirmation_ErreurSmtp_RetourneFalse() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("Gmail SMTP Indisponible")).when(mailSender).send(any(MimeMessage.class));

        boolean resultat = appointmentEmailService.sendAppointmentConfirmation(rendezVous);

        assertFalse(resultat);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}

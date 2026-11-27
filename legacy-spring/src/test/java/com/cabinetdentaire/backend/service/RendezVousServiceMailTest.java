package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.CreationRendezVousRequest;
import com.cabinetdentaire.backend.dto.RendezVousResponse;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class RendezVousServiceMailTest {

    @Autowired
    private RendezVousService rendezVousService;

    @MockBean
    private AppointmentEmailService appointmentEmailService;

    @Test
    @DisplayName("Maintenir le statut CONFIRME en base PostgreSQL lorsque l'envoi d'email echoue")
    void confirmerRendezVous_MailEchoue_MaintientStatutConfirme() {
        // Mock notification failure (e.g. Gmail SMTP temp failure)
        when(appointmentEmailService.sendAppointmentConfirmation(any())).thenReturn(false);

        CreationRendezVousRequest req = new CreationRendezVousRequest();
        req.setNomComplet("Paul Durand");
        req.setTelephone("0611223344");
        req.setEmail("paul.durand@example.com");
        req.setSoin("Consultation");
        req.setDateSouhaitee(LocalDate.now().plusDays(5));
        req.setHeureSouhaitee(LocalTime.of(14, 0));
        RendezVousResponse created = rendezVousService.creerDemande(req);

        // Statut initial doit etre EN_ATTENTE
        assertEquals(StatutRendezVous.EN_ATTENTE, created.getStatut());

        // Confirmer
        RendezVousResponse confirmed = rendezVousService.confirmerRendezVous(created.getId());

        // Statut doit etre CONFIRME meme si le mail a echoue
        assertEquals(StatutRendezVous.CONFIRME, confirmed.getStatut());
        assertFalse(confirmed.getNotificationEnvoyee());
        assertNotNull(confirmed.getNotificationWarning());
        assertTrue(confirmed.getNotificationWarning().contains("n'a pas pu être envoyé"));
    }

    @Test
    @DisplayName("Absence d'envoi d'email avant la decision de l'administrateur")
    void creerDemande_PasDenvoiEmailClient() {
        CreationRendezVousRequest req = new CreationRendezVousRequest();
        req.setNomComplet("Marc Vasseur");
        req.setTelephone("0699887766");
        req.setEmail("marc@example.com");
        req.setSoin("Détartrage");
        req.setDateSouhaitee(LocalDate.now().plusDays(6));
        req.setHeureSouhaitee(LocalTime.of(11, 0));

        rendezVousService.creerDemande(req);

        // Verifier qu'aucun mail de confirmation ou refus n'est envoye lors de la simple creation publique
        verify(appointmentEmailService, never()).sendAppointmentConfirmation(any());
        verify(appointmentEmailService, never()).sendAppointmentRejection(any(), any());
    }
}

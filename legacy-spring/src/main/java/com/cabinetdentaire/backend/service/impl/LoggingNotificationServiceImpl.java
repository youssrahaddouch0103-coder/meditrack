package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.entity.RendezVous;
import com.cabinetdentaire.backend.service.AppointmentEmailService;
import com.cabinetdentaire.backend.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingBean(name = "appointmentEmailServiceImpl")
public class LoggingNotificationServiceImpl implements AppointmentEmailService, NotificationService {

    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationServiceImpl.class);

    @Override
    public boolean sendAppointmentConfirmation(RendezVous rdv) {
        log.info("[NOTIFICATION DEV] Confirmation du RDV ID {} pour le patient {} ({}) le {} à {}",
                rdv.getId(), rdv.getNomComplet(), rdv.getEmail(), rdv.getDateSouhaitee(), rdv.getHeureSouhaitee());
        return true;
    }

    @Override
    public boolean sendAppointmentRejection(RendezVous rdv, String motif) {
        log.info("[NOTIFICATION DEV] Refus du RDV ID {} pour le patient {} ({}). Motif: {}",
                rdv.getId(), rdv.getNomComplet(), rdv.getEmail(), motif != null ? motif : "Aucun motif précisé");
        return true;
    }

    @Override
    public boolean sendAppointmentCancellation(RendezVous rdv) {
        log.info("[NOTIFICATION DEV] Annulation du RDV ID {} pour le patient {} ({})",
                rdv.getId(), rdv.getNomComplet(), rdv.getEmail());
        return true;
    }

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
}

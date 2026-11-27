package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.entity.RendezVous;

public interface NotificationService {
    boolean notifierPatientConfirmation(RendezVous rdv);
    boolean notifierPatientRefus(RendezVous rdv, String motif);
    boolean notifierPatientAnnulation(RendezVous rdv);
}

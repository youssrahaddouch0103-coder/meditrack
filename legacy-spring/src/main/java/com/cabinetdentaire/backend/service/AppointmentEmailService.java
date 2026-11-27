package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.entity.RendezVous;

public interface AppointmentEmailService {

    boolean sendAppointmentConfirmation(RendezVous rdv);

    boolean sendAppointmentRejection(RendezVous rdv, String motif);

    boolean sendAppointmentCancellation(RendezVous rdv);
}

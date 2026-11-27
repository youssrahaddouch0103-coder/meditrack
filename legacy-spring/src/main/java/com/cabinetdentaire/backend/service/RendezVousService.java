package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.CreationRendezVousRequest;
import com.cabinetdentaire.backend.dto.RendezVousResponse;
import com.cabinetdentaire.backend.entity.RendezVous;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
import com.cabinetdentaire.backend.exception.ResourceNotFoundException;
import com.cabinetdentaire.backend.exception.SlotAlreadyBookedException;
import com.cabinetdentaire.backend.repository.RendezVousRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final AppointmentEmailService appointmentEmailService;

    public RendezVousService(RendezVousRepository rendezVousRepository, AppointmentEmailService appointmentEmailService) {
        this.rendezVousRepository = rendezVousRepository;
        this.appointmentEmailService = appointmentEmailService;
    }

    public RendezVousResponse creerDemande(CreationRendezVousRequest request) {
        if (request.getDateSouhaitee().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La date souhaitée ne peut pas être dans le passé");
        }

        RendezVous rdv = new RendezVous();
        rdv.setNomComplet(request.getNomComplet().trim());
        rdv.setTelephone(request.getTelephone().trim());
        rdv.setEmail(request.getEmail().trim());
        rdv.setSoin(request.getSoin().trim());
        rdv.setDateSouhaitee(request.getDateSouhaitee());
        rdv.setHeureSouhaitee(request.getHeureSouhaitee());
        rdv.setMessage(request.getMessage() != null ? request.getMessage().trim() : null);
        
        // Explicitement EN_ATTENTE cote backend
        rdv.setStatut(StatutRendezVous.EN_ATTENTE);

        RendezVous saved = rendezVousRepository.save(rdv);
        return RendezVousResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<RendezVousResponse> obtenirTousRendezVous(StatutRendezVous statut) {
        List<RendezVous> liste;
        if (statut != null) {
            liste = rendezVousRepository.findByStatutOrderByDateCreationDesc(statut);
        } else {
            liste = rendezVousRepository.findAllByOrderByDateCreationDesc();
        }
        return liste.stream()
                .map(RendezVousResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RendezVousResponse obtenirRendezVousParId(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable avec l'ID : " + id));
        return RendezVousResponse.fromEntity(rdv);
    }

    public RendezVousResponse confirmerRendezVous(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable avec l'ID : " + id));

        // Verifier si un autre rendez-vous CONFIRME occupe deja le meme creneau (date + heure)
        boolean creneauOccupe = rendezVousRepository.existsByDateSouhaiteeAndHeureSouhaiteeAndStatut(
                rdv.getDateSouhaitee(),
                rdv.getHeureSouhaitee(),
                StatutRendezVous.CONFIRME
        );

        // Si le rendez-vous est deja confirme lui-meme et sans collision avec un autre ID, pas de conflit
        if (creneauOccupe && rdv.getStatut() != StatutRendezVous.CONFIRME) {
            throw new SlotAlreadyBookedException("Ce créneau horaire est déjà occupé par un autre rendez-vous confirmé.");
        }

        rdv.setStatut(StatutRendezVous.CONFIRME);
        RendezVous updated = rendezVousRepository.save(rdv);

        // Envoi notification métier via AppointmentEmailService
        boolean notificationSucces = appointmentEmailService.sendAppointmentConfirmation(updated);

        RendezVousResponse response = RendezVousResponse.fromEntity(updated);
        response.setNotificationEnvoyee(notificationSucces);
        if (!notificationSucces) {
            response.setNotificationWarning("Le statut a été mis à jour à CONFIRME, mais l'e-mail de notification n'a pas pu être envoyé au patient.");
        }

        return response;
    }

    public RendezVousResponse refuserRendezVous(Long id, String motifRefus) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable avec l'ID : " + id));

        rdv.setStatut(StatutRendezVous.REFUSE);
        if (motifRefus != null && !motifRefus.isBlank()) {
            rdv.setMotifRefus(motifRefus.trim());
        }
        RendezVous updated = rendezVousRepository.save(rdv);

        // Envoi notification métier via AppointmentEmailService
        boolean notificationSucces = appointmentEmailService.sendAppointmentRejection(updated, motifRefus);

        RendezVousResponse response = RendezVousResponse.fromEntity(updated);
        response.setNotificationEnvoyee(notificationSucces);
        if (!notificationSucces) {
            response.setNotificationWarning("Le statut a été mis à jour à REFUSE, mais l'e-mail de notification n'a pas pu être envoyé au patient.");
        }

        return response;
    }

    public RendezVousResponse annulerRendezVous(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable avec l'ID : " + id));

        rdv.setStatut(StatutRendezVous.ANNULE);
        RendezVous updated = rendezVousRepository.save(rdv);

        // Envoi notification métier via AppointmentEmailService
        boolean notificationSucces = appointmentEmailService.sendAppointmentCancellation(updated);

        RendezVousResponse response = RendezVousResponse.fromEntity(updated);
        response.setNotificationEnvoyee(notificationSucces);
        return response;
    }
}

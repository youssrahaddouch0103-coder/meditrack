package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.AvisResponse;
import com.cabinetdentaire.backend.dto.CreationAvisRequest;
import com.cabinetdentaire.backend.entity.Avis;
import com.cabinetdentaire.backend.entity.StatutAvis;
import com.cabinetdentaire.backend.exception.ResourceNotFoundException;
import com.cabinetdentaire.backend.repository.AvisRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AvisService {

    private final AvisRepository avisRepository;

    public AvisService(AvisRepository avisRepository) {
        this.avisRepository = avisRepository;
    }

    public AvisResponse creerAvis(CreationAvisRequest request) {
        Avis avis = new Avis();
        avis.setNomAuteur(request.getNomAuteur().trim());
        avis.setNote(request.getNote());
        avis.setSoinConcerne(request.getSoinConcerne().trim());
        avis.setCommentaire(request.getCommentaire().trim());
        // Forcer systématiquement le statut EN_ATTENTE
        avis.setStatut(StatutAvis.EN_ATTENTE);
        avis.setDateDecision(null);

        Avis saved = avisRepository.save(avis);
        return AvisResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AvisResponse> obtenirAvisPublics() {
        return avisRepository.findAllByStatutOrderByDateCreationDesc(StatutAvis.APPROUVE)
                .stream()
                .map(AvisResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvisResponse> obtenirTousAvisAdmin(StatutAvis statutFilter) {
        List<Avis> liste = (statutFilter != null)
                ? avisRepository.findByStatutOrderByDateCreationDesc(statutFilter)
                : avisRepository.findAllByOrderByDateCreationDesc();

        return liste.stream()
                .map(AvisResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AvisResponse obtenirAvisParId(Long id) {
        Avis avis = avisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis introuvable avec l'ID : " + id));
        return AvisResponse.fromEntity(avis);
    }

    public AvisResponse approuverAvis(Long id) {
        Avis avis = avisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis introuvable avec l'ID : " + id));
        avis.setStatut(StatutAvis.APPROUVE);
        avis.setDateDecision(LocalDateTime.now());
        Avis updated = avisRepository.save(avis);
        return AvisResponse.fromEntity(updated);
    }

    public AvisResponse refuserAvis(Long id) {
        Avis avis = avisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis introuvable avec l'ID : " + id));
        avis.setStatut(StatutAvis.REFUSE);
        avis.setDateDecision(LocalDateTime.now());
        Avis updated = avisRepository.save(avis);
        return AvisResponse.fromEntity(updated);
    }

    public void supprimerAvis(Long id) {
        Avis avis = avisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis introuvable avec l'ID : " + id));
        avisRepository.delete(avis);
    }

    @Transactional(readOnly = true)
    public long compterAvisEnAttente() {
        return avisRepository.countByStatut(StatutAvis.EN_ATTENTE);
    }
}

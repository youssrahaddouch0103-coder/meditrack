package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.AvisResponse;
import com.cabinetdentaire.backend.entity.StatutAvis;
import com.cabinetdentaire.backend.service.AvisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/avis")
public class AdminAvisController {

    private final AvisService avisService;

    public AdminAvisController(AvisService avisService) {
        this.avisService = avisService;
    }

    @GetMapping
    public ResponseEntity<List<AvisResponse>> obtenirTousAvis(
            @RequestParam(required = false) StatutAvis statut) {
        List<AvisResponse> liste = avisService.obtenirTousAvisAdmin(statut);
        return ResponseEntity.ok(liste);
    }

    @GetMapping("/en-attente-count")
    public ResponseEntity<Map<String, Long>> compterAvisEnAttente() {
        long count = avisService.compterAvisEnAttente();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvisResponse> obtenirAvisParId(@PathVariable Long id) {
        AvisResponse avis = avisService.obtenirAvisParId(id);
        return ResponseEntity.ok(avis);
    }

    @PatchMapping("/{id}/approuver")
    public ResponseEntity<Map<String, Object>> approuverAvis(@PathVariable Long id) {
        AvisResponse avis = avisService.approuverAvis(id);
        return ResponseEntity.ok(Map.of(
                "message", "L’avis a été approuvé et est maintenant visible sur le site.",
                "avis", avis
        ));
    }

    @PatchMapping("/{id}/refuser")
    public ResponseEntity<Map<String, Object>> refuserAvis(@PathVariable Long id) {
        AvisResponse avis = avisService.refuserAvis(id);
        return ResponseEntity.ok(Map.of(
                "message", "L’avis a été refusé.",
                "avis", avis
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> supprimerAvis(@PathVariable Long id) {
        avisService.supprimerAvis(id);
        return ResponseEntity.ok(Map.of("message", "L’avis a été supprimé."));
    }
}

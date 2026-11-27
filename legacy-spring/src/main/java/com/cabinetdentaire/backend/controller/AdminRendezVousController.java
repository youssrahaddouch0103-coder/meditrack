package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.RefusRendezVousRequest;
import com.cabinetdentaire.backend.dto.RendezVousResponse;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
import com.cabinetdentaire.backend.service.RendezVousService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rendez-vous")
public class AdminRendezVousController {

    private final RendezVousService rendezVousService;

    public AdminRendezVousController(RendezVousService rendezVousService) {
        this.rendezVousService = rendezVousService;
    }

    @GetMapping
    public ResponseEntity<List<RendezVousResponse>> obtenirRendezVous(
            @RequestParam(required = false) StatutRendezVous statut) {
        List<RendezVousResponse> rendezVous = rendezVousService.obtenirTousRendezVous(statut);
        return ResponseEntity.ok(rendezVous);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezVousResponse> obtenirRendezVousParId(@PathVariable Long id) {
        RendezVousResponse rdv = rendezVousService.obtenirRendezVousParId(id);
        return ResponseEntity.ok(rdv);
    }

    @PatchMapping("/{id}/confirmer")
    public ResponseEntity<RendezVousResponse> confirmerRendezVous(@PathVariable Long id) {
        RendezVousResponse rdv = rendezVousService.confirmerRendezVous(id);
        return ResponseEntity.ok(rdv);
    }

    @PatchMapping("/{id}/refuser")
    public ResponseEntity<RendezVousResponse> refuserRendezVous(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid RefusRendezVousRequest request) {
        String motif = (request != null) ? request.getMotifRefus() : null;
        RendezVousResponse rdv = rendezVousService.refuserRendezVous(id, motif);
        return ResponseEntity.ok(rdv);
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<RendezVousResponse> annulerRendezVous(@PathVariable Long id) {
        RendezVousResponse rdv = rendezVousService.annulerRendezVous(id);
        return ResponseEntity.ok(rdv);
    }
}

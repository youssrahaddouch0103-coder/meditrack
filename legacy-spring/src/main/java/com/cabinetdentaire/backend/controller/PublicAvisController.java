package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.AvisResponse;
import com.cabinetdentaire.backend.dto.CreationAvisRequest;
import com.cabinetdentaire.backend.service.AvisService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avis")
public class PublicAvisController {

    private final AvisService avisService;

    public PublicAvisController(AvisService avisService) {
        this.avisService = avisService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> proposerAvis(@Valid @RequestBody CreationAvisRequest request) {
        AvisResponse avis = avisService.creerAvis(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Merci pour votre avis. Il sera publié après validation par notre équipe.",
                "avis", avis
        ));
    }

    @GetMapping("/publics")
    public ResponseEntity<List<AvisResponse>> obtenirAvisPublics() {
        List<AvisResponse> avisPublics = avisService.obtenirAvisPublics();
        return ResponseEntity.ok(avisPublics);
    }
}

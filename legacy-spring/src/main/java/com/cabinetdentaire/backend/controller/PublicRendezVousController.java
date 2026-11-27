package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationRendezVousRequest;
import com.cabinetdentaire.backend.dto.RendezVousResponse;
import com.cabinetdentaire.backend.service.RendezVousService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicRendezVousController {

    private final RendezVousService rendezVousService;

    public PublicRendezVousController(RendezVousService rendezVousService) {
        this.rendezVousService = rendezVousService;
    }

    @PostMapping("/rendez-vous")
    public ResponseEntity<RendezVousResponse> creerDemandeRendezVous(
            @Valid @RequestBody CreationRendezVousRequest request) {
        RendezVousResponse response = rendezVousService.creerDemande(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

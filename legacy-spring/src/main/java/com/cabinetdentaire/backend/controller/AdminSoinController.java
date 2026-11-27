package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationSoinRequest;
import com.cabinetdentaire.backend.dto.ReorderSoinsRequest;
import com.cabinetdentaire.backend.dto.SoinDto;
import com.cabinetdentaire.backend.entity.StatutSoin;
import com.cabinetdentaire.backend.service.SoinService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/soins")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSoinController {

    private final SoinService soinService;

    public AdminSoinController(SoinService soinService) {
        this.soinService = soinService;
    }

    @GetMapping
    public ResponseEntity<List<SoinDto>> getAllSoinsAdmin() {
        List<SoinDto> soins = soinService.getAllSoinsAdmin();
        return ResponseEntity.ok(soins);
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<SoinDto> getSoinByIdentifier(@PathVariable String identifier) {
        SoinDto soin = soinService.getSoinBySlugOrId(identifier);
        return ResponseEntity.ok(soin);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SoinDto> creerSoinWithCover(
            @RequestPart(value = "data", required = false) CreationSoinRequest requestData,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "descriptionCourte", required = false) String descriptionCourte,
            @RequestParam(value = "descriptionDetaillee", required = false) String descriptionDetaillee,
            @RequestParam(value = "photoCouvertureAlt", required = false) String photoCouvertureAlt,
            @RequestParam(value = "ordreAffichage", required = false) Integer ordreAffichage,
            @RequestParam(value = "statut", required = false) StatutSoin statut,
            @RequestPart(value = "coverFile", required = false) MultipartFile coverFile,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        CreationSoinRequest request = buildRequest(requestData, titre, descriptionCourte, descriptionDetaillee, photoCouvertureAlt, ordreAffichage, statut);
        MultipartFile fileToUpload = (coverFile != null && !coverFile.isEmpty()) ? coverFile : coverImage;

        SoinDto created = soinService.creerSoin(request, fileToUpload);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @RequestMapping(value = "/{identifier}", method = {RequestMethod.PUT, RequestMethod.POST}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SoinDto> modifierSoinWithCover(
            @PathVariable String identifier,
            @RequestPart(value = "data", required = false) CreationSoinRequest requestData,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "descriptionCourte", required = false) String descriptionCourte,
            @RequestParam(value = "descriptionDetaillee", required = false) String descriptionDetaillee,
            @RequestParam(value = "photoCouvertureAlt", required = false) String photoCouvertureAlt,
            @RequestParam(value = "ordreAffichage", required = false) Integer ordreAffichage,
            @RequestParam(value = "statut", required = false) StatutSoin statut,
            @RequestPart(value = "coverFile", required = false) MultipartFile coverFile,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        CreationSoinRequest request = buildRequest(requestData, titre, descriptionCourte, descriptionDetaillee, photoCouvertureAlt, ordreAffichage, statut);
        MultipartFile fileToUpload = (coverFile != null && !coverFile.isEmpty()) ? coverFile : coverImage;

        SoinDto updated = soinService.modifierSoinByIdentifier(identifier, request, fileToUpload);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/reorder")
    public ResponseEntity<List<SoinDto>> reordonnerSoins(@Valid @RequestBody ReorderSoinsRequest request) {
        List<SoinDto> reordered = soinService.reordonnerSoins(request);
        return ResponseEntity.ok(reordered);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> supprimerOuArchiverSoin(@PathVariable Long id) {
        soinService.supprimerOuArchiverSoin(id);
        return ResponseEntity.ok(Map.of("message", "Opération réalisée avec succès"));
    }

    private CreationSoinRequest buildRequest(
            CreationSoinRequest requestData,
            String titre,
            String descriptionCourte,
            String descriptionDetaillee,
            String photoCouvertureAlt,
            Integer ordreAffichage,
            StatutSoin statut) {
        if (requestData != null) {
            return requestData;
        }

        CreationSoinRequest req = new CreationSoinRequest();
        if (titre != null) req.setTitre(titre);
        if (descriptionCourte != null) req.setDescriptionCourte(descriptionCourte);
        if (descriptionDetaillee != null) req.setDescriptionDetaillee(descriptionDetaillee);
        if (photoCouvertureAlt != null) req.setPhotoCouvertureAlt(photoCouvertureAlt);
        if (ordreAffichage != null) req.setOrdreAffichage(ordreAffichage);
        if (statut != null) req.setStatut(statut);
        return req;
    }
}

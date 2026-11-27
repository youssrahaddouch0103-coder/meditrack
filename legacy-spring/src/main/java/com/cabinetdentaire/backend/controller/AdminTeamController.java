package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationMembreEquipeRequest;
import com.cabinetdentaire.backend.dto.MembreEquipeDto;
import com.cabinetdentaire.backend.dto.ReorderTeamRequest;
import com.cabinetdentaire.backend.service.TeamMemberService;
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
@RequestMapping("/api/admin/team")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTeamController {

    private final TeamMemberService teamMemberService;

    public AdminTeamController(TeamMemberService teamMemberService) {
        this.teamMemberService = teamMemberService;
    }

    @GetMapping
    public ResponseEntity<List<MembreEquipeDto>> getAllTeamMembersAdmin() {
        List<MembreEquipeDto> members = teamMemberService.getAllTeamMembersAdmin();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembreEquipeDto> getTeamMemberById(@PathVariable Long id) {
        MembreEquipeDto dto = teamMemberService.getTeamMemberById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MembreEquipeDto> createTeamMemberWithPhoto(
            @RequestPart(value = "data", required = false) CreationMembreEquipeRequest requestData,
            @RequestParam(value = "nomComplet", required = false) String nomComplet,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "specialite", required = false) String specialite,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "photoAlt", required = false) String photoAlt,
            @RequestParam(value = "ordreAffichage", required = false) Integer ordreAffichage,
            @RequestParam(value = "actif", required = false) Boolean actif,
            @RequestParam(value = "instagramUrl", required = false) String instagramUrl,
            @RequestParam(value = "linkedinUrl", required = false) String linkedinUrl,
            @RequestPart(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        CreationMembreEquipeRequest request = buildRequest(requestData, nomComplet, titre, specialite, description, photoAlt, ordreAffichage, actif, instagramUrl, linkedinUrl);
        MultipartFile fileToUpload = (photoFile != null && !photoFile.isEmpty()) ? photoFile : photo;

        MembreEquipeDto created = teamMemberService.createTeamMember(request, fileToUpload);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MembreEquipeDto> createTeamMemberJson(@Valid @RequestBody CreationMembreEquipeRequest request) {
        MembreEquipeDto created = teamMemberService.createTeamMember(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.POST}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MembreEquipeDto> updateTeamMemberWithPhoto(
            @PathVariable Long id,
            @RequestPart(value = "data", required = false) CreationMembreEquipeRequest requestData,
            @RequestParam(value = "nomComplet", required = false) String nomComplet,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "specialite", required = false) String specialite,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "photoAlt", required = false) String photoAlt,
            @RequestParam(value = "ordreAffichage", required = false) Integer ordreAffichage,
            @RequestParam(value = "actif", required = false) Boolean actif,
            @RequestParam(value = "instagramUrl", required = false) String instagramUrl,
            @RequestParam(value = "linkedinUrl", required = false) String linkedinUrl,
            @RequestPart(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        CreationMembreEquipeRequest request = buildRequest(requestData, nomComplet, titre, specialite, description, photoAlt, ordreAffichage, actif, instagramUrl, linkedinUrl);
        MultipartFile fileToUpload = (photoFile != null && !photoFile.isEmpty()) ? photoFile : photo;

        MembreEquipeDto updated = teamMemberService.updateTeamMember(id, request, fileToUpload);
        return ResponseEntity.ok(updated);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MembreEquipeDto> updateTeamMemberJson(@PathVariable Long id, @Valid @RequestBody CreationMembreEquipeRequest request) {
        MembreEquipeDto updated = teamMemberService.updateTeamMember(id, request, null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTeamMember(@PathVariable Long id) {
        teamMemberService.deleteTeamMember(id);
        return ResponseEntity.ok(Map.of("message", "Membre de l'équipe supprimé avec succès"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MembreEquipeDto> toggleMemberStatus(@PathVariable Long id) {
        MembreEquipeDto updated = teamMemberService.toggleMemberStatus(id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/reorder")
    public ResponseEntity<List<MembreEquipeDto>> reorderTeamMembers(@Valid @RequestBody ReorderTeamRequest request) {
        List<MembreEquipeDto> reordered = teamMemberService.reorderTeamMembers(request);
        return ResponseEntity.ok(reordered);
    }

    private CreationMembreEquipeRequest buildRequest(
            CreationMembreEquipeRequest requestData,
            String nomComplet,
            String titre,
            String specialite,
            String description,
            String photoAlt,
            Integer ordreAffichage,
            Boolean actif,
            String instagramUrl,
            String linkedinUrl) {

        if (requestData != null) {
            return requestData;
        }

        CreationMembreEquipeRequest req = new CreationMembreEquipeRequest();
        if (nomComplet != null) req.setNomComplet(nomComplet);
        if (titre != null) req.setTitre(titre);
        if (specialite != null) req.setSpecialite(specialite);
        if (description != null) req.setDescription(description);
        if (photoAlt != null) req.setPhotoAlt(photoAlt);
        if (ordreAffichage != null) req.setOrdreAffichage(ordreAffichage);
        if (actif != null) req.setActif(actif);
        if (instagramUrl != null) req.setInstagramUrl(instagramUrl);
        if (linkedinUrl != null) req.setLinkedinUrl(linkedinUrl);
        return req;
    }
}

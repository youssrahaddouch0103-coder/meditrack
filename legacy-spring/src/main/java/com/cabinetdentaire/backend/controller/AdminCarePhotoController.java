package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CarePhotoDto;
import com.cabinetdentaire.backend.dto.ReorderPhotosRequest;
import com.cabinetdentaire.backend.dto.UpdateCarePhotoRequest;
import com.cabinetdentaire.backend.service.CarePhotoService;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCarePhotoController {

    private final CarePhotoService carePhotoService;

    public AdminCarePhotoController(CarePhotoService carePhotoService) {
        this.carePhotoService = carePhotoService;
    }

    @GetMapping("/soins/{careId}/photos")
    public ResponseEntity<List<CarePhotoDto>> getCarePhotosForAdmin(@PathVariable String careId) {
        List<CarePhotoDto> photos = carePhotoService.getPhotosByCareId(careId);
        return ResponseEntity.ok(photos);
    }

    @PostMapping(value = "/soins/{careId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<CarePhotoDto>> uploadPhotos(
            @PathVariable String careId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "caption", required = false) String caption) {
        
        List<CarePhotoDto> uploaded = carePhotoService.uploadMultiplePhotos(careId, files, altText, caption);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @PutMapping({"/photos/{photoId}", "/soins/{careId}/photos/{photoId}"})
    public ResponseEntity<CarePhotoDto> updatePhotoInfo(
            @PathVariable(required = false) String careId,
            @PathVariable Long photoId,
            @Valid @RequestBody UpdateCarePhotoRequest request) {
        
        CarePhotoDto updated = carePhotoService.updatePhotoInfo(photoId, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping({"/photos/{photoId}/cover", "/soins/{careId}/photos/{photoId}/cover"})
    public ResponseEntity<CarePhotoDto> setCoverPhoto(
            @PathVariable(required = false) String careId,
            @PathVariable Long photoId) {
        CarePhotoDto updated = carePhotoService.setCoverPhoto(photoId);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/soins/{careId}/photos/reorder")
    public ResponseEntity<List<CarePhotoDto>> reorderPhotos(
            @PathVariable String careId,
            @Valid @RequestBody ReorderPhotosRequest request) {
        
        List<CarePhotoDto> reordered = carePhotoService.reorderPhotos(careId, request);
        return ResponseEntity.ok(reordered);
    }

    @DeleteMapping({"/photos/{photoId}", "/soins/photos/{photoId}", "/soins/{careId}/photos/{photoId}"})
    public ResponseEntity<Map<String, String>> deletePhoto(
            @PathVariable(required = false) String careId,
            @PathVariable Long photoId) {
        carePhotoService.deletePhoto(photoId);
        return ResponseEntity.ok(Map.of("message", "Photo supprimée avec succès"));
    }
}

package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CarePhotoDto;
import com.cabinetdentaire.backend.service.CarePhotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/soins")
public class PublicCarePhotoController {

    private final CarePhotoService carePhotoService;

    public PublicCarePhotoController(CarePhotoService carePhotoService) {
        this.carePhotoService = carePhotoService;
    }

    @GetMapping("/{careId}/photos")
    public ResponseEntity<List<CarePhotoDto>> getCarePhotos(@PathVariable String careId) {
        List<CarePhotoDto> photos = carePhotoService.getPhotosByCareId(careId);
        return ResponseEntity.ok(photos);
    }
}

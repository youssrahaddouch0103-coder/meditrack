package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CabinetSettingsDto;
import com.cabinetdentaire.backend.service.CabinetSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/cabinet-settings")
public class PublicCabinetSettingsController {

    private final CabinetSettingsService cabinetSettingsService;

    public PublicCabinetSettingsController(CabinetSettingsService cabinetSettingsService) {
        this.cabinetSettingsService = cabinetSettingsService;
    }

    @GetMapping
    public ResponseEntity<CabinetSettingsDto> getPublicCabinetSettings() {
        CabinetSettingsDto settings = cabinetSettingsService.getCabinetSettings();
        return ResponseEntity.ok(settings);
    }
}

package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.SoinDto;
import com.cabinetdentaire.backend.service.SoinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/soins")
public class PublicSoinController {

    private final SoinService soinService;

    public PublicSoinController(SoinService soinService) {
        this.soinService = soinService;
    }

    @GetMapping
    public ResponseEntity<List<SoinDto>> getSoinsPublics() {
        List<SoinDto> soins = soinService.getSoinsPublics();
        return ResponseEntity.ok(soins);
    }

    @GetMapping("/titres")
    public ResponseEntity<List<String>> getTitresSoinsPublics() {
        List<String> titres = soinService.getTitresSoinsPublics();
        return ResponseEntity.ok(titres);
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<SoinDto> getSoinByIdentifier(@PathVariable String identifier) {
        SoinDto soin = soinService.getSoinBySlugOrId(identifier);
        return ResponseEntity.ok(soin);
    }
}

package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.CreationSoinRequest;
import com.cabinetdentaire.backend.dto.ReorderSoinsRequest;
import com.cabinetdentaire.backend.dto.SoinDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SoinService {

    List<SoinDto> getSoinsPublics();

    List<String> getTitresSoinsPublics();

    SoinDto getSoinBySlugOrId(String identifier);

    List<SoinDto> getAllSoinsAdmin();

    SoinDto creerSoin(CreationSoinRequest request, MultipartFile coverFile);

    SoinDto modifierSoin(Long id, CreationSoinRequest request, MultipartFile coverFile);

    SoinDto modifierSoinByIdentifier(String identifier, CreationSoinRequest request, MultipartFile coverFile);

    List<SoinDto> reordonnerSoins(ReorderSoinsRequest request);

    void supprimerOuArchiverSoin(Long id);
}

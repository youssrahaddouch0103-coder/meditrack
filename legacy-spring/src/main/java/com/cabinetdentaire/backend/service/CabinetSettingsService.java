package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.CabinetSettingsDto;
import com.cabinetdentaire.backend.dto.UpdateCabinetSettingsRequest;
import org.springframework.web.multipart.MultipartFile;

public interface CabinetSettingsService {

    CabinetSettingsDto getCabinetSettings();

    CabinetSettingsDto updateCabinetSettings(
            UpdateCabinetSettingsRequest request,
            MultipartFile heroPhoto,
            MultipartFile whyChooseUsPhoto,
            MultipartFile aboutPhoto
    );

}

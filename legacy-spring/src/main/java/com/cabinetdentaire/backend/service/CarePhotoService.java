package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.CarePhotoDto;
import com.cabinetdentaire.backend.dto.ReorderPhotosRequest;
import com.cabinetdentaire.backend.dto.UpdateCarePhotoRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CarePhotoService {

    List<CarePhotoDto> getPhotosByCareId(String careId);

    CarePhotoDto uploadPhoto(String careId, MultipartFile file, String altText, String caption, Boolean isCover);

    List<CarePhotoDto> uploadMultiplePhotos(String careId, List<MultipartFile> files, String altText, String caption);

    CarePhotoDto updatePhotoInfo(Long photoId, UpdateCarePhotoRequest request);

    CarePhotoDto setCoverPhoto(Long photoId);

    List<CarePhotoDto> reorderPhotos(String careId, ReorderPhotosRequest request);

    void deletePhoto(Long photoId);
}

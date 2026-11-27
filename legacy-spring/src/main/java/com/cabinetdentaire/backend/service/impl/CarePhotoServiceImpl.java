package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.dto.CarePhotoDto;
import com.cabinetdentaire.backend.dto.ReorderPhotosRequest;
import com.cabinetdentaire.backend.dto.UpdateCarePhotoRequest;
import com.cabinetdentaire.backend.entity.CarePhoto;
import com.cabinetdentaire.backend.exception.ResourceNotFoundException;
import com.cabinetdentaire.backend.repository.CarePhotoRepository;
import com.cabinetdentaire.backend.service.CarePhotoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CarePhotoServiceImpl implements CarePhotoService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    private final CarePhotoRepository carePhotoRepository;
    private final String uploadDir = "uploads/soins";

    public CarePhotoServiceImpl(CarePhotoRepository carePhotoRepository) {
        this.carePhotoRepository = carePhotoRepository;
        ensureUploadDirectoryExists();
    }

    private void ensureUploadDirectoryExists() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier de téléversement : " + uploadDir, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CarePhotoDto> getPhotosByCareId(String careId) {
        List<CarePhoto> photos = carePhotoRepository.findByCareIdOrderByDisplayOrderAscCreatedAtDesc(careId);
        if (photos.isEmpty() && careId != null) {
            String altCareId = careId.endsWith("s") ? careId.substring(0, careId.length() - 1) : careId + "s";
            photos = carePhotoRepository.findByCareIdOrderByDisplayOrderAscCreatedAtDesc(altCareId);
        }
        return photos.stream()
                .map(CarePhotoDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public CarePhotoDto uploadPhoto(String careId, MultipartFile file, String altText, String caption, Boolean isCover) {
        validateFile(file);

        if (altText == null || altText.trim().isEmpty()) {
            altText = "Photo du soin " + careId;
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\"))) {
            throw new IllegalArgumentException("Nom de fichier invalide (tentative de traversée de répertoire)");
        }

        String extension = getFileExtension(originalFilename);
        String uniqueFileName = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;
        Path targetLocation = Paths.get(uploadDir).resolve(uniqueFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier", e);
        }

        String imageUrl = "/uploads/soins/" + uniqueFileName;
        int nextDisplayOrder = (int) carePhotoRepository.countByCareId(careId) + 1;

        boolean shouldBeCover = Boolean.TRUE.equals(isCover);
        if (shouldBeCover) {
            unsetCurrentCover(careId);
        } else if (carePhotoRepository.countByCareId(careId) == 0) {
            shouldBeCover = true;
        }

        CarePhoto carePhoto = new CarePhoto(
                careId,
                uniqueFileName,
                imageUrl,
                altText.trim(),
                caption != null ? caption.trim() : null,
                nextDisplayOrder,
                shouldBeCover
        );

        CarePhoto saved = carePhotoRepository.save(carePhoto);
        return new CarePhotoDto(saved);
    }

    @Override
    public List<CarePhotoDto> uploadMultiplePhotos(String careId, List<MultipartFile> files, String altText, String caption) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        List<CarePhotoDto> uploaded = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String itemAltText = (altText != null && !altText.isBlank()) ? altText : ("Photo " + (i + 1) + " - " + careId);
            boolean isCover = (i == 0 && carePhotoRepository.countByCareId(careId) == 0);
            uploaded.add(uploadPhoto(careId, file, itemAltText, caption, isCover));
        }
        return uploaded;
    }

    @Override
    public CarePhotoDto updatePhotoInfo(Long photoId, UpdateCarePhotoRequest request) {
        CarePhoto photo = carePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo non trouvée avec l'ID : " + photoId));

        if (request.getAltText() != null && !request.getAltText().isBlank()) {
            photo.setAltText(request.getAltText().trim());
        }
        if (request.getCaption() != null) {
            photo.setCaption(request.getCaption().trim());
        }
        if (request.getDisplayOrder() != null) {
            photo.setDisplayOrder(request.getDisplayOrder());
        }

        CarePhoto updated = carePhotoRepository.save(photo);
        return new CarePhotoDto(updated);
    }

    @Override
    public CarePhotoDto setCoverPhoto(Long photoId) {
        CarePhoto photo = carePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo non trouvée avec l'ID : " + photoId));

        unsetCurrentCover(photo.getCareId());

        photo.setIsCover(true);
        CarePhoto updated = carePhotoRepository.save(photo);
        return new CarePhotoDto(updated);
    }

    @Override
    public List<CarePhotoDto> reorderPhotos(String careId, ReorderPhotosRequest request) {
        if (request == null || request.getPhotoIdsInOrder() == null) {
            return getPhotosByCareId(careId);
        }

        List<Long> photoIds = request.getPhotoIdsInOrder();
        for (int order = 0; order < photoIds.size(); order++) {
            Long photoId = photoIds.get(order);
            Optional<CarePhoto> photoOpt = carePhotoRepository.findById(photoId);
            if (photoOpt.isPresent() && (photoOpt.get().getCareId().equalsIgnoreCase(careId) || photoOpt.get().getCareId().equalsIgnoreCase(careId + "s"))) {
                CarePhoto photo = photoOpt.get();
                photo.setDisplayOrder(order + 1);
                carePhotoRepository.save(photo);
            }
        }

        return getPhotosByCareId(careId);
    }

    @Override
    public void deletePhoto(Long photoId) {
        CarePhoto photo = carePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo non trouvée avec l'ID : " + photoId));

        try {
            Path filePath = Paths.get(uploadDir).resolve(photo.getFileName());
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
        }

        carePhotoRepository.delete(photo);

        if (Boolean.TRUE.equals(photo.getIsCover())) {
            List<CarePhoto> remaining = carePhotoRepository.findByCareIdOrderByDisplayOrderAscCreatedAtDesc(photo.getCareId());
            if (!remaining.isEmpty()) {
                CarePhoto newCover = remaining.get(0);
                newCover.setIsCover(true);
                carePhotoRepository.save(newCover);
            }
        }
    }

    private void unsetCurrentCover(String careId) {
        carePhotoRepository.findByCareIdAndIsCoverTrue(careId).ifPresent(coverPhoto -> {
            coverPhoto.setIsCover(false);
            carePhotoRepository.save(coverPhoto);
        });
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier téléversé est vide");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("La taille de l'image dépasse la limite maximale autorisée (5 Mo)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Format de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Extension de fichier non autorisée. Extensions acceptées : .jpg, .jpeg, .png, .webp");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}

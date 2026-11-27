package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.dto.CabinetSettingsDto;
import com.cabinetdentaire.backend.dto.UpdateCabinetSettingsRequest;
import com.cabinetdentaire.backend.entity.CabinetSettings;
import com.cabinetdentaire.backend.repository.CabinetSettingsRepository;
import com.cabinetdentaire.backend.service.CabinetSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class CabinetSettingsServiceImpl implements CabinetSettingsService {

    private static final Logger logger = LoggerFactory.getLogger(CabinetSettingsServiceImpl.class);
    private static final long MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 Mo
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");

    private final CabinetSettingsRepository repository;

    public CabinetSettingsServiceImpl(CabinetSettingsRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public CabinetSettingsDto getCabinetSettings() {
        CabinetSettings settings = repository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
        return mapToDto(settings);
    }

    @Override
    @Transactional
    public CabinetSettingsDto updateCabinetSettings(
            UpdateCabinetSettingsRequest request,
            MultipartFile heroPhoto,
            MultipartFile whyChooseUsPhoto,
            MultipartFile aboutPhoto) {

        CabinetSettings settings = repository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        // Update text fields if provided
        if (request != null) {
            if (request.getHeroImageAlt() != null) settings.setHeroImageAlt(request.getHeroImageAlt().trim());
            if (request.getWhyChooseUsImageAlt() != null) settings.setWhyChooseUsImageAlt(request.getWhyChooseUsImageAlt().trim());
            if (request.getAboutImageAlt() != null) settings.setAboutImageAlt(request.getAboutImageAlt().trim());

            if (request.getLandlinePhone() != null) settings.setLandlinePhone(request.getLandlinePhone().trim());
            if (request.getMobilePhone() != null) settings.setMobilePhone(request.getMobilePhone().trim());
            if (request.getEmail() != null) settings.setEmail(request.getEmail().trim());
            if (request.getInstagramUrl() != null) settings.setInstagramUrl(request.getInstagramUrl().trim());

            if (request.getAddressLine() != null) settings.setAddressLine(request.getAddressLine().trim());
            if (request.getCity() != null) settings.setCity(request.getCity().trim());
            if (request.getPostalCode() != null) settings.setPostalCode(request.getPostalCode().trim());
            if (request.getCountry() != null) settings.setCountry(request.getCountry().trim());

            if (request.getGoogleMapsUrl() != null) {
                String mapsUrl = request.getGoogleMapsUrl().trim();
                settings.setGoogleMapsUrl(mapsUrl);
                resolveGoogleMapsShareLink(settings, mapsUrl);
            }
            if (request.getLatitude() != null) settings.setLatitude(request.getLatitude());
            if (request.getLongitude() != null) settings.setLongitude(request.getLongitude());

            if (request.getMondayMorning() != null) settings.setMondayMorning(request.getMondayMorning().trim());
            if (request.getMondayAfternoon() != null) settings.setMondayAfternoon(request.getMondayAfternoon().trim());
            if (request.getTuesdayMorning() != null) settings.setTuesdayMorning(request.getTuesdayMorning().trim());
            if (request.getTuesdayAfternoon() != null) settings.setTuesdayAfternoon(request.getTuesdayAfternoon().trim());
            if (request.getWednesdayMorning() != null) settings.setWednesdayMorning(request.getWednesdayMorning().trim());
            if (request.getWednesdayAfternoon() != null) settings.setWednesdayAfternoon(request.getWednesdayAfternoon().trim());
            if (request.getThursdayMorning() != null) settings.setThursdayMorning(request.getThursdayMorning().trim());
            if (request.getThursdayAfternoon() != null) settings.setThursdayAfternoon(request.getThursdayAfternoon().trim());
            if (request.getFridayMorning() != null) settings.setFridayMorning(request.getFridayMorning().trim());
            if (request.getFridayAfternoon() != null) settings.setFridayAfternoon(request.getFridayAfternoon().trim());
            if (request.getSaturdayMorning() != null) settings.setSaturdayMorning(request.getSaturdayMorning().trim());
            if (request.getSaturdayAfternoon() != null) settings.setSaturdayAfternoon(request.getSaturdayAfternoon().trim());
            if (request.getSundayMorning() != null) settings.setSundayMorning(request.getSundayMorning().trim());
            if (request.getSundayAfternoon() != null) settings.setSundayAfternoon(request.getSundayAfternoon().trim());
        }

        // Handle Image Uploads (Hero, WhyChooseUs, About)
        if (heroPhoto != null && !heroPhoto.isEmpty()) {
            String newHeroUrl = saveImageFile(heroPhoto, "hero");
            deleteOldImageFileIfSafe(settings.getHeroImageUrl());
            settings.setHeroImageUrl(newHeroUrl);
        }

        if (whyChooseUsPhoto != null && !whyChooseUsPhoto.isEmpty()) {
            String newWhyUrl = saveImageFile(whyChooseUsPhoto, "why-us");
            deleteOldImageFileIfSafe(settings.getWhyChooseUsImageUrl());
            settings.setWhyChooseUsImageUrl(newWhyUrl);
        }

        if (aboutPhoto != null && !aboutPhoto.isEmpty()) {
            String newAboutUrl = saveImageFile(aboutPhoto, "about");
            deleteOldImageFileIfSafe(settings.getAboutImageUrl());
            settings.setAboutImageUrl(newAboutUrl);
        }

        CabinetSettings saved = repository.save(settings);
        logger.info("Paramètres du cabinet mis à jour avec succès (ID: {})", saved.getId());
        return mapToDto(saved);
    }

    private String saveImageFile(MultipartFile file, String prefix) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Le fichier dépasse la taille maximale autorisée de 8 Mo");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Format de fichier non supporté. Formats acceptés : JPEG, PNG, WebP");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = ".jpg";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else if ("image/png".equalsIgnoreCase(contentType)) {
            extension = ".png";
        } else if ("image/webp".equalsIgnoreCase(contentType)) {
            extension = ".webp";
        }

        try {
            Path uploadDir = Paths.get("uploads", "site");
            Files.createDirectories(uploadDir);

            String filename = prefix + "-" + UUID.randomUUID() + extension;
            Path filePath = uploadDir.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/site/" + filename;
        } catch (IOException e) {
            logger.error("Erreur lors de la sauvegarde du fichier image du cabinet", e);
            throw new RuntimeException("Impossible d'enregistrer la photo du cabinet : " + e.getMessage(), e);
        }
    }

    private void deleteOldImageFileIfSafe(String oldUrl) {
        if (oldUrl != null && oldUrl.startsWith("/uploads/site/")) {
            try {
                String filename = oldUrl.substring("/uploads/site/".length());
                Path filePath = Paths.get("uploads", "site", filename);
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                logger.warn("Impossible de supprimer l'ancienne image : {}", oldUrl, e);
            }
        }
    }

    private CabinetSettings createDefaultSettings() {
        CabinetSettings settings = new CabinetSettings();
        settings.setHeroImageUrl("assets/hero-dentist.png");
        settings.setHeroImageAlt("Cabinet dentaire YT Smile Center à Témara");

        settings.setWhyChooseUsImageUrl("assets/why-us-clinic.png");
        settings.setWhyChooseUsImageAlt("Intérieur moderne du cabinet dentaire avec équipements de pointe");

        settings.setAboutImageUrl("assets/about-cabinet.png");
        settings.setAboutImageAlt("Accueil et espace de soin lumineux du cabinet dentaire YT Smile Center");

        settings.setLandlinePhone("05 37 61 00 84");
        settings.setMobilePhone("06 71 35 95 70");
        settings.setEmail("contact@meditrack.local");
        settings.setInstagramUrl("https://www.instagram.com/yt_smile_center/");

        settings.setAddressLine("Avenue Moulay Youssef");
        settings.setCity("Témara");
        settings.setPostalCode("12000");
        settings.setCountry("Maroc");

        settings.setGoogleMapsUrl("https://maps.app.goo.gl/SWdXYeqNsKtVG5yn6");
        settings.setLatitude(33.8983378);
        settings.setLongitude(-6.929946);

        settings.setMondayMorning("09:30 - 13:00");
        settings.setMondayAfternoon("15:30 - 19:00");

        settings.setTuesdayMorning("09:30 - 13:00");
        settings.setTuesdayAfternoon("15:30 - 19:00");

        settings.setWednesdayMorning("09:30 - 13:00");
        settings.setWednesdayAfternoon("15:30 - 19:00");

        settings.setThursdayMorning("09:30 - 13:00");
        settings.setThursdayAfternoon("15:30 - 19:00");

        settings.setFridayMorning("09:30 - 13:00");
        settings.setFridayAfternoon("15:30 - 19:00");

        settings.setSaturdayMorning("09:30 - 13:00");
        settings.setSaturdayAfternoon("Fermé");

        settings.setSundayMorning("Fermé");
        settings.setSundayAfternoon("Fermé");

        return repository.save(settings);
    }

    private CabinetSettingsDto mapToDto(CabinetSettings s) {
        CabinetSettingsDto dto = new CabinetSettingsDto();
        dto.setId(s.getId());
        dto.setHeroImageUrl(s.getHeroImageUrl());
        dto.setHeroImageAlt(s.getHeroImageAlt());
        dto.setWhyChooseUsImageUrl(s.getWhyChooseUsImageUrl());
        dto.setWhyChooseUsImageAlt(s.getWhyChooseUsImageAlt());
        dto.setAboutImageUrl(s.getAboutImageUrl());
        dto.setAboutImageAlt(s.getAboutImageAlt());

        dto.setLandlinePhone(s.getLandlinePhone());
        dto.setMobilePhone(s.getMobilePhone());
        dto.setEmail(s.getEmail());
        dto.setInstagramUrl(s.getInstagramUrl());
        dto.setAddressLine(s.getAddressLine());
        dto.setCity(s.getCity());
        dto.setPostalCode(s.getPostalCode());
        dto.setCountry(s.getCountry());

        dto.setGoogleMapsUrl(s.getGoogleMapsUrl());
        dto.setLatitude(s.getLatitude());
        dto.setLongitude(s.getLongitude());

        dto.setMondayMorning(s.getMondayMorning());
        dto.setMondayAfternoon(s.getMondayAfternoon());
        dto.setTuesdayMorning(s.getTuesdayMorning());
        dto.setTuesdayAfternoon(s.getTuesdayAfternoon());
        dto.setWednesdayMorning(s.getWednesdayMorning());
        dto.setWednesdayAfternoon(s.getWednesdayAfternoon());
        dto.setThursdayMorning(s.getThursdayMorning());
        dto.setThursdayAfternoon(s.getThursdayAfternoon());
        dto.setFridayMorning(s.getFridayMorning());
        dto.setFridayAfternoon(s.getFridayAfternoon());
        dto.setSaturdayMorning(s.getSaturdayMorning());
        dto.setSaturdayAfternoon(s.getSaturdayAfternoon());
        dto.setSundayMorning(s.getSundayMorning());
        dto.setSundayAfternoon(s.getSundayAfternoon());

        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }

    private void resolveGoogleMapsShareLink(CabinetSettings settings, String urlStr) {
        if (urlStr == null || urlStr.isBlank()) return;
        try {
            String targetUrl = urlStr;
            if (targetUrl.contains("maps.app.goo.gl") || targetUrl.contains("goo.gl/maps")) {
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URI(targetUrl).toURL().openConnection();
                conn.setInstanceFollowRedirects(false);
                conn.setConnectTimeout(4000);
                conn.setReadTimeout(4000);
                conn.connect();
                String expanded = conn.getHeaderField("Location");
                if (expanded != null && !expanded.isBlank()) {
                    targetUrl = expanded;
                }
            }

            // 1. Try to extract exact pin coordinates !3d33.8983378!4d-6.929946
            java.util.regex.Matcher pinMatcher = java.util.regex.Pattern.compile("!3d(-?\\d+\\.\\d+)!4d(-?\\d+\\.\\d+)").matcher(targetUrl);
            if (pinMatcher.find()) {
                double lat = Double.parseDouble(pinMatcher.group(1));
                double lng = Double.parseDouble(pinMatcher.group(2));
                settings.setLatitude(lat);
                settings.setLongitude(lng);
                logger.info("Coordonnées GPS exactes du repère extraites depuis le lien Google Maps : lat={}, lng={}", lat, lng);
                return;
            }

            // 2. Try to extract viewport coordinates @33.8984308,-6.9304259
            java.util.regex.Matcher coordMatcher = java.util.regex.Pattern.compile("@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)").matcher(targetUrl);
            if (coordMatcher.find()) {
                double lat = Double.parseDouble(coordMatcher.group(1));
                double lng = Double.parseDouble(coordMatcher.group(2));
                settings.setLatitude(lat);
                settings.setLongitude(lng);
                logger.info("Coordonnées GPS extraites depuis @ : lat={}, lng={}", lat, lng);
            }
        } catch (Exception e) {
            logger.warn("Impossible de résoudre le lien de partage Google Maps : {}", e.getMessage());
        }
    }
}

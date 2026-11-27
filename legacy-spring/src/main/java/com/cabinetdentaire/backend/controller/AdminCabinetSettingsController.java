package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CabinetSettingsDto;
import com.cabinetdentaire.backend.dto.UpdateCabinetSettingsRequest;
import com.cabinetdentaire.backend.service.CabinetSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/cabinet-settings")
public class AdminCabinetSettingsController {

    private final CabinetSettingsService cabinetSettingsService;

    public AdminCabinetSettingsController(CabinetSettingsService cabinetSettingsService) {
        this.cabinetSettingsService = cabinetSettingsService;
    }

    @GetMapping
    public ResponseEntity<CabinetSettingsDto> getAdminCabinetSettings() {
        CabinetSettingsDto settings = cabinetSettingsService.getCabinetSettings();
        return ResponseEntity.ok(settings);
    }

    @RequestMapping(method = {RequestMethod.PUT, RequestMethod.POST}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CabinetSettingsDto> updateCabinetSettingsMultipart(
            @RequestPart(value = "data", required = false) UpdateCabinetSettingsRequest requestData,
            @RequestParam(value = "heroImageAlt", required = false) String heroImageAlt,
            @RequestParam(value = "whyChooseUsImageAlt", required = false) String whyChooseUsImageAlt,
            @RequestParam(value = "aboutImageAlt", required = false) String aboutImageAlt,
            @RequestParam(value = "landlinePhone", required = false) String landlinePhone,
            @RequestParam(value = "mobilePhone", required = false) String mobilePhone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "instagramUrl", required = false) String instagramUrl,
            @RequestParam(value = "addressLine", required = false) String addressLine,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "postalCode", required = false) String postalCode,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "googleMapsUrl", required = false) String googleMapsUrl,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "mondayMorning", required = false) String mondayMorning,
            @RequestParam(value = "mondayAfternoon", required = false) String mondayAfternoon,
            @RequestParam(value = "tuesdayMorning", required = false) String tuesdayMorning,
            @RequestParam(value = "tuesdayAfternoon", required = false) String tuesdayAfternoon,
            @RequestParam(value = "wednesdayMorning", required = false) String wednesdayMorning,
            @RequestParam(value = "wednesdayAfternoon", required = false) String wednesdayAfternoon,
            @RequestParam(value = "thursdayMorning", required = false) String thursdayMorning,
            @RequestParam(value = "thursdayAfternoon", required = false) String thursdayAfternoon,
            @RequestParam(value = "fridayMorning", required = false) String fridayMorning,
            @RequestParam(value = "fridayAfternoon", required = false) String fridayAfternoon,
            @RequestParam(value = "saturdayMorning", required = false) String saturdayMorning,
            @RequestParam(value = "saturdayAfternoon", required = false) String saturdayAfternoon,
            @RequestParam(value = "sundayMorning", required = false) String sundayMorning,
            @RequestParam(value = "sundayAfternoon", required = false) String sundayAfternoon,
            @RequestPart(value = "heroPhoto", required = false) MultipartFile heroPhotoPart,
            @RequestParam(value = "heroPhoto", required = false) MultipartFile heroPhotoParam,
            @RequestPart(value = "whyChooseUsPhoto", required = false) MultipartFile whyChooseUsPhotoPart,
            @RequestParam(value = "whyChooseUsPhoto", required = false) MultipartFile whyChooseUsPhotoParam,
            @RequestPart(value = "aboutPhoto", required = false) MultipartFile aboutPhotoPart,
            @RequestParam(value = "aboutPhoto", required = false) MultipartFile aboutPhotoParam) {

        UpdateCabinetSettingsRequest request = (requestData != null) ? requestData : new UpdateCabinetSettingsRequest();

        if (heroImageAlt != null) request.setHeroImageAlt(heroImageAlt);
        if (whyChooseUsImageAlt != null) request.setWhyChooseUsImageAlt(whyChooseUsImageAlt);
        if (aboutImageAlt != null) request.setAboutImageAlt(aboutImageAlt);

        if (landlinePhone != null) request.setLandlinePhone(landlinePhone);
        if (mobilePhone != null) request.setMobilePhone(mobilePhone);
        if (email != null) request.setEmail(email);
        if (instagramUrl != null) request.setInstagramUrl(instagramUrl);
        if (addressLine != null) request.setAddressLine(addressLine);
        if (city != null) request.setCity(city);
        if (postalCode != null) request.setPostalCode(postalCode);
        if (country != null) request.setCountry(country);
        if (googleMapsUrl != null) request.setGoogleMapsUrl(googleMapsUrl);
        if (latitude != null) request.setLatitude(latitude);
        if (longitude != null) request.setLongitude(longitude);

        if (mondayMorning != null) request.setMondayMorning(mondayMorning);
        if (mondayAfternoon != null) request.setMondayAfternoon(mondayAfternoon);
        if (tuesdayMorning != null) request.setTuesdayMorning(tuesdayMorning);
        if (tuesdayAfternoon != null) request.setTuesdayAfternoon(tuesdayAfternoon);
        if (wednesdayMorning != null) request.setWednesdayMorning(wednesdayMorning);
        if (wednesdayAfternoon != null) request.setWednesdayAfternoon(wednesdayAfternoon);
        if (thursdayMorning != null) request.setThursdayMorning(thursdayMorning);
        if (thursdayAfternoon != null) request.setThursdayAfternoon(thursdayAfternoon);
        if (fridayMorning != null) request.setFridayMorning(fridayMorning);
        if (fridayAfternoon != null) request.setFridayAfternoon(fridayAfternoon);
        if (saturdayMorning != null) request.setSaturdayMorning(saturdayMorning);
        if (saturdayAfternoon != null) request.setSaturdayAfternoon(saturdayAfternoon);
        if (sundayMorning != null) request.setSundayMorning(sundayMorning);
        if (sundayAfternoon != null) request.setSundayAfternoon(sundayAfternoon);

        MultipartFile heroPhoto = (heroPhotoPart != null && !heroPhotoPart.isEmpty()) ? heroPhotoPart : heroPhotoParam;
        MultipartFile whyChooseUsPhoto = (whyChooseUsPhotoPart != null && !whyChooseUsPhotoPart.isEmpty()) ? whyChooseUsPhotoPart : whyChooseUsPhotoParam;
        MultipartFile aboutPhoto = (aboutPhotoPart != null && !aboutPhotoPart.isEmpty()) ? aboutPhotoPart : aboutPhotoParam;

        CabinetSettingsDto updated = cabinetSettingsService.updateCabinetSettings(request, heroPhoto, whyChooseUsPhoto, aboutPhoto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CabinetSettingsDto> updateCabinetSettingsJson(@Valid @RequestBody UpdateCabinetSettingsRequest request) {
        CabinetSettingsDto updated = cabinetSettingsService.updateCabinetSettings(request, null, null, null);
        return ResponseEntity.ok(updated);
    }
}

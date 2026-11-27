package com.cabinetdentaire.backend.dto;

import java.time.LocalDateTime;

public class CabinetSettingsDto {

    private Long id;

    // Photos
    private String heroImageUrl;
    private String heroImageAlt;
    private String whyChooseUsImageUrl;
    private String whyChooseUsImageAlt;
    private String aboutImageUrl;
    private String aboutImageAlt;

    // Coordonnées
    private String landlinePhone;
    private String mobilePhone;
    private String email;
    private String instagramUrl;
    private String addressLine;
    private String city;
    private String postalCode;
    private String country;

    // Google Maps
    private String googleMapsUrl;
    private Double latitude;
    private Double longitude;

    // Horaires
    private String mondayMorning;
    private String mondayAfternoon;
    private String tuesdayMorning;
    private String tuesdayAfternoon;
    private String wednesdayMorning;
    private String wednesdayAfternoon;
    private String thursdayMorning;
    private String thursdayAfternoon;
    private String fridayMorning;
    private String fridayAfternoon;
    private String saturdayMorning;
    private String saturdayAfternoon;
    private String sundayMorning;
    private String sundayAfternoon;

    private LocalDateTime updatedAt;

    public CabinetSettingsDto() {
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHeroImageUrl() {
        return heroImageUrl;
    }

    public void setHeroImageUrl(String heroImageUrl) {
        this.heroImageUrl = heroImageUrl;
    }

    public String getHeroImageAlt() {
        return heroImageAlt;
    }

    public void setHeroImageAlt(String heroImageAlt) {
        this.heroImageAlt = heroImageAlt;
    }

    public String getWhyChooseUsImageUrl() {
        return whyChooseUsImageUrl;
    }

    public void setWhyChooseUsImageUrl(String whyChooseUsImageUrl) {
        this.whyChooseUsImageUrl = whyChooseUsImageUrl;
    }

    public String getWhyChooseUsImageAlt() {
        return whyChooseUsImageAlt;
    }

    public void setWhyChooseUsImageAlt(String whyChooseUsImageAlt) {
        this.whyChooseUsImageAlt = whyChooseUsImageAlt;
    }

    public String getAboutImageUrl() {
        return aboutImageUrl;
    }

    public void setAboutImageUrl(String aboutImageUrl) {
        this.aboutImageUrl = aboutImageUrl;
    }

    public String getAboutImageAlt() {
        return aboutImageAlt;
    }

    public void setAboutImageAlt(String aboutImageAlt) {
        this.aboutImageAlt = aboutImageAlt;
    }

    public String getLandlinePhone() {
        return landlinePhone;
    }

    public void setLandlinePhone(String landlinePhone) {
        this.landlinePhone = landlinePhone;
    }

    public String getMobilePhone() {
        return mobilePhone;
    }

    public void setMobilePhone(String mobilePhone) {
        this.mobilePhone = mobilePhone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getGoogleMapsUrl() {
        return googleMapsUrl;
    }

    public void setGoogleMapsUrl(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getMondayMorning() {
        return mondayMorning;
    }

    public void setMondayMorning(String mondayMorning) {
        this.mondayMorning = mondayMorning;
    }

    public String getMondayAfternoon() {
        return mondayAfternoon;
    }

    public void setMondayAfternoon(String mondayAfternoon) {
        this.mondayAfternoon = mondayAfternoon;
    }

    public String getTuesdayMorning() {
        return tuesdayMorning;
    }

    public void setTuesdayMorning(String tuesdayMorning) {
        this.tuesdayMorning = tuesdayMorning;
    }

    public String getTuesdayAfternoon() {
        return tuesdayAfternoon;
    }

    public void setTuesdayAfternoon(String tuesdayAfternoon) {
        this.tuesdayAfternoon = tuesdayAfternoon;
    }

    public String getWednesdayMorning() {
        return wednesdayMorning;
    }

    public void setWednesdayMorning(String wednesdayMorning) {
        this.wednesdayMorning = wednesdayMorning;
    }

    public String getWednesdayAfternoon() {
        return wednesdayAfternoon;
    }

    public void setWednesdayAfternoon(String wednesdayAfternoon) {
        this.wednesdayAfternoon = wednesdayAfternoon;
    }

    public String getThursdayMorning() {
        return thursdayMorning;
    }

    public void setThursdayMorning(String thursdayMorning) {
        this.thursdayMorning = thursdayMorning;
    }

    public String getThursdayAfternoon() {
        return thursdayAfternoon;
    }

    public void setThursdayAfternoon(String thursdayAfternoon) {
        this.thursdayAfternoon = thursdayAfternoon;
    }

    public String getFridayMorning() {
        return fridayMorning;
    }

    public void setFridayMorning(String fridayMorning) {
        this.fridayMorning = fridayMorning;
    }

    public String getFridayAfternoon() {
        return fridayAfternoon;
    }

    public void setFridayAfternoon(String fridayAfternoon) {
        this.fridayAfternoon = fridayAfternoon;
    }

    public String getSaturdayMorning() {
        return saturdayMorning;
    }

    public void setSaturdayMorning(String saturdayMorning) {
        this.saturdayMorning = saturdayMorning;
    }

    public String getSaturdayAfternoon() {
        return saturdayAfternoon;
    }

    public void setSaturdayAfternoon(String saturdayAfternoon) {
        this.saturdayAfternoon = saturdayAfternoon;
    }

    public String getSundayMorning() {
        return sundayMorning;
    }

    public void setSundayMorning(String sundayMorning) {
        this.sundayMorning = sundayMorning;
    }

    public String getSundayAfternoon() {
        return sundayAfternoon;
    }

    public void setSundayAfternoon(String sundayAfternoon) {
        this.sundayAfternoon = sundayAfternoon;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

package com.cabinetdentaire.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cabinet_settings")
public class CabinetSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Photos principales du site ---
    @Column(name = "hero_image_url", length = 500)
    private String heroImageUrl;

    @Column(name = "hero_image_alt", length = 300)
    private String heroImageAlt;

    @Column(name = "why_choose_us_image_url", length = 500)
    private String whyChooseUsImageUrl;

    @Column(name = "why_choose_us_image_alt", length = 300)
    private String whyChooseUsImageAlt;

    @Column(name = "about_image_url", length = 500)
    private String aboutImageUrl;

    @Column(name = "about_image_alt", length = 300)
    private String aboutImageAlt;

    // --- Coordonnées et réseaux sociaux ---
    @Column(name = "landline_phone", length = 50)
    private String landlinePhone;

    @Column(name = "mobile_phone", length = 50)
    private String mobilePhone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;

    @Column(name = "address_line", length = 300)
    private String addressLine;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "postal_code", length = 30)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    // --- Localisation Google Maps ---
    @Column(name = "google_maps_url", length = 1000)
    private String googleMapsUrl;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // --- Horaires d'ouverture ---
    @Column(name = "monday_morning", length = 50)
    private String mondayMorning;

    @Column(name = "monday_afternoon", length = 50)
    private String mondayAfternoon;

    @Column(name = "tuesday_morning", length = 50)
    private String tuesdayMorning;

    @Column(name = "tuesday_afternoon", length = 50)
    private String tuesdayAfternoon;

    @Column(name = "wednesday_morning", length = 50)
    private String wednesdayMorning;

    @Column(name = "wednesday_afternoon", length = 50)
    private String wednesdayAfternoon;

    @Column(name = "thursday_morning", length = 50)
    private String thursdayMorning;

    @Column(name = "thursday_afternoon", length = 50)
    private String thursdayAfternoon;

    @Column(name = "friday_morning", length = 50)
    private String fridayMorning;

    @Column(name = "friday_afternoon", length = 50)
    private String fridayAfternoon;

    @Column(name = "saturday_morning", length = 50)
    private String saturdayMorning;

    @Column(name = "saturday_afternoon", length = 50)
    private String saturdayAfternoon;

    @Column(name = "sunday_morning", length = 50)
    private String sundayMorning;

    @Column(name = "sunday_afternoon", length = 50)
    private String sundayAfternoon;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CabinetSettings() {
    }

    @PrePersist
    @PreUpdate
    public void onSave() {
        this.updatedAt = LocalDateTime.now();
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

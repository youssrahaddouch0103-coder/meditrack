package com.cabinetdentaire.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "care_photos", indexes = {
    @Index(name = "idx_care_photo_care_id", columnList = "care_id"),
    @Index(name = "idx_care_photo_display_order", columnList = "care_id, display_order")
})
public class CarePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "care_id", nullable = false, length = 100)
    private String careId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "alt_text", nullable = false, length = 255)
    private String altText;

    @Column(name = "caption", length = 500)
    private String caption;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_cover", nullable = false)
    private Boolean isCover = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CarePhoto() {
    }

    public CarePhoto(String careId, String fileName, String imageUrl, String altText, String caption, Integer displayOrder, Boolean isCover) {
        this.careId = careId;
        this.fileName = fileName;
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.caption = caption;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.isCover = isCover != null ? isCover : false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCareId() {
        return careId;
    }

    public void setCareId(String careId) {
        this.careId = careId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsCover() {
        return isCover;
    }

    public void setIsCover(Boolean isCover) {
        this.isCover = isCover;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

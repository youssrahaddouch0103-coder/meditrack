package com.cabinetdentaire.backend.dto;

import com.cabinetdentaire.backend.entity.CarePhoto;
import java.time.LocalDateTime;

public class CarePhotoDto {

    private Long id;
    private String careId;
    private String fileName;
    private String imageUrl;
    private String altText;
    private String caption;
    private Integer displayOrder;
    private Boolean isCover;
    private LocalDateTime createdAt;

    public CarePhotoDto() {
    }

    public CarePhotoDto(CarePhoto entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.careId = entity.getCareId();
            this.fileName = entity.getFileName();
            this.imageUrl = entity.getImageUrl();
            this.altText = entity.getAltText();
            this.caption = entity.getCaption();
            this.displayOrder = entity.getDisplayOrder();
            this.isCover = entity.getIsCover();
            this.createdAt = entity.getCreatedAt();
        }
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

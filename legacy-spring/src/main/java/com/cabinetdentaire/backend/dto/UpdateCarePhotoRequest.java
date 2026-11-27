package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCarePhotoRequest {

    @NotBlank(message = "Le texte alternatif est obligatoire")
    @Size(max = 255, message = "Le texte alternatif ne peut pas dépasser 255 caractères")
    private String altText;

    @Size(max = 500, message = "La légende ne peut pas dépasser 500 caractères")
    private String caption;

    private Integer displayOrder;

    public UpdateCarePhotoRequest() {
    }

    public UpdateCarePhotoRequest(String altText, String caption, Integer displayOrder) {
        this.altText = altText;
        this.caption = caption;
        this.displayOrder = displayOrder;
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
}

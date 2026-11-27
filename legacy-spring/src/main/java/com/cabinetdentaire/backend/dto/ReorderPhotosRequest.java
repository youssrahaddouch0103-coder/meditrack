package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ReorderPhotosRequest {

    @NotEmpty(message = "La liste d'identifiants de photos ne peut pas être vide")
    private List<Long> photoIdsInOrder;

    public ReorderPhotosRequest() {
    }

    public ReorderPhotosRequest(List<Long> photoIdsInOrder) {
        this.photoIdsInOrder = photoIdsInOrder;
    }

    public List<Long> getPhotoIdsInOrder() {
        return photoIdsInOrder;
    }

    public void setPhotoIdsInOrder(List<Long> photoIdsInOrder) {
        this.photoIdsInOrder = photoIdsInOrder;
    }
}

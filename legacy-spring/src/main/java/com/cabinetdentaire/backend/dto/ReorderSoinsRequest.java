package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ReorderSoinsRequest {

    @NotEmpty(message = "La liste d'identifiants ne peut pas être vide")
    private List<Long> soinIdsInOrder;

    public ReorderSoinsRequest() {
    }

    public ReorderSoinsRequest(List<Long> soinIdsInOrder) {
        this.soinIdsInOrder = soinIdsInOrder;
    }

    public List<Long> getSoinIdsInOrder() {
        return soinIdsInOrder;
    }

    public void setSoinIdsInOrder(List<Long> soinIdsInOrder) {
        this.soinIdsInOrder = soinIdsInOrder;
    }
}

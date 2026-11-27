package com.cabinetdentaire.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ReorderTeamRequest {

    @NotNull(message = "La liste des éléments est obligatoire")
    @Valid
    private List<TeamOrderItem> items;

    public ReorderTeamRequest() {
    }

    public List<TeamOrderItem> getItems() {
        return items;
    }

    public void setItems(List<TeamOrderItem> items) {
        this.items = items;
    }

    public static class TeamOrderItem {
        @NotNull(message = "L'ID du membre est obligatoire")
        private Long id;

        @NotNull(message = "L'ordre d'affichage est obligatoire")
        private Integer displayOrder;

        public TeamOrderItem() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public void setDisplayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
        }
    }
}

package com.cabinetdentaire.backend.dto;

import jakarta.validation.constraints.Size;

public class RefusRendezVousRequest {

    @Size(max = 500, message = "Le motif de refus ne peut pas dépasser 500 caractères")
    private String motifRefus;

    public RefusRendezVousRequest() {
    }

    public RefusRendezVousRequest(String motifRefus) {
        this.motifRefus = motifRefus;
    }

    public String getMotifRefus() {
        return motifRefus;
    }

    public void setMotifRefus(String motifRefus) {
        this.motifRefus = motifRefus;
    }
}

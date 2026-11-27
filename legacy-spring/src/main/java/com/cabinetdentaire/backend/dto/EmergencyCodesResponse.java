package com.cabinetdentaire.backend.dto;

import java.util.List;

public class EmergencyCodesResponse {

    private List<String> codes;
    private String warning;

    public EmergencyCodesResponse() {
    }

    public EmergencyCodesResponse(List<String> codes, String warning) {
        this.codes = codes;
        this.warning = warning;
    }

    public List<String> getCodes() {
        return codes;
    }

    public void setCodes(List<String> codes) {
        this.codes = codes;
    }

    public String getWarning() {
        return warning;
    }

    public void setWarning(String warning) {
        this.warning = warning;
    }
}

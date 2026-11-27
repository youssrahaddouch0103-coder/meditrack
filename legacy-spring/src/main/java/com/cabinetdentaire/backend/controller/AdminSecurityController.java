package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.*;
import com.cabinetdentaire.backend.service.AdminSecurityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/security")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSecurityController {

    private final AdminSecurityService securityService;

    public AdminSecurityController(AdminSecurityService securityService) {
        this.securityService = securityService;
    }

    @GetMapping("/account-info")
    public ResponseEntity<AdminAccountInfoResponse> getAccountInfo(Authentication authentication) {
        AdminAccountInfoResponse info = securityService.getAdminAccountInfo(authentication.getName());
        return ResponseEntity.ok(info);
    }

    @PutMapping("/update-login-email")
    public ResponseEntity<GenericResponse> updateLoginEmail(@Valid @RequestBody UpdateLoginEmailRequest request,
                                                             Authentication authentication) {
        GenericResponse response = securityService.updateLoginEmail(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-password")
    public ResponseEntity<GenericResponse> updatePassword(@Valid @RequestBody UpdatePasswordRequest request,
                                                           Authentication authentication) {
        GenericResponse response = securityService.updatePassword(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-emergency-codes")
    public ResponseEntity<EmergencyCodesResponse> generateEmergencyCodes(Authentication authentication) {
        EmergencyCodesResponse response = securityService.generateEmergencyCodes(authentication.getName());
        return ResponseEntity.ok(response);
    }
}

package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.*;
import com.cabinetdentaire.backend.service.AdminSecurityService;
import com.cabinetdentaire.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AdminSecurityService securityService;

    public AuthController(AuthService authService, AdminSecurityService securityService) {
        this.authService = authService;
        this.securityService = securityService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse authResponse = authService.login(loginRequest);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<GenericResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
                                                         HttpServletRequest servletRequest) {
        String frontendBaseUrl = extractFrontendBaseUrl(servletRequest);
        GenericResponse response = securityService.requestPasswordReset(request, frontendBaseUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<GenericResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        GenericResponse response = securityService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recover-emergency")
    public ResponseEntity<GenericResponse> recoverEmergency(@Valid @RequestBody EmergencyRecoveryRequest request) {
        GenericResponse response = securityService.recoverWithEmergencyCode(request);
        return ResponseEntity.ok(response);
    }

    private String extractFrontendBaseUrl(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isBlank() && !origin.contains(":8080")) {
            return origin;
        }
        String referer = request.getHeader("Referer");
        if (referer != null && !referer.isBlank() && !referer.contains(":8080")) {
            try {
                java.net.URI uri = new java.net.URI(referer);
                String authority = uri.getAuthority();
                if (authority != null && !authority.contains(":8080")) {
                    return uri.getScheme() + "://" + authority;
                }
            } catch (Exception e) {}
        }
        return "http://localhost:4200";
    }
}

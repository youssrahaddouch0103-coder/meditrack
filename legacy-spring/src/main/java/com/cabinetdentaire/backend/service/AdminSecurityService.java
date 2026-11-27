package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.*;

public interface AdminSecurityService {

    GenericResponse requestPasswordReset(ForgotPasswordRequest request, String frontendBaseUrl);

    GenericResponse resetPassword(ResetPasswordRequest request);

    GenericResponse recoverWithEmergencyCode(EmergencyRecoveryRequest request);

    AdminAccountInfoResponse getAdminAccountInfo(String currentUsername);

    GenericResponse updateLoginEmail(String currentUsername, UpdateLoginEmailRequest request);

    GenericResponse updatePassword(String currentUsername, UpdatePasswordRequest request);

    EmergencyCodesResponse generateEmergencyCodes(String currentUsername);
}

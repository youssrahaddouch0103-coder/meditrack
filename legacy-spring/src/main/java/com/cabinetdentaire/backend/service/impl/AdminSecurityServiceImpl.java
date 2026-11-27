package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.dto.*;

import com.cabinetdentaire.backend.entity.PasswordResetToken;
import com.cabinetdentaire.backend.entity.RecoveryCode;
import com.cabinetdentaire.backend.entity.Role;
import com.cabinetdentaire.backend.entity.Utilisateur;
import com.cabinetdentaire.backend.repository.PasswordResetTokenRepository;
import com.cabinetdentaire.backend.repository.RecoveryCodeRepository;
import com.cabinetdentaire.backend.repository.UtilisateurRepository;
import com.cabinetdentaire.backend.service.AdminSecurityEmailService;
import com.cabinetdentaire.backend.service.AdminSecurityService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminSecurityServiceImpl implements AdminSecurityService {

    private static final Logger log = LoggerFactory.getLogger(AdminSecurityServiceImpl.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude ambiguous chars (0, O, 1, I)

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final RecoveryCodeRepository recoveryCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSecurityEmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:4200}")
    private String defaultFrontendUrl;

    public AdminSecurityServiceImpl(UtilisateurRepository utilisateurRepository,
                                    PasswordResetTokenRepository tokenRepository,
                                    RecoveryCodeRepository recoveryCodeRepository,
                                    PasswordEncoder passwordEncoder,
                                    AdminSecurityEmailService emailService) {
        this.utilisateurRepository = utilisateurRepository;
        this.tokenRepository = tokenRepository;
        this.recoveryCodeRepository = recoveryCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    private String resolveBaseUrl(String frontendBaseUrl) {
        String url = (frontendBaseUrl != null && !frontendBaseUrl.isBlank() && !frontendBaseUrl.contains(":8080"))
                ? frontendBaseUrl.trim()
                : (defaultFrontendUrl != null && !defaultFrontendUrl.isBlank() ? defaultFrontendUrl.trim() : "http://localhost:4200");
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    @Override
    @Transactional
    public GenericResponse requestPasswordReset(ForgotPasswordRequest request, String frontendBaseUrl) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Demande de réinitialisation de mot de passe reçue pour l'email: {}", email);

        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);
        if (utilisateurOpt.isPresent() && utilisateurOpt.get().isActif()) {
            Utilisateur utilisateur = utilisateurOpt.get();

            // Invalider les anciens tokens de cet utilisateur
            tokenRepository.deleteByUtilisateur(utilisateur);

            String rawToken = UUID.randomUUID().toString() + "-" + generateRandomAlphanumeric(16);
            String tokenHash = hashToken(rawToken);

            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(30);
            PasswordResetToken tokenEntity = new PasswordResetToken(utilisateur, tokenHash, "PASSWORD_RESET", expiresAt);
            tokenRepository.save(tokenEntity);

            String baseUrl = resolveBaseUrl(frontendBaseUrl);
            String resetLink = baseUrl + "/admin/reset-password?token=" + rawToken;

            emailService.sendPasswordResetEmail(utilisateur.getEmail(), resetLink);
        }

        // Message générique anti-énumération
        return new GenericResponse(true, "Si les informations correspondent à un compte administrateur, un e-mail de réinitialisation a été envoyé.");
    }

    @Override
    @Transactional
    public GenericResponse resetPassword(ResetPasswordRequest request) {
        String rawToken = request.getToken().trim();
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Jeton de réinitialisation invalide ou expiré."));

        if (resetToken.isUsed() || resetToken.isExpired() || !"PASSWORD_RESET".equals(resetToken.getType())) {
            throw new IllegalArgumentException("Le jeton de réinitialisation est expiré ou a déjà été utilisé.");
        }

        Utilisateur utilisateur = resetToken.getUtilisateur();
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(utilisateur);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        // Invalider tous les autres tokens
        tokenRepository.deleteByUtilisateur(utilisateur);

        emailService.sendSecurityNotification(utilisateur.getEmail(),
                "Votre mot de passe a été modifié",
                "Le mot de passe de votre compte administrateur a été réinitialisé avec succès.");

        log.info("Mot de passe administrateur réinitialisé avec succès pour l'email: {}", utilisateur.getEmail());
        return new GenericResponse(true, "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.");
    }

    @Override
    @Transactional
    public GenericResponse recoverWithEmergencyCode(EmergencyRecoveryRequest request) {
        String rawCode = request.getRecoveryCode().trim().toUpperCase().replaceAll("\\s+", "");
        String newLoginEmail = request.getNewLoginEmail().trim().toLowerCase();

        Utilisateur admin = utilisateurRepository.findFirstByRole(Role.ADMIN)
                .orElseThrow(() -> new IllegalArgumentException("Compte administrateur introuvable."));

        List<RecoveryCode> activeCodes = recoveryCodeRepository.findByUtilisateurAndUsedFalse(admin);
        RecoveryCode matchedCode = null;

        for (RecoveryCode code : activeCodes) {
            if (passwordEncoder.matches(rawCode, code.getCodeHash())) {
                matchedCode = code;
                break;
            }
        }

        if (matchedCode == null) {
            throw new IllegalArgumentException("Code de récupération d'urgence invalide ou déjà utilisé.");
        }

        // Vérifier si la nouvelle adresse e-mail n'est pas déjà prise par un autre compte
        Optional<Utilisateur> existing = utilisateurRepository.findByEmail(newLoginEmail);
        if (existing.isPresent() && !existing.get().getId().equals(admin.getId())) {
            throw new IllegalArgumentException("Cette adresse e-mail de connexion est déjà utilisée.");
        }

        String oldEmail = admin.getEmail();
        admin.setEmail(newLoginEmail);
        admin.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(admin);

        matchedCode.setUsed(true);
        matchedCode.setUsedAt(LocalDateTime.now());
        recoveryCodeRepository.save(matchedCode);

        tokenRepository.deleteByUtilisateur(admin);

        emailService.sendSecurityNotification(newLoginEmail,
                "Récupération d'urgence du compte administrateur",
                "Votre compte administrateur a été réinitialisé à l'aide d'un code de secours. Votre nouvel identifiant de connexion est : " + newLoginEmail);

        if (oldEmail != null && !oldEmail.equalsIgnoreCase(newLoginEmail)) {
            emailService.sendSecurityNotification(oldEmail,
                    "Alerte de sécurité : Identifiant administrateur réinitialisé",
                    "Le compte administrateur précédemment lié à cette adresse a été mis à jour vers : " + newLoginEmail);
        }

        log.warn("Récupération d'urgence réussie via code d'urgence pour l'email: {}", newLoginEmail);
        return new GenericResponse(true, "Votre compte administrateur a été récupéré avec succès. Vous pouvez vous connecter avec votre nouvel e-mail : " + newLoginEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAccountInfoResponse getAdminAccountInfo(String currentUsername) {
        Utilisateur admin = utilisateurRepository.findByEmail(currentUsername.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        List<RecoveryCode> activeCodes = recoveryCodeRepository.findByUtilisateurAndUsedFalse(admin);

        return new AdminAccountInfoResponse(
                admin.getId(),
                admin.getNom(),
                admin.getEmail(),
                admin.getRole().name(),
                admin.isActif(),
                admin.getDateCreation(),
                admin.getDateModification(),
                activeCodes.size()
        );
    }

    @Override
    @Transactional
    public GenericResponse updateLoginEmail(String currentUsername, UpdateLoginEmailRequest request) {
        Utilisateur admin = utilisateurRepository.findByEmail(currentUsername.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getMotDePasse())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect.");
        }

        String newEmail = request.getNewLoginEmail().trim().toLowerCase();
        Optional<Utilisateur> existing = utilisateurRepository.findByEmail(newEmail);
        if (existing.isPresent() && !existing.get().getId().equals(admin.getId())) {
            throw new IllegalArgumentException("Cet email de connexion est déjà utilisé.");
        }

        String oldEmail = admin.getEmail();
        admin.setEmail(newEmail);
        utilisateurRepository.save(admin);

        emailService.sendSecurityNotification(newEmail,
                "Modification de votre email de connexion",
                "Votre nouvel email de connexion administrateur est désormais : " + newEmail);

        if (oldEmail != null && !oldEmail.equals(newEmail)) {
            emailService.sendSecurityNotification(oldEmail,
                    "Alerte de sécurité : Email de connexion modifié",
                    "L'email de connexion administrateur lié à cet ancien identifiant a été modifié vers : " + newEmail);
        }

        return new GenericResponse(true, "Email de connexion mis à jour avec succès. Veuillez vous reconnecter.");
    }

    @Override
    @Transactional
    public GenericResponse updatePassword(String currentUsername, UpdatePasswordRequest request) {
        Utilisateur admin = utilisateurRepository.findByEmail(currentUsername.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getMotDePasse())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect.");
        }

        admin.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(admin);

        tokenRepository.deleteByUtilisateur(admin);

        emailService.sendSecurityNotification(admin.getEmail(),
                "Votre mot de passe a été modifié",
                "Le mot de passe de votre compte administrateur a été modifié avec succès.");

        return new GenericResponse(true, "Mot de passe mis à jour avec succès.");
    }

    @Override
    @Transactional
    public EmergencyCodesResponse generateEmergencyCodes(String currentUsername) {
        Utilisateur admin = utilisateurRepository.findByEmail(currentUsername.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        // Supprimer les anciens codes d'urgence
        recoveryCodeRepository.deleteByUtilisateur(admin);

        List<String> plainCodes = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            String codePart1 = generateRandomCodeSegment(4);
            String codePart2 = generateRandomCodeSegment(4);
            String plainCode = codePart1 + "-" + codePart2;
            plainCodes.add(plainCode);

            String codeHash = passwordEncoder.encode(plainCode);
            RecoveryCode recoveryCode = new RecoveryCode(admin, codeHash);
            recoveryCodeRepository.save(recoveryCode);
        }

        log.info("10 nouveaux codes de récupération d'urgence générés avec succès pour l'administrateur ID: {}", admin.getId());
        return new EmergencyCodesResponse(plainCodes,
                "Conservez ces 10 codes dans un endroit sécurisé. Ils ne seront plus affichés une fois cette fenêtre fermée.");
    }

    private String generateRandomCodeSegment(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CODE_CHARS.charAt(SECURE_RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private String generateRandomAlphanumeric(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(SECURE_RANDOM.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur de hachage du token", e);
        }
    }
}

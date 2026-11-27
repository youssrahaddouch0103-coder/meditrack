package com.cabinetdentaire.backend.config;

import com.cabinetdentaire.backend.entity.Role;
import com.cabinetdentaire.backend.entity.Utilisateur;
import com.cabinetdentaire.backend.repository.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:${app.admin.email:contact@meditrack.local}}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:${app.admin.password:admin123456}}")
    private String adminPassword;

    public AdminUserInitializer(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String targetEmail = adminEmail.trim();

        // 1. Migrer l'ancien compte admin@cabinet.local si présent
        utilisateurRepository.findByEmail("admin@cabinet.local").ifPresent(oldAdmin -> {
            oldAdmin.setEmail(targetEmail);
            if (oldAdmin.getNom() == null || oldAdmin.getNom().isBlank()) {
                oldAdmin.setNom("Administrateur YT Smile Center");
            }
            utilisateurRepository.save(oldAdmin);
            log.info("Migration compte admin@cabinet.local -> email: {}", targetEmail);
        });

        // 2. Migrer l'ancien compte admin@meditrack.local s'il était utilisé comme login email
        utilisateurRepository.findByEmail("admin@meditrack.local").ifPresent(legacyAdmin -> {
            if (!targetEmail.equalsIgnoreCase("admin@meditrack.local")) {
                legacyAdmin.setEmail(targetEmail);
                if (legacyAdmin.getNom() == null || legacyAdmin.getNom().isBlank()) {
                    legacyAdmin.setNom("Administrateur YT Smile Center");
                }
                utilisateurRepository.save(legacyAdmin);
                log.info("Migration compte admin@meditrack.local -> login_email: {}", targetEmail);
            }
        });

        // 3. Créer ou compléter le compte administrateur cible
        if (!utilisateurRepository.existsByEmail(targetEmail)) {
            Utilisateur admin = new Utilisateur();
            admin.setEmail(targetEmail);
            admin.setMotDePasse(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setActif(true);
            admin.setNom("Administrateur YT Smile Center");

            utilisateurRepository.save(admin);
            log.info("Compte administrateur créé avec succès pour l'email: {}", targetEmail);
        } else {
            utilisateurRepository.findByEmail(targetEmail).ifPresent(existingAdmin -> {
                existingAdmin.setNom("Administrateur YT Smile Center");
                existingAdmin.setMotDePasse(passwordEncoder.encode(adminPassword));
                utilisateurRepository.save(existingAdmin);
                log.info("Données du compte administrateur synchronisées avec succès.");
            });
        }
    }
}

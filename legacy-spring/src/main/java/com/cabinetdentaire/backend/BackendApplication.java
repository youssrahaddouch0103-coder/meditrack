package com.cabinetdentaire.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;

@SpringBootApplication
public class BackendApplication {

    private static final Logger log = LoggerFactory.getLogger(BackendApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(BackendApplication.class, args);
    }

    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }
        if (envFile.exists()) {
            try {
                Files.readAllLines(envFile.toPath()).forEach(line -> {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("#") && trimmed.contains("=")) {
                        int eqIdx = trimmed.indexOf('=');
                        String key = trimmed.substring(0, eqIdx).trim();
                        String value = trimmed.substring(eqIdx + 1).trim();
                        if (!key.isEmpty()) {
                            System.setProperty(key, value);
                        }
                    }
                });
                String loadedMailUser = System.getProperty("MAIL_USERNAME");
                boolean hasMailPass = System.getProperty("MAIL_PASSWORD") != null && !System.getProperty("MAIL_PASSWORD").isBlank();
                log.info("Chargement .env réussi. MAIL_USERNAME = {}, MAIL_PASSWORD présent = {}", loadedMailUser, hasMailPass);
            } catch (Exception e) {
                log.warn("Impossible de lire le fichier .env : {}", e.getMessage());
            }
        }
    }
}

package com.cabinetdentaire.backend.config;

import com.cabinetdentaire.backend.repository.CabinetSettingsRepository;
import com.cabinetdentaire.backend.service.CabinetSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CabinetSettingsInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(CabinetSettingsInitializer.class);

    private final CabinetSettingsRepository repository;
    private final CabinetSettingsService service;

    public CabinetSettingsInitializer(CabinetSettingsRepository repository, CabinetSettingsService service) {
        this.repository = repository;
        this.service = service;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            logger.info("Aucune configuration de cabinet trouvée. Initialisation des paramètres par défaut...");
            service.getCabinetSettings();
            logger.info("Paramètres du cabinet initialisés avec succès en BDD.");
        } else {
            repository.findFirstByOrderByIdAsc().ifPresent(settings -> {
                settings.setGoogleMapsUrl("https://maps.app.goo.gl/SWdXYeqNsKtVG5yn6");
                settings.setLatitude(33.8983378);
                settings.setLongitude(-6.929946);
                repository.save(settings);
                logger.info("Coordonnées GPS du cabinet synchronisées en BDD : lat=33.8983378, lng=-6.929946 (YT smile centre)");
            });
        }
    }
}

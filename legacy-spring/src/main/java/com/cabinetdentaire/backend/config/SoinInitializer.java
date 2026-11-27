package com.cabinetdentaire.backend.config;

import com.cabinetdentaire.backend.entity.CarePhoto;
import com.cabinetdentaire.backend.entity.Soin;
import com.cabinetdentaire.backend.entity.StatutSoin;
import com.cabinetdentaire.backend.repository.CarePhotoRepository;
import com.cabinetdentaire.backend.repository.SoinRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class SoinInitializer implements CommandLineRunner {

        private static final Logger logger = LoggerFactory.getLogger(SoinInitializer.class);

        private final SoinRepository soinRepository;
        private final CarePhotoRepository carePhotoRepository;

        public SoinInitializer(SoinRepository soinRepository, CarePhotoRepository carePhotoRepository) {
                this.soinRepository = soinRepository;
                this.carePhotoRepository = carePhotoRepository;
        }

        @Override
        public void run(String... args) {
                logger.info("Vérification et initialisation des soins du cabinet YT Smile Center en base de données...");

                createCareIfNotExists(
                                "couronne-zircone",
                                "Couronnes en zircone",
                                "Les couronnes en zircone permettent de restaurer une dent fragilisée ou abîmée tout en offrant un résultat résistant, esthétique et proche de l’apparence naturelle des dents.",
                                "La zircone est un matériau reconnu pour sa solidité et son rendu esthétique. Une couronne peut être proposée pour protéger une dent endommagée, restaurer sa forme ou améliorer l’harmonie du sourire. Une consultation est nécessaire pour déterminer la solution adaptée à chaque patient.",
                                "assets/images/soins/couronne-zircone.png",
                                "Couronne dentaire esthétique en zircone",
                                1);

                createCareIfNotExists(
                                "restauration-composite",
                                "Restaurations en composite",
                                "Le composite est un matériau esthétique utilisé pour réparer une dent cariée, cassée ou usée en respectant sa teinte naturelle.",
                                "La restauration en composite permet de reconstruire une partie de la dent avec un matériau dont la couleur est choisie pour se rapprocher des dents naturelles. Elle peut être utilisée pour traiter certaines caries ou corriger de petites imperfections dentaires.",
                                "assets/images/soins/restauration-composite.png",
                                "Restauration dentaire en résine composite naturelle",
                                2);

                createCareIfNotExists(
                                "prothese-amovible",
                                "Prothèses amovibles",
                                "Les prothèses amovibles remplacent une ou plusieurs dents absentes afin d’améliorer la mastication, le confort et l’esthétique du sourire.",
                                "Partielle ou complète, une prothèse amovible est conçue selon la situation bucco-dentaire du patient. Elle doit être adaptée avec précision et entretenue régulièrement pour préserver le confort et la santé de la bouche.",
                                "assets/images/soins/prothese-amovible.png",
                                "Prothèse dentaire amovible esthétique et confortable",
                                3);

                createCareIfNotExists(
                                "detartrage",
                                "Détartrage",
                                "Le détartrage élimine le tartre et la plaque dentaire difficiles à retirer par le brossage quotidien.",
                                "Réalisé au cabinet, le détartrage participe à la prévention des problèmes gingivaux et aide à maintenir une bonne hygiène bucco-dentaire. La fréquence recommandée dépend de l’état des dents et des gencives de chaque patient.",
                                "assets/images/soins/detartrage.png",
                                "Soin de détartrage et hygiène dentaire professionnelle",
                                4);

                createCareIfNotExists(
                                "blanchiment-dentaire",
                                "Blanchiment dentaire",
                                "Le blanchiment dentaire vise à éclaircir la teinte des dents grâce à un traitement encadré et adapté au sourire du patient.",
                                "Avant le traitement, un examen bucco-dentaire permet de vérifier que le blanchiment convient au patient. Le résultat peut varier selon la teinte initiale, l’état des dents et les habitudes quotidiennes.",
                                "assets/images/soins/blanchiment-dentaire.png",
                                "Sourire naturel après traitement de blanchiment dentaire",
                                5);

                // Initialiser les albums photos spécifiques et dédiés de chaque soin
                initPhotosForCare("couronne-zircone", List.of(
                                new CarePhoto("couronne-zircone", "couronne-zircone-1.png",
                                                "assets/images/soins/couronne-zircone-1.png",
                                                "Couronne en zircone - Pose clinique et rendu naturel",
                                                "Photo 1 / 3 — Vue de face et esthétique dentaire", 1, true),
                                new CarePhoto("couronne-zircone", "couronne-zircone-2.png",
                                                "assets/images/soins/couronne-zircone-2.png",
                                                "Couronne en zircone - Vue rapprochée des détails céramiques",
                                                "Photo 2 / 3 — Préparation clinique et empreinte de précision", 2,
                                                false),
                                new CarePhoto("couronne-zircone", "couronne-zircone-3.png",
                                                "assets/images/soins/couronne-zircone-3.png",
                                                "Couronne en zircone - Sourire harmonieux rétabli",
                                                "Photo 3 / 3 — Résultat esthétique final après cimentation", 3,
                                                false)));

                initPhotosForCare("restauration-composite", List.of(
                                new CarePhoto("restauration-composite", "restauration-composite-1.png",
                                                "assets/images/soins/restauration-composite-1.png",
                                                "Restauration en résine composite naturelle",
                                                "Photo 1 / 3 — Obturation invisible de la cavité", 1, true),
                                new CarePhoto("restauration-composite", "restauration-composite-2.png",
                                                "assets/images/soins/restauration-composite-2.png",
                                                "Sélection de la teinte biomimétique",
                                                "Photo 2 / 3 — Application stratifiée de la résine", 2, false),
                                new CarePhoto("restauration-composite", "restauration-composite-3.png",
                                                "assets/images/soins/restauration-composite-3.png",
                                                "Polissage et lissage de surface",
                                                "Photo 3 / 3 — Brillance et intégration marginale parfaite", 3,
                                                false)));

                initPhotosForCare("prothese-amovible", List.of(
                                new CarePhoto("prothese-amovible", "prothese-amovible-1.png",
                                                "assets/images/soins/prothese-amovible-1.png",
                                                "Prothèse dentaire amovible sur mesure",
                                                "Photo 1 / 3 — Structure prothétique complète ajustée", 1, true),
                                new CarePhoto("prothese-amovible", "prothese-amovible-2.png",
                                                "assets/images/soins/prothese-amovible-2.png",
                                                "Essayage clinique et réglage de l'occlusion",
                                                "Photo 2 / 3 — Contrôle de stabilité et confort masticatoire", 2,
                                                false),
                                new CarePhoto("prothese-amovible", "prothese-amovible-3.png",
                                                "assets/images/soins/prothese-amovible-3.png",
                                                "Restitution de l'harmonie du visage",
                                                "Photo 3 / 3 — Rendu esthétique naturel et stabilité", 3, false)));

                initPhotosForCare("detartrage", List.of(
                                new CarePhoto("detartrage", "detartrage-1.png", "assets/images/soins/detartrage-1.png",
                                                "Soin de détartrage professionnel aux ultrasons",
                                                "Photo 1 / 3 — Élimination du tartre et de la plaque", 1, true),
                                new CarePhoto("detartrage", "detartrage-2.png", "assets/images/soins/detartrage-2.png",
                                                "Polissage prophylactique des surfaces dentaires",
                                                "Photo 2 / 3 — Élimination des taches de surface", 2, false),
                                new CarePhoto("detartrage", "detartrage-3.png", "assets/images/soins/detartrage-3.png",
                                                "Contrôle de l'état gingival",
                                                "Photo 3 / 3 — Gencives saines et propreté optimale", 3, false)));

                initPhotosForCare("blanchiment-dentaire", List.of(
                                new CarePhoto("blanchiment-dentaire", "blanchiment-dentaire-1.png",
                                                "assets/images/soins/blanchiment-dentaire-1.png",
                                                "Sourire éclatant après éclaircissement dentaire",
                                                "Photo 1 / 3 — Traitement professionnel sous supervision", 1, true),
                                new CarePhoto("blanchiment-dentaire", "blanchiment-dentaire-2.png",
                                                "assets/images/soins/blanchiment-dentaire-2.png",
                                                "Protection des tissus gingivaux avant traitement",
                                                "Photo 2 / 3 — Application du gel d'éclaircissement sécurisé", 2,
                                                false),
                                new CarePhoto("blanchiment-dentaire", "blanchiment-dentaire-3.png",
                                                "assets/images/soins/blanchiment-dentaire-3.png",
                                                "Résultat d'éclat immédiat après séance",
                                                "Photo 3 / 3 — Gain de plusieurs nuances de teinte", 3, false)));
        }

        private void createCareIfNotExists(String codeSlug, String titre, String descCourte, String descDetaillee,
                        String photoUrl, String photoAlt, int ordre) {
                Optional<Soin> existingOpt = soinRepository.findByCodeSlug(codeSlug);
                if (existingOpt.isPresent()) {
                        Soin soin = existingOpt.get();
                        if (soin.getTitre() == null || soin.getTitre().isBlank())
                                soin.setTitre(titre);
                        if (soin.getDescriptionCourte() == null || soin.getDescriptionCourte().isBlank())
                                soin.setDescriptionCourte(descCourte);
                        if (soin.getDescriptionDetaillee() == null || soin.getDescriptionDetaillee().isBlank())
                                soin.setDescriptionDetaillee(descDetaillee);
                        if (soin.getPhotoCouvertureUrl() == null || soin.getPhotoCouvertureUrl().isBlank())
                                soin.setPhotoCouvertureUrl(photoUrl);
                        if (soin.getPhotoCouvertureAlt() == null || soin.getPhotoCouvertureAlt().isBlank())
                                soin.setPhotoCouvertureAlt(photoAlt);
                        soinRepository.save(soin);
                        logger.info("Soin '{}' mis à jour (upsert) en base de données.", codeSlug);
                } else {
                        Soin soin = new Soin(
                                        codeSlug,
                                        titre,
                                        descCourte,
                                        descDetaillee,
                                        photoUrl,
                                        photoAlt,
                                        ordre,
                                        StatutSoin.PUBLIE);
                        soinRepository.save(soin);
                        logger.info("Soin '{}' créé en base de données.", codeSlug);
                }
        }

        private void initPhotosForCare(String codeSlug, List<CarePhoto> defaultPhotos) {
                List<CarePhoto> existing = carePhotoRepository
                                .findByCareIdOrderByDisplayOrderAscCreatedAtDesc(codeSlug);
                boolean needsUpdate = existing.stream()
                                .anyMatch(p -> p.getImageUrl().contains("restauration-composite.png")
                                                && !codeSlug.equals("restauration-composite"));
                if (existing.isEmpty() || needsUpdate) {
                        if (needsUpdate) {
                                carePhotoRepository.deleteAll(existing);
                        }
                        carePhotoRepository.saveAll(defaultPhotos);
                        logger.info("3 photos distinctes et dédiées initialisées pour le soin '{}'.", codeSlug);
                }
        }
}

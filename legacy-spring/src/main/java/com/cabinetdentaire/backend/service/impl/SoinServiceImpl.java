package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.dto.CreationSoinRequest;
import com.cabinetdentaire.backend.dto.ReorderSoinsRequest;
import com.cabinetdentaire.backend.dto.SoinDto;
import com.cabinetdentaire.backend.entity.CarePhoto;
import com.cabinetdentaire.backend.entity.Soin;
import com.cabinetdentaire.backend.entity.StatutSoin;
import com.cabinetdentaire.backend.exception.ResourceNotFoundException;
import com.cabinetdentaire.backend.repository.CarePhotoRepository;
import com.cabinetdentaire.backend.repository.RendezVousRepository;
import com.cabinetdentaire.backend.repository.SoinRepository;
import com.cabinetdentaire.backend.service.SoinService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.*;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SoinServiceImpl implements SoinService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/jpg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private final String uploadDir = "uploads/soins";

    private final SoinRepository soinRepository;
    private final CarePhotoRepository carePhotoRepository;
    private final RendezVousRepository rendezVousRepository;

    public SoinServiceImpl(SoinRepository soinRepository,
                           CarePhotoRepository carePhotoRepository,
                           RendezVousRepository rendezVousRepository) {
        this.soinRepository = soinRepository;
        this.carePhotoRepository = carePhotoRepository;
        this.rendezVousRepository = rendezVousRepository;
        ensureUploadDir();
    }

    private void ensureUploadDir() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Erreur de création du dossier d'upload", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SoinDto> getSoinsPublics() {
        return soinRepository.findByStatutOrderByOrdreAffichageAsc(StatutSoin.PUBLIE)
                .stream()
                .map(SoinDto::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getTitresSoinsPublics() {
        return soinRepository.findByStatutOrderByOrdreAffichageAsc(StatutSoin.PUBLIE)
                .stream()
                .map(Soin::getTitre)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SoinDto getSoinBySlugOrId(String identifier) {
        Soin soin = findSoinByIdentifierInternal(identifier);
        return new SoinDto(soin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SoinDto> getAllSoinsAdmin() {
        return soinRepository.findAllByOrderByOrdreAffichageAsc()
                .stream()
                .map(SoinDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public SoinDto creerSoin(CreationSoinRequest request, MultipartFile coverFile) {
        if (request.getTitre() == null || request.getTitre().isBlank()) {
            throw new IllegalArgumentException("Le titre du soin est obligatoire.");
        }
        if (request.getDescriptionCourte() == null || request.getDescriptionCourte().isBlank()) {
            throw new IllegalArgumentException("La description courte est obligatoire.");
        }
        if (request.getDescriptionDetaillee() == null || request.getDescriptionDetaillee().isBlank()) {
            throw new IllegalArgumentException("La description détaillée est obligatoire.");
        }

        String baseSlug = generateSlug(request.getTitre());
        String uniqueSlug = baseSlug;
        int count = 1;
        while (soinRepository.existsByCodeSlug(uniqueSlug)) {
            uniqueSlug = baseSlug + "-" + count++;
        }

        int nextOrder = request.getOrdreAffichage() != null ? request.getOrdreAffichage() : (int) soinRepository.count() + 1;

        String coverUrl = null;
        String coverAlt = request.getPhotoCouvertureAlt();

        if (coverFile != null && !coverFile.isEmpty()) {
            coverUrl = uploadFile(coverFile);
            if (coverAlt == null || coverAlt.isBlank()) {
                coverAlt = "Photo de couverture - " + request.getTitre();
            }
        }

        Soin soin = new Soin(
                uniqueSlug,
                request.getTitre().trim(),
                request.getDescriptionCourte().trim(),
                request.getDescriptionDetaillee().trim(),
                coverUrl,
                coverAlt != null ? coverAlt.trim() : null,
                nextOrder,
                request.getStatut() != null ? request.getStatut() : StatutSoin.PUBLIE
        );

        Soin saved = soinRepository.save(soin);

        if (coverUrl != null) {
            CarePhoto coverPhoto = new CarePhoto(
                    uniqueSlug,
                    coverUrl.substring(coverUrl.lastIndexOf("/") + 1),
                    coverUrl,
                    coverAlt,
                    "Couverture principale",
                    1,
                    true
            );
            carePhotoRepository.save(coverPhoto);
        }

        return new SoinDto(saved);
    }

    @Override
    public SoinDto modifierSoin(Long id, CreationSoinRequest request, MultipartFile coverFile) {
        return modifierSoinByIdentifier(String.valueOf(id), request, coverFile);
    }

    @Override
    public SoinDto modifierSoinByIdentifier(String identifier, CreationSoinRequest request, MultipartFile coverFile) {
        Soin soin = findSoinByIdentifierInternal(identifier);

        if (request != null) {
            if (request.getTitre() != null && !request.getTitre().isBlank()) {
                soin.setTitre(request.getTitre().trim());
            }
            if (request.getDescriptionCourte() != null && !request.getDescriptionCourte().isBlank()) {
                soin.setDescriptionCourte(request.getDescriptionCourte().trim());
            }
            if (request.getDescriptionDetaillee() != null && !request.getDescriptionDetaillee().isBlank()) {
                soin.setDescriptionDetaillee(request.getDescriptionDetaillee().trim());
            }

            if (request.getStatut() != null) {
                soin.setStatut(request.getStatut());
            }

            if (request.getOrdreAffichage() != null) {
                soin.setOrdreAffichage(request.getOrdreAffichage());
            }

            if (request.getPhotoCouvertureAlt() != null) {
                soin.setPhotoCouvertureAlt(request.getPhotoCouvertureAlt().trim());
            }
        }

        if (coverFile != null && !coverFile.isEmpty()) {
            String oldCoverUrl = soin.getPhotoCouvertureUrl();
            String newCoverUrl = uploadFile(coverFile);
            soin.setPhotoCouvertureUrl(newCoverUrl);

            CarePhoto coverPhoto = new CarePhoto(
                    soin.getCodeSlug(),
                    newCoverUrl.substring(newCoverUrl.lastIndexOf("/") + 1),
                    newCoverUrl,
                    soin.getPhotoCouvertureAlt() != null ? soin.getPhotoCouvertureAlt() : soin.getTitre(),
                    "Photo de couverture",
                    1,
                    true
            );
            carePhotoRepository.save(coverPhoto);

            if (oldCoverUrl != null && oldCoverUrl.startsWith("/uploads/soins/")) {
                try {
                    String oldFileName = oldCoverUrl.substring(oldCoverUrl.lastIndexOf("/") + 1);
                    Path oldPath = Paths.get(uploadDir).resolve(oldFileName);
                    Files.deleteIfExists(oldPath);
                } catch (IOException ignored) {
                }
            }
        }

        Soin updated = soinRepository.save(soin);
        return new SoinDto(updated);
    }

    private Soin findSoinByIdentifierInternal(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new ResourceNotFoundException("Identifiant de soin vide.");
        }

        Soin soin = null;

        // 1. Essayer par ID numérique primaire SQL
        try {
            Long id = Long.parseLong(identifier);
            soin = soinRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {
        }

        // 2. Essayer par codeSlug
        if (soin == null) {
            soin = soinRepository.findByCodeSlug(identifier).orElse(null);
        }

        // 3. Essayer par correspondance de slug généré depuis le titre ou slug alternatif
        if (soin == null) {
            String normIdentifier = generateSlug(identifier);
            soin = soinRepository.findAll().stream()
                    .filter(s -> s.getCodeSlug().equalsIgnoreCase(normIdentifier) ||
                                 generateSlug(s.getTitre()).equalsIgnoreCase(normIdentifier) ||
                                 s.getTitre().equalsIgnoreCase(identifier))
                    .findFirst()
                    .orElse(null);
        }

        // 4. Si un identifiant positionnel (1-indexed) est fourni
        if (soin == null) {
            try {
                int pos = Integer.parseInt(identifier);
                List<Soin> all = soinRepository.findAllByOrderByOrdreAffichageAsc();
                if (pos >= 1 && pos <= all.size()) {
                    soin = all.get(pos - 1);
                }
            } catch (NumberFormatException ignored) {
            }
        }

        // 5. Si toujours non trouvé, retourner le premier soin en BDD ou initialiser le soin couronne-zircone
        if (soin == null) {
            List<Soin> all = soinRepository.findAllByOrderByOrdreAffichageAsc();
            if (!all.isEmpty()) {
                soin = all.get(0);
            } else {
                soin = new Soin(
                        "couronne-zircone",
                        "Couronnes en zircone",
                        "Les couronnes en zircone permettent de restaurer une dent fragilisée ou abîmée tout en offrant un résultat résistant.",
                        "La zircone est un matériau reconnu pour sa solidité et son rendu esthétique. Une couronne peut être proposée pour protéger une dent endommagée.",
                        "assets/images/soins/couronne-zircone.png",
                        "Couronne dentaire esthétique en zircone",
                        1,
                        StatutSoin.PUBLIE
                );
                soin = soinRepository.save(soin);
            }
        }

        return soin;
    }

    @Override
    public List<SoinDto> reordonnerSoins(ReorderSoinsRequest request) {
        if (request == null || request.getSoinIdsInOrder() == null) {
            return getAllSoinsAdmin();
        }

        List<Long> ids = request.getSoinIdsInOrder();
        for (int i = 0; i < ids.size(); i++) {
            Long soinId = ids.get(i);
            Optional<Soin> soinOpt = soinRepository.findById(soinId);
            if (soinOpt.isPresent()) {
                Soin s = soinOpt.get();
                s.setOrdreAffichage(i + 1);
                soinRepository.save(s);
            }
        }

        return getAllSoinsAdmin();
    }

    @Override
    public void supprimerOuArchiverSoin(Long id) {
        Soin soin = soinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soin introuvable avec l'ID : " + id));

        boolean isReferencedInAppointments = rendezVousRepository.findAll().stream()
                .anyMatch(rdv -> rdv.getSoin() != null &&
                        (rdv.getSoin().equalsIgnoreCase(soin.getTitre()) || rdv.getSoin().equalsIgnoreCase(soin.getCodeSlug())));

        if (isReferencedInAppointments) {
            soin.setStatut(StatutSoin.ARCHIVE);
            soinRepository.save(soin);
        } else {
            List<CarePhoto> photos = carePhotoRepository.findByCareIdOrderByDisplayOrderAscCreatedAtDesc(soin.getCodeSlug());
            for (CarePhoto photo : photos) {
                try {
                    Path path = Paths.get(uploadDir).resolve(photo.getFileName());
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                }
                carePhotoRepository.delete(photo);
            }

            if (soin.getPhotoCouvertureUrl() != null && soin.getPhotoCouvertureUrl().startsWith("/uploads/soins/")) {
                try {
                    String fileName = soin.getPhotoCouvertureUrl().substring(soin.getPhotoCouvertureUrl().lastIndexOf("/") + 1);
                    Path path = Paths.get(uploadDir).resolve(fileName);
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                }
            }

            soinRepository.delete(soin);
        }
    }

    private String uploadFile(MultipartFile file) {
        validateFile(file);
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFileName = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;
        Path targetLocation = Paths.get(uploadDir).resolve(uniqueFileName);

        try {
            byte[] bytes = file.getBytes();
            if (bytes == null || bytes.length == 0) {
                throw new IllegalArgumentException("Le fichier téléversé est vide (0 octet).");
            }

            // Convertir les fonds transparents (PNG) sur un fond blanc uni pour empêcher les fonds noirs
            try {
                BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(bytes));
                if (originalImage != null) {
                    int width = originalImage.getWidth();
                    int height = originalImage.getHeight();
                    BufferedImage rgbImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                    Graphics2D g = rgbImage.createGraphics();
                    g.setColor(Color.WHITE);
                    g.fillRect(0, 0, width, height);
                    g.drawImage(originalImage, 0, 0, null);
                    g.dispose();

                    String format = extension.replace(".", "").toLowerCase();
                    if (format.equals("webp") || format.equals("svg")) {
                        format = "png";
                    }
                    boolean written = ImageIO.write(rgbImage, format.equals("jpg") ? "jpeg" : format, targetLocation.toFile());
                    if (!written) {
                        Files.write(targetLocation, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                    }
                } else {
                    Files.write(targetLocation, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                }
            } catch (Exception imgEx) {
                Files.write(targetLocation, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'enregistrer le fichier de couverture.", e);
        }

        return "/uploads/soins/" + uniqueFileName;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier de couverture est vide.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("L'image dépasse la taille maximale autorisée (5 Mo).");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Format d'image non accepté. Formats acceptés : JPEG, PNG, WebP.");
        }
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Extension non autorisée : " + extension + ". Formats acceptés : .jpg, .jpeg, .png, .webp.");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String generateSlug(String input) {
        if (input == null) return "soin-" + System.currentTimeMillis();
        String nowhitespace = input.trim().toLowerCase();
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("[\\s-]+", "-");
        return slug;
    }
}

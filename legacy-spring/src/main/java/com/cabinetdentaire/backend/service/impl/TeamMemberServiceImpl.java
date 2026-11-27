package com.cabinetdentaire.backend.service.impl;

import com.cabinetdentaire.backend.dto.CreationMembreEquipeRequest;
import com.cabinetdentaire.backend.dto.MembreEquipeDto;
import com.cabinetdentaire.backend.dto.ReorderTeamRequest;
import com.cabinetdentaire.backend.entity.MembreEquipe;
import com.cabinetdentaire.backend.exception.ResourceNotFoundException;
import com.cabinetdentaire.backend.repository.TeamMemberRepository;
import com.cabinetdentaire.backend.service.TeamMemberService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamMemberServiceImpl implements TeamMemberService {

    private static final String UPLOAD_DIR = "uploads/team";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final TeamMemberRepository teamMemberRepository;

    public TeamMemberServiceImpl(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
        initUploadDir();
    }

    private void initUploadDir() {
        try {
            Path path = Paths.get(UPLOAD_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier de téléversement : " + UPLOAD_DIR, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembreEquipeDto> getPublicTeamMembers() {
        return teamMemberRepository.findByActifTrueOrderByOrdreAffichageAscIdAsc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembreEquipeDto> getAllTeamMembersAdmin() {
        return teamMemberRepository.findAllByOrderByOrdreAffichageAscIdAsc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MembreEquipeDto getTeamMemberById(Long id) {
        MembreEquipe member = teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre de l'équipe non trouvé avec l'id : " + id));
        return mapToDto(member);
    }

    @Override
    @Transactional
    public MembreEquipeDto createTeamMember(CreationMembreEquipeRequest request, MultipartFile photoFile) {
        MembreEquipe member = new MembreEquipe();
        updateMemberFields(member, request);

        if (photoFile != null && !photoFile.isEmpty()) {
            String photoUrl = savePhotoFile(photoFile);
            member.setPhotoUrl(photoUrl);
        }

        validatePhotoAltRequirement(member);

        MembreEquipe saved = teamMemberRepository.save(member);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public MembreEquipeDto updateTeamMember(Long id, CreationMembreEquipeRequest request, MultipartFile photoFile) {
        MembreEquipe member = teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre de l'équipe non trouvé avec l'id : " + id));

        updateMemberFields(member, request);

        if (photoFile != null && !photoFile.isEmpty()) {
            // Delete existing photo if it was saved locally
            deleteLocalPhotoFile(member.getPhotoUrl());
            String photoUrl = savePhotoFile(photoFile);
            member.setPhotoUrl(photoUrl);
        }

        validatePhotoAltRequirement(member);

        MembreEquipe updated = teamMemberRepository.save(member);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteTeamMember(Long id) {
        MembreEquipe member = teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre de l'équipe non trouvé avec l'id : " + id));

        deleteLocalPhotoFile(member.getPhotoUrl());
        teamMemberRepository.delete(member);
    }

    @Override
    @Transactional
    public MembreEquipeDto toggleMemberStatus(Long id) {
        MembreEquipe member = teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre de l'équipe non trouvé avec l'id : " + id));

        member.setActif(!Boolean.TRUE.equals(member.getActif()));
        MembreEquipe updated = teamMemberRepository.save(member);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public List<MembreEquipeDto> reorderTeamMembers(ReorderTeamRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return getAllTeamMembersAdmin();
        }

        Map<Long, Integer> orderMap = new HashMap<>();
        for (ReorderTeamRequest.TeamOrderItem item : request.getItems()) {
            if (item.getId() != null && item.getDisplayOrder() != null) {
                orderMap.put(item.getId(), item.getDisplayOrder());
            }
        }

        List<MembreEquipe> allMembers = teamMemberRepository.findAll();
        for (MembreEquipe member : allMembers) {
            if (orderMap.containsKey(member.getId())) {
                member.setOrdreAffichage(orderMap.get(member.getId()));
            }
        }

        teamMemberRepository.saveAll(allMembers);
        return getAllTeamMembersAdmin();
    }

    private void updateMemberFields(MembreEquipe member, CreationMembreEquipeRequest request) {
        member.setNomComplet(request.getNomComplet());
        member.setTitre(request.getTitre());
        member.setSpecialite(request.getSpecialite());
        member.setDescription(request.getDescription());
        member.setPhotoAlt(request.getPhotoAlt());
        member.setOrdreAffichage(request.getOrdreAffichage() != null ? request.getOrdreAffichage() : 0);
        member.setActif(request.getActif() != null ? request.getActif() : true);
        member.setInstagramUrl(request.getInstagramUrl());
        member.setLinkedinUrl(request.getLinkedinUrl());
    }

    private void validatePhotoAltRequirement(MembreEquipe member) {
        if (StringUtils.hasText(member.getPhotoUrl()) && !StringUtils.hasText(member.getPhotoAlt())) {
            member.setPhotoAlt(member.getNomComplet() + ", " + member.getTitre());
        }
    }

    private String savePhotoFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("La taille de l'image ne doit pas dépasser 5 Mo");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Format d'image non supporté. Formats autorisés : JPEG, PNG, WebP");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        } else {
            if ("image/png".equalsIgnoreCase(contentType)) extension = ".png";
            else if ("image/webp".equalsIgnoreCase(contentType)) extension = ".webp";
            else extension = ".jpg";
        }

        String filename = "team-" + UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(UPLOAD_DIR).resolve(filename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/" + UPLOAD_DIR + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de l'image de l'équipe", e);
        }
    }

    private void deleteLocalPhotoFile(String photoUrl) {
        if (photoUrl != null && photoUrl.startsWith("/uploads/team/")) {
            try {
                String filename = photoUrl.substring("/uploads/team/".length());
                Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
                Files.deleteIfExists(filePath);
            } catch (Exception ignored) {
            }
        }
    }

    private MembreEquipeDto mapToDto(MembreEquipe member) {
        MembreEquipeDto dto = new MembreEquipeDto();
        dto.setId(member.getId());
        dto.setNomComplet(member.getNomComplet());
        dto.setTitre(member.getTitre());
        dto.setSpecialite(member.getSpecialite());
        dto.setDescription(member.getDescription());
        dto.setPhotoUrl(member.getPhotoUrl());
        dto.setPhotoAlt(member.getPhotoAlt());
        dto.setOrdreAffichage(member.getOrdreAffichage());
        dto.setActif(member.getActif());
        dto.setInstagramUrl(member.getInstagramUrl());
        dto.setLinkedinUrl(member.getLinkedinUrl());
        dto.setDateCreation(member.getDateCreation());
        dto.setDateModification(member.getDateModification());
        return dto;
    }
}

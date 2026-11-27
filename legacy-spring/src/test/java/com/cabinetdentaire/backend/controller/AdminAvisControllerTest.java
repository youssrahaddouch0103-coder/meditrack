package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.AvisResponse;
import com.cabinetdentaire.backend.dto.CreationAvisRequest;
import com.cabinetdentaire.backend.entity.StatutAvis;
import com.cabinetdentaire.backend.security.JwtTokenProvider;
import com.cabinetdentaire.backend.service.AvisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class AdminAvisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AvisService avisService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Value("${ADMIN_EMAIL:admin.test@cabinet.local}")
    private String adminEmail;

    private String adminToken;

    @BeforeEach
    void setUp() {
        adminToken = "Bearer " + jwtTokenProvider.generateTokenFromEmail(adminEmail);
    }

    @Test
    @DisplayName("Approbation d'un avis en attente")
    void approuverAvis_Succes() throws Exception {
        CreationAvisRequest req = new CreationAvisRequest();
        req.setNomAuteur("Camille L.");
        req.setNote(5);
        req.setSoinConcerne("Détartrage");
        req.setCommentaire("Très satisfait de ma consultation.");
        AvisResponse created = avisService.creerAvis(req);

        mockMvc.perform(patch("/api/admin/avis/" + created.getId() + "/approuver")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avis.statut", is("APPROUVE")))
                .andExpect(jsonPath("$.avis.dateDecision", notNullValue()));
    }

    @Test
    @DisplayName("Refus d'un avis")
    void refuserAvis_Succes() throws Exception {
        CreationAvisRequest req = new CreationAvisRequest();
        req.setNomAuteur("Spammer");
        req.setNote(1);
        req.setSoinConcerne("Autre");
        req.setCommentaire("Avis inapproprié.");
        AvisResponse created = avisService.creerAvis(req);

        mockMvc.perform(patch("/api/admin/avis/" + created.getId() + "/refuser")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avis.statut", is("REFUSE")))
                .andExpect(jsonPath("$.avis.dateDecision", notNullValue()));
    }

    @Test
    @DisplayName("Suppression d'un avis")
    void supprimerAvis_Succes() throws Exception {
        CreationAvisRequest req = new CreationAvisRequest();
        req.setNomAuteur("Test Deletion");
        req.setNote(4);
        req.setSoinConcerne("Implant");
        req.setCommentaire("Message temporaire.");
        AvisResponse created = avisService.creerAvis(req);

        mockMvc.perform(delete("/api/admin/avis/" + created.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("supprimé")));

        mockMvc.perform(get("/api/admin/avis/" + created.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Comptage des avis en attente")
    void compterAvisEnAttente_Succes() throws Exception {
        CreationAvisRequest req = new CreationAvisRequest();
        req.setNomAuteur("Nouveau");
        req.setNote(5);
        req.setSoinConcerne("Soin");
        req.setCommentaire("Commentaire en attente.");
        avisService.creerAvis(req);

        mockMvc.perform(get("/api/admin/avis/en-attente-count")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", greaterThanOrEqualTo(1)));
    }
}

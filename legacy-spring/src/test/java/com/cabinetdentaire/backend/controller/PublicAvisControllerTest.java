package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationAvisRequest;
import com.cabinetdentaire.backend.entity.Avis;
import com.cabinetdentaire.backend.entity.StatutAvis;
import com.cabinetdentaire.backend.repository.AvisRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class PublicAvisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AvisRepository avisRepository;

    @Test
    @DisplayName("Creation valide d'un avis public avec forcage statut EN_ATTENTE")
    void proposerAvis_Succes() throws Exception {
        CreationAvisRequest dto = new CreationAvisRequest();
        dto.setNomAuteur("Marie D.");
        dto.setNote(5);
        dto.setSoinConcerne("Blanchiment dentaire");
        dto.setCommentaire("Une excellente prise en charge et un resultat magnifique.");

        mockMvc.perform(post("/api/avis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", containsString("Il sera publié après validation")))
                .andExpect(jsonPath("$.avis.statut", is("EN_ATTENTE")))
                .andExpect(jsonPath("$.avis.nomAuteur", is("Marie D.")));
    }

    @Test
    @DisplayName("Rejet des notes invalides (< 1 ou > 5)")
    void proposerAvis_NoteInvalide_BadRequest() throws Exception {
        CreationAvisRequest dto = new CreationAvisRequest();
        dto.setNomAuteur("Jean P.");
        dto.setNote(6); // Invalide > 5
        dto.setSoinConcerne("Détartrage");
        dto.setCommentaire("Avis tres positif sur le soin.");

        mockMvc.perform(post("/api/avis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Rejet d'un commentaire superieur a 500 caracteres")
    void proposerAvis_CommentaireTropLong_BadRequest() throws Exception {
        CreationAvisRequest dto = new CreationAvisRequest();
        dto.setNomAuteur("Lucie T.");
        dto.setNote(4);
        dto.setSoinConcerne("Orthodontie");
        dto.setCommentaire("A".repeat(501));

        mockMvc.perform(post("/api/avis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("L'endpoint public GET /api/avis/publics retourne uniquement les avis APPROUVES")
    void obtenirAvisPublics_RetourneUniquementApprouves() throws Exception {
        Avis enAttente = new Avis();
        enAttente.setNomAuteur("En Attente");
        enAttente.setNote(4);
        enAttente.setSoinConcerne("Caries");
        enAttente.setCommentaire("Avis en attente de moderation.");
        enAttente.setStatut(StatutAvis.EN_ATTENTE);
        avisRepository.save(enAttente);

        Avis approuve = new Avis();
        approuve.setNomAuteur("Patient Approuve");
        approuve.setNote(5);
        approuve.setSoinConcerne("Orthodontie");
        approuve.setCommentaire("Super traitement !");
        approuve.setStatut(StatutAvis.APPROUVE);
        avisRepository.save(approuve);

        mockMvc.perform(get("/api/avis/publics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nomAuteur", is("Patient Approuve")))
                .andExpect(jsonPath("$[0].statut", is("APPROUVE")));
    }

    @Test
    @DisplayName("Refus 401 sur l'endpoint admin sans token")
    void consulterAdminAvis_SansToken_Refus401() throws Exception {
        mockMvc.perform(get("/api/admin/avis"))
                .andExpect(status().isUnauthorized());
    }
}

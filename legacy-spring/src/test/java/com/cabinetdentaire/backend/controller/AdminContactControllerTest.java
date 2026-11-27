package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationMessageContactRequest;
import com.cabinetdentaire.backend.dto.MessageContactResponse;
import com.cabinetdentaire.backend.security.JwtTokenProvider;
import com.cabinetdentaire.backend.service.MessageContactService;
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
class AdminContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MessageContactService messageContactService;

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
    @DisplayName("Refus d'acces a la liste des messages sans JWT (HTTP 401)")
    void obtenirMessages_SansToken_Refus401() throws Exception {
        mockMvc.perform(get("/api/admin/contact/messages"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Consultation des messages de contact et tri du plus recent au plus ancien")
    void obtenirMessages_AvecTokenValide_Succes() throws Exception {
        CreationMessageContactRequest msg1 = new CreationMessageContactRequest();
        msg1.setNomComplet("Premier Message");
        msg1.setEmail("m1@example.com");
        msg1.setSujet("Sujet 1");
        msg1.setMessage("Contenu du message 1");
        messageContactService.enregistrerMessage(msg1);

        CreationMessageContactRequest msg2 = new CreationMessageContactRequest();
        msg2.setNomComplet("Second Message Plus Recent");
        msg2.setEmail("m2@example.com");
        msg2.setSujet("Sujet 2");
        msg2.setMessage("Contenu du message 2");
        messageContactService.enregistrerMessage(msg2);

        mockMvc.perform(get("/api/admin/contact/messages")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[0].nomComplet", is("Second Message Plus Recent")));
    }

    @Test
    @DisplayName("Marquer un message comme lu puis remis en non lu")
    void marquerLuEtNonLu() throws Exception {
        CreationMessageContactRequest req = new CreationMessageContactRequest();
        req.setNomComplet("Sophie Martin");
        req.setEmail("sophie@example.com");
        req.setSujet("Renseignements");
        req.setMessage("Bonjour, acceptez-vous la carte vitale ?");
        MessageContactResponse created = messageContactService.enregistrerMessage(req);

        // Initialement lu = false
        mockMvc.perform(get("/api/admin/contact/messages/" + created.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lu", is(false)));

        // Marquer lu
        mockMvc.perform(patch("/api/admin/contact/messages/" + created.getId() + "/lu")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lu", is(true)));

        // Remettre non lu
        mockMvc.perform(patch("/api/admin/contact/messages/" + created.getId() + "/non-lu")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lu", is(false)));
    }

    @Test
    @DisplayName("Suppression d'un message")
    void supprimerMessage() throws Exception {
        CreationMessageContactRequest req = new CreationMessageContactRequest();
        req.setNomComplet("Message A Supprimer");
        req.setEmail("del@example.com");
        req.setSujet("Urgence");
        req.setMessage("Message temporaire a supprimer");
        MessageContactResponse created = messageContactService.enregistrerMessage(req);

        mockMvc.perform(delete("/api/admin/contact/messages/" + created.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isNoContent());

        // Verifier que l'obtention par ID retourne 404
        mockMvc.perform(get("/api/admin/contact/messages/" + created.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Comptage des messages non lus")
    void compterMessagesNonLus() throws Exception {
        mockMvc.perform(get("/api/admin/contact/messages/non-lus-count")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", notNullValue()));
    }
}

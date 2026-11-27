package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationMessageContactRequest;
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
class PublicContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Enregistrement valide d'un message public de contact")
    void envoyerMessage_Succes() throws Exception {
        CreationMessageContactRequest dto = new CreationMessageContactRequest();
        dto.setNomComplet("Marc Vasseur");
        dto.setEmail("marc.vasseur@example.com");
        dto.setTelephone("0611223344");
        dto.setSujet("Demande d’information");
        dto.setMessage("Bonjour, je souhaite connaître vos tarifs pour un détartrage.");

        mockMvc.perform(post("/api/contact/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nomComplet", is("Marc Vasseur")))
                .andExpect(jsonPath("$.email", is("marc.vasseur@example.com")))
                .andExpect(jsonPath("$.lu", is(false)));
    }

    @Test
    @DisplayName("Rejet d'un email invalide et de champs obligatoires vides")
    void envoyerMessage_RejetChampsInvalides() throws Exception {
        CreationMessageContactRequest dto = new CreationMessageContactRequest();
        dto.setNomComplet(""); // Nom vide
        dto.setEmail("email-invalide");
        dto.setSujet(""); // Sujet vide
        dto.setMessage("Hi"); // Message trop court

        mockMvc.perform(post("/api/contact/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors", notNullValue()));
    }

    @Test
    @DisplayName("Impossibilite pour un visiteur anonyme d'acceder en GET a la liste des messages")
    void consulterMessages_Public_Refus401() throws Exception {
        mockMvc.perform(get("/api/admin/contact/messages"))
                .andExpect(status().isUnauthorized());
    }
}

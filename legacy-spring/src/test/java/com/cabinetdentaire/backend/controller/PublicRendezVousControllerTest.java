package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationRendezVousRequest;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
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

import java.time.LocalDate;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class PublicRendezVousControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Creation publique d'un rendez-vous avec statut EN_ATTENTE")
    void creerRendezVousPublic_Succes() throws Exception {
        CreationRendezVousRequest dto = new CreationRendezVousRequest();
        dto.setNomComplet("Jean Dupont");
        dto.setTelephone("0612345678");
        dto.setEmail("jean.dupont@example.com");
        dto.setSoin("Consultation et diagnostic");
        dto.setDateSouhaitee(LocalDate.now().plusDays(5));
        dto.setHeureSouhaitee(LocalTime.of(10, 30));
        dto.setMessage("Première consultation dentaire");

        mockMvc.perform(post("/api/public/rendez-vous")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nomComplet", is("Jean Dupont")))
                .andExpect(jsonPath("$.statut", is("EN_ATTENTE")))
                .andExpect(jsonPath("$.email", is("jean.dupont@example.com")));
    }

    @Test
    @DisplayName("Rejet d'une requete invalide avec nom incomplet et email invalide")
    void creerRendezVousPublic_RejetInvalide() throws Exception {
        CreationRendezVousRequest dto = new CreationRendezVousRequest();
        dto.setNomComplet("A"); // Trop court (min 2)
        dto.setTelephone(""); // Vide
        dto.setEmail("email-invalide"); // Format incorrect
        dto.setSoin("");
        dto.setDateSouhaitee(LocalDate.now().minusDays(1)); // Date dans le passe
        dto.setHeureSouhaitee(LocalTime.of(10, 0));

        mockMvc.perform(post("/api/public/rendez-vous")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors", notNullValue()));
    }
}

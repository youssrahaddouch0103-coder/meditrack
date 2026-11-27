package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationRendezVousRequest;
import com.cabinetdentaire.backend.dto.RefusRendezVousRequest;
import com.cabinetdentaire.backend.dto.RendezVousResponse;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
import com.cabinetdentaire.backend.security.JwtTokenProvider;
import com.cabinetdentaire.backend.service.RendezVousService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class AdminRendezVousControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RendezVousService rendezVousService;

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
    @DisplayName("Refus d'acces sans token JWT (HTTP 401)")
    void obtenirRendezVous_SansToken_Refus401() throws Exception {
        mockMvc.perform(get("/api/admin/rendez-vous"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("Obtenir la liste des rendez-vous avec token valide")
    void obtenirRendezVous_AvecTokenValide_Succes() throws Exception {
        CreationRendezVousRequest req = new CreationRendezVousRequest();
        req.setNomComplet("Alice Martin");
        req.setTelephone("0611223344");
        req.setEmail("alice@example.com");
        req.setSoin("Orthodontie");
        req.setDateSouhaitee(LocalDate.now().plusDays(3));
        req.setHeureSouhaitee(LocalTime.of(14, 0));
        rendezVousService.creerDemande(req);

        mockMvc.perform(get("/api/admin/rendez-vous")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].nomComplet", notNullValue()));
    }

    @Test
    @DisplayName("Filtrer les rendez-vous par statut EN_ATTENTE")
    void obtenirRendezVous_FiltrerParStatut() throws Exception {
        CreationRendezVousRequest req = new CreationRendezVousRequest();
        req.setNomComplet("Bernard Dupont");
        req.setTelephone("0622334455");
        req.setEmail("bernard@example.com");
        req.setSoin("Détartrage");
        req.setDateSouhaitee(LocalDate.now().plusDays(4));
        req.setHeureSouhaitee(LocalTime.of(15, 0));
        rendezVousService.creerDemande(req);

        mockMvc.perform(get("/api/admin/rendez-vous?statut=EN_ATTENTE")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].statut", everyItem(is("EN_ATTENTE"))));
    }

    @Test
    @DisplayName("Confirmer et refuser un rendez-vous")
    void confirmerEtRefuserRendezVous() throws Exception {
        CreationRendezVousRequest req = new CreationRendezVousRequest();
        req.setNomComplet("Claire Leroy");
        req.setTelephone("0633445566");
        req.setEmail("claire@example.com");
        req.setSoin("Blanchiment dentaire");
        req.setDateSouhaitee(LocalDate.now().plusDays(10));
        req.setHeureSouhaitee(LocalTime.of(11, 0));
        RendezVousResponse created = rendezVousService.creerDemande(req);

        // Confirmer
        mockMvc.perform(patch("/api/admin/rendez-vous/" + created.getId() + "/confirmer")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut", is("CONFIRME")));

        // Refuser
        RefusRendezVousRequest refusReq = new RefusRendezVousRequest("Cabinet complet");
        mockMvc.perform(patch("/api/admin/rendez-vous/" + created.getId() + "/refuser")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut", is("REFUSE")))
                .andExpect(jsonPath("$.motifRefus", is("Cabinet complet")));
    }

    @Test
    @DisplayName("Rejet d'un creneau deja confirme (HTTP 409 Conflict)")
    void confirmerRendezVous_ConflitCreneau_Rejet409() throws Exception {
        LocalDate dateTest = LocalDate.now().plusDays(8);
        LocalTime heureTest = LocalTime.of(16, 30);

        // RDV 1
        CreationRendezVousRequest req1 = new CreationRendezVousRequest();
        req1.setNomComplet("RDV 1 Confirme");
        req1.setTelephone("0600000001");
        req1.setEmail("rdv1@example.com");
        req1.setSoin("Consultation");
        req1.setDateSouhaitee(dateTest);
        req1.setHeureSouhaitee(heureTest);
        RendezVousResponse rdv1 = rendezVousService.creerDemande(req1);
        rendezVousService.confirmerRendezVous(rdv1.getId());

        // RDV 2 sur le meme creneau
        CreationRendezVousRequest req2 = new CreationRendezVousRequest();
        req2.setNomComplet("RDV 2 En Conflit");
        req2.setTelephone("0600000002");
        req2.setEmail("rdv2@example.com");
        req2.setSoin("Détartrage");
        req2.setDateSouhaitee(dateTest);
        req2.setHeureSouhaitee(heureTest);
        RendezVousResponse rdv2 = rendezVousService.creerDemande(req2);

        // Tenter de confirmer RDV 2 -> 409 Conflict
        mockMvc.perform(patch("/api/admin/rendez-vous/" + rdv2.getId() + "/confirmer")
                        .header("Authorization", adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("déjà occupé")));
    }
}

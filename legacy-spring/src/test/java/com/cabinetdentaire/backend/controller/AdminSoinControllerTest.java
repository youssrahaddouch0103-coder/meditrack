package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.SoinDto;
import com.cabinetdentaire.backend.entity.StatutSoin;
import com.cabinetdentaire.backend.service.SoinService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminSoinControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SoinService soinService;

    @Test
    public void testGetAllSoinsAdmin_Unauthorized_WhenAnonymous() throws Exception {
        mockMvc.perform(get("/api/admin/soins"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetAllSoinsAdmin_Success_WhenAdmin() throws Exception {
        SoinDto s1 = new SoinDto();
        s1.setId(1L);
        s1.setCodeSlug("couronne-zircone");
        s1.setTitre("Couronnes en zircone");
        s1.setStatut(StatutSoin.PUBLIE);

        when(soinService.getAllSoinsAdmin()).thenReturn(List.of(s1));

        mockMvc.perform(get("/api/admin/soins")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].codeSlug").value("couronne-zircone"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testSupprimerOuArchiverSoin_Success_WhenAdmin() throws Exception {
        mockMvc.perform(delete("/api/admin/soins/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Opération réalisée avec succès"));
    }
}

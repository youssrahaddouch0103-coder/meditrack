package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CarePhotoDto;
import com.cabinetdentaire.backend.service.CarePhotoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminCarePhotoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CarePhotoService carePhotoService;

    @Test
    public void testUploadPhotos_Unauthorized_WhenAnonymous() throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", "test.png", "image/png", "fake image".getBytes());

        mockMvc.perform(multipart("/api/admin/soins/detartrage/photos").file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUploadPhotos_Success_WhenAdmin() throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", "test.png", "image/png", "fake image content".getBytes());

        CarePhotoDto dto = new CarePhotoDto();
        dto.setId(10L);
        dto.setCareId("detartrage");
        dto.setAltText("Détartrage ultrasons avant et après");
        dto.setImageUrl("/uploads/soins/test.png");

        when(carePhotoService.uploadMultiplePhotos(eq("detartrage"), any(), any(), any()))
                .thenReturn(List.of(dto));

        mockMvc.perform(multipart("/api/admin/soins/detartrage/photos")
                        .file(file)
                        .param("altText", "Détartrage ultrasons avant et après"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].careId").value("detartrage"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeletePhoto_Success_WhenAdmin() throws Exception {
        mockMvc.perform(delete("/api/admin/photos/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Photo supprimée avec succès"));
    }
}

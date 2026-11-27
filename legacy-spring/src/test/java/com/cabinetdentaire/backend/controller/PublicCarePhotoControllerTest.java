package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CarePhotoDto;
import com.cabinetdentaire.backend.service.CarePhotoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PublicCarePhotoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CarePhotoService carePhotoService;

    @Test
    public void testGetCarePhotos_Success() throws Exception {
        CarePhotoDto photo1 = new CarePhotoDto();
        photo1.setId(1L);
        photo1.setCareId("couronne-zircone");
        photo1.setAltText("Couronne en zircone posée sur dent de devant");
        photo1.setImageUrl("/uploads/soins/couronne.png");
        photo1.setIsCover(true);

        when(carePhotoService.getPhotosByCareId(eq("couronne-zircone"))).thenReturn(List.of(photo1));

        mockMvc.perform(get("/api/public/soins/couronne-zircone/photos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].careId").value("couronne-zircone"))
                .andExpect(jsonPath("$[0].isCover").value(true));
    }
}

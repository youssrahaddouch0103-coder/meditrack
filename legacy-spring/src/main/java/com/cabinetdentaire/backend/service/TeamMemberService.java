package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.CreationMembreEquipeRequest;
import com.cabinetdentaire.backend.dto.MembreEquipeDto;
import com.cabinetdentaire.backend.dto.ReorderTeamRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TeamMemberService {

    List<MembreEquipeDto> getPublicTeamMembers();

    List<MembreEquipeDto> getAllTeamMembersAdmin();

    MembreEquipeDto getTeamMemberById(Long id);

    MembreEquipeDto createTeamMember(CreationMembreEquipeRequest request, MultipartFile photoFile);

    MembreEquipeDto updateTeamMember(Long id, CreationMembreEquipeRequest request, MultipartFile photoFile);

    void deleteTeamMember(Long id);

    MembreEquipeDto toggleMemberStatus(Long id);

    List<MembreEquipeDto> reorderTeamMembers(ReorderTeamRequest request);
}

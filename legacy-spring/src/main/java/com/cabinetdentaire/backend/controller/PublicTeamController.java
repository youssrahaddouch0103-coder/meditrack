package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.MembreEquipeDto;
import com.cabinetdentaire.backend.service.TeamMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/team")
public class PublicTeamController {

    private final TeamMemberService teamMemberService;

    public PublicTeamController(TeamMemberService teamMemberService) {
        this.teamMemberService = teamMemberService;
    }

    @GetMapping
    public ResponseEntity<List<MembreEquipeDto>> getPublicTeamMembers() {
        List<MembreEquipeDto> members = teamMemberService.getPublicTeamMembers();
        return ResponseEntity.ok(members);
    }
}

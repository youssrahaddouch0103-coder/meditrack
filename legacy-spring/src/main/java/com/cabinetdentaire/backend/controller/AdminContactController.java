package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.MessageContactResponse;
import com.cabinetdentaire.backend.service.MessageContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/contact/messages")
public class AdminContactController {

    private final MessageContactService messageContactService;

    public AdminContactController(MessageContactService messageContactService) {
        this.messageContactService = messageContactService;
    }

    @GetMapping
    public ResponseEntity<List<MessageContactResponse>> obtenirTousMessages() {
        List<MessageContactResponse> messages = messageContactService.obtenirTousMessages();
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/non-lus-count")
    public ResponseEntity<Map<String, Long>> compterMessagesNonLus() {
        long count = messageContactService.compterMessagesNonLus();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageContactResponse> obtenirMessageParId(@PathVariable Long id) {
        MessageContactResponse response = messageContactService.obtenirMessageParId(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/lu")
    public ResponseEntity<MessageContactResponse> marquerCommeLu(@PathVariable Long id) {
        MessageContactResponse response = messageContactService.marquerCommeLu(id, true);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/non-lu")
    public ResponseEntity<MessageContactResponse> marquerCommeNonLu(@PathVariable Long id) {
        MessageContactResponse response = messageContactService.marquerCommeLu(id, false);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerMessage(@PathVariable Long id) {
        messageContactService.supprimerMessage(id);
        return ResponseEntity.noContent().build();
    }
}

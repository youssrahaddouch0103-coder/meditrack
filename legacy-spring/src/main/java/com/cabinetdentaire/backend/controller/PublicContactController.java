package com.cabinetdentaire.backend.controller;

import com.cabinetdentaire.backend.dto.CreationMessageContactRequest;
import com.cabinetdentaire.backend.dto.MessageContactResponse;
import com.cabinetdentaire.backend.service.MessageContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class PublicContactController {

    private final MessageContactService messageContactService;

    public PublicContactController(MessageContactService messageContactService) {
        this.messageContactService = messageContactService;
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageContactResponse> envoyerMessage(
            @Valid @RequestBody CreationMessageContactRequest request) {
        MessageContactResponse response = messageContactService.enregistrerMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

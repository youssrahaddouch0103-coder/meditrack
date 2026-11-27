package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.CreationMessageContactRequest;
import com.cabinetdentaire.backend.dto.MessageContactResponse;
import com.cabinetdentaire.backend.entity.MessageContact;
import com.cabinetdentaire.backend.exception.ResourceNotFoundException;
import com.cabinetdentaire.backend.repository.MessageContactRepository;
import com.cabinetdentaire.backend.service.impl.AppointmentEmailServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageContactService {

    private final MessageContactRepository messageContactRepository;
    private final AppointmentEmailServiceImpl appointmentEmailService;

    public MessageContactService(MessageContactRepository messageContactRepository,
                                 AppointmentEmailServiceImpl appointmentEmailService) {
        this.messageContactRepository = messageContactRepository;
        this.appointmentEmailService = appointmentEmailService;
    }

    public MessageContactResponse enregistrerMessage(CreationMessageContactRequest request) {
        MessageContact msg = new MessageContact();
        msg.setNomComplet(request.getNomComplet().trim());
        msg.setEmail(request.getEmail().trim());
        msg.setTelephone(request.getTelephone() != null ? request.getTelephone().trim() : null);
        msg.setSujet(request.getSujet().trim());
        msg.setMessage(request.getMessage().trim());
        msg.setLu(false);

        MessageContact saved = messageContactRepository.save(msg);

        // 1. Notification interne transmise au Cabinet (FROM: contact@meditrack.local -> TO: contact@meditrack.local, REPLY-TO: patient@gmail.com)
        appointmentEmailService.sendContactMessageNotificationToCabinet(saved);

        // 2. Accusé de réception automatique transmis au Patient (FROM: contact@meditrack.local -> TO: patient@gmail.com)
        appointmentEmailService.sendContactAcknowledgementToPatient(saved);

        return MessageContactResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageContactResponse> obtenirTousMessages() {
        return messageContactRepository.findAllByOrderByDateEnvoiDesc()
                .stream()
                .map(MessageContactResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MessageContactResponse obtenirMessageParId(Long id) {
        MessageContact msg = messageContactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message introuvable avec l'ID : " + id));
        return MessageContactResponse.fromEntity(msg);
    }

    public MessageContactResponse marquerCommeLu(Long id, boolean lu) {
        MessageContact msg = messageContactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message introuvable avec l'ID : " + id));
        msg.setLu(lu);
        MessageContact updated = messageContactRepository.save(msg);
        return MessageContactResponse.fromEntity(updated);
    }

    public void supprimerMessage(Long id) {
        MessageContact msg = messageContactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message introuvable avec l'ID : " + id));
        messageContactRepository.delete(msg);
    }

    @Transactional(readOnly = true)
    public long compterMessagesNonLus() {
        return messageContactRepository.countByLuFalse();
    }
}

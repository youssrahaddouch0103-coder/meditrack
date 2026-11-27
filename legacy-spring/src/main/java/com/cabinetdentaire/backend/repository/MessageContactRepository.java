package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.MessageContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageContactRepository extends JpaRepository<MessageContact, Long> {

    List<MessageContact> findAllByOrderByDateEnvoiDesc();

    long countByLuFalse();
}

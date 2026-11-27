package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.Soin;
import com.cabinetdentaire.backend.entity.StatutSoin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoinRepository extends JpaRepository<Soin, Long> {

    List<Soin> findByStatutOrderByOrdreAffichageAsc(StatutSoin statut);

    List<Soin> findAllByOrderByOrdreAffichageAsc();

    Optional<Soin> findByCodeSlug(String codeSlug);

    boolean existsByCodeSlug(String codeSlug);

    Optional<Soin> findByIdOrCodeSlug(Long id, String codeSlug);
}

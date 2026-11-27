package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.RendezVous;
import com.cabinetdentaire.backend.entity.StatutRendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    List<RendezVous> findAllByOrderByDateCreationDesc();

    List<RendezVous> findByStatutOrderByDateCreationDesc(StatutRendezVous statut);

    boolean existsByDateSouhaiteeAndHeureSouhaiteeAndStatut(LocalDate dateSouhaitee, LocalTime heureSouhaitee, StatutRendezVous statut);
}

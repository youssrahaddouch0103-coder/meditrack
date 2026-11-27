package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.MembreEquipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<MembreEquipe, Long> {

    List<MembreEquipe> findByActifTrueOrderByOrdreAffichageAscIdAsc();

    List<MembreEquipe> findAllByOrderByOrdreAffichageAscIdAsc();

    boolean existsByNomCompletIgnoreCase(String nomComplet);
}

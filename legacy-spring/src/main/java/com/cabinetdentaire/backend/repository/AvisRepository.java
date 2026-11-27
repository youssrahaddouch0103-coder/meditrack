package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.Avis;
import com.cabinetdentaire.backend.entity.StatutAvis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {

    List<Avis> findAllByStatutOrderByDateCreationDesc(StatutAvis statut);

    List<Avis> findAllByOrderByDateCreationDesc();

    List<Avis> findByStatutOrderByDateCreationDesc(StatutAvis statut);

    long countByStatut(StatutAvis statut);
}

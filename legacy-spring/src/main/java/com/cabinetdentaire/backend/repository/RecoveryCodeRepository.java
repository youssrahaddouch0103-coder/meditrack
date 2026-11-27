package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.RecoveryCode;
import com.cabinetdentaire.backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecoveryCodeRepository extends JpaRepository<RecoveryCode, Long> {

    List<RecoveryCode> findByUtilisateurAndUsedFalse(Utilisateur utilisateur);

    List<RecoveryCode> findByUtilisateur(Utilisateur utilisateur);

    void deleteByUtilisateur(Utilisateur utilisateur);
}

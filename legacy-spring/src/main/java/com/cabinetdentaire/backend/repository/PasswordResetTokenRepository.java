package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.PasswordResetToken;
import com.cabinetdentaire.backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteByUtilisateur(Utilisateur utilisateur);
}

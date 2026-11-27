package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.CabinetSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CabinetSettingsRepository extends JpaRepository<CabinetSettings, Long> {

    Optional<CabinetSettings> findFirstByOrderByIdAsc();

}

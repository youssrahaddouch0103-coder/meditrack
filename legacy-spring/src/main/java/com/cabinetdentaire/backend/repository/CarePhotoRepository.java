package com.cabinetdentaire.backend.repository;

import com.cabinetdentaire.backend.entity.CarePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarePhotoRepository extends JpaRepository<CarePhoto, Long> {

    List<CarePhoto> findByCareIdOrderByDisplayOrderAscCreatedAtDesc(String careId);

    Optional<CarePhoto> findByCareIdAndIsCoverTrue(String careId);

    long countByCareId(String careId);
}

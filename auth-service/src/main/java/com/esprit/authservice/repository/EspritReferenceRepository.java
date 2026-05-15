package com.esprit.authservice.repository;

import com.esprit.authservice.entity.EspritReference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EspritReferenceRepository extends JpaRepository<EspritReference, Long> {

    Optional<EspritReference> findByEspritIdAndCin(String espritId, String cin);

    boolean existsByEspritId(String espritId);
}

package com.esprit.foyerservice.repository;

import com.esprit.foyerservice.entity.Chambre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChambreRepository extends JpaRepository<Chambre, Long> {
    List<Chambre> findByResidenceId(Long residenceId);
    List<Chambre> findByStatut(Chambre.StatutChambre statut);
}

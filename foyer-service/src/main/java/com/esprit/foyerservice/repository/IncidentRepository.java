package com.esprit.foyerservice.repository;

import com.esprit.foyerservice.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByChambreId(Long chambreId);
    List<Incident> findByStatut(Incident.StatutIncident statut);
}

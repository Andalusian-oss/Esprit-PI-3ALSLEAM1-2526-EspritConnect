package com.esprit.foyerservice.repository;

import com.esprit.foyerservice.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByStudentUserId(Long userId);
    List<Reservation> findByChambreId(Long chambreId);
}

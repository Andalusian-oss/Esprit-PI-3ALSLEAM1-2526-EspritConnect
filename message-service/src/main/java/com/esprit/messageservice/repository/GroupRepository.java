package com.esprit.messageservice.repository;

import com.esprit.messageservice.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query("SELECT DISTINCT gm.group FROM GroupMember gm WHERE gm.userId = :userId")
    List<Group> findGroupsByUserId(@Param("userId") Long userId);
}

package com.example.fitness_planner.repository;

import com.example.fitness_planner.entity.User;
import com.example.fitness_planner.entity.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
    List<WeightLog> findByUserOrderByLoggedDateAsc(User user);
    Optional<WeightLog> findTopByUserOrderByLoggedDateDesc(User user);
}

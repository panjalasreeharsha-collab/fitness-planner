package com.example.fitness_planner.repository;

import com.example.fitness_planner.entity.FitnessPlan;
import com.example.fitness_planner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FitnessPlanRepository extends JpaRepository<FitnessPlan, Long> {
    Optional<FitnessPlan> findTopByUserOrderByCreatedAtDesc(User user);
}

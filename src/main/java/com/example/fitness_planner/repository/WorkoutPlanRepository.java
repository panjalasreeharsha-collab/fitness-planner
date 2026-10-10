package com.example.fitness_planner.repository;

import com.example.fitness_planner.entity.FitnessPlan;
import com.example.fitness_planner.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByPlanOrderByIdAsc(FitnessPlan plan);
}

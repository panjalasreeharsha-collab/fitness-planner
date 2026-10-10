package com.example.fitness_planner.dto;

import com.example.fitness_planner.entity.Goal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessPlanResponse {
    private Long id;
    private Goal goal;
    private Double bmr;
    private Double tdee;
    private Integer targetCalories;
    private Integer proteinGrams;
    private Integer carbsGrams;
    private Integer fatGrams;
    private String workoutSplitType;
    private String profession;
    private LocalDateTime createdAt;
    private List<WorkoutPlanResponse> workoutPlans;
}

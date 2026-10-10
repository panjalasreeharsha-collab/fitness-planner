package com.example.fitness_planner.dto;

import com.example.fitness_planner.entity.ActivityLevel;
import com.example.fitness_planner.entity.Goal;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanGenerationRequest {

    @NotNull(message = "Goal is required")
    private Goal goal;

    @NotNull(message = "Activity level is required")
    private ActivityLevel activityLevel;
}

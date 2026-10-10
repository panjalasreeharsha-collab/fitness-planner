package com.example.fitness_planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanResponse {
    private Long id;
    private String dayOfWeek;
    private String focusArea;
    private String exercises;
}

package com.example.fitness_planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeightLogResponse {
    private Long id;
    private Double weightKg;
    private Double neckCm;
    private Double waistCm;
    private Double hipCm;
    private Double estimatedBodyFat;
    private LocalDate loggedDate;
}

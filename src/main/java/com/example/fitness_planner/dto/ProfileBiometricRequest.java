package com.example.fitness_planner.dto;

import com.example.fitness_planner.entity.ActivityLevel;
import com.example.fitness_planner.entity.Gender;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileBiometricRequest {

    @NotNull(message = "Age is required")
    private Integer age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "Height in cm is required")
    private Double heightCm;

    @NotNull(message = "Weight in kg is required")
    private Double weightKg;

    @NotNull(message = "Neck measurement is required")
    private Double neckCm;

    @NotNull(message = "Waist measurement is required")
    private Double waistCm;

    @NotNull(message = "Hip measurement is required")
    private Double hipCm;

    @NotNull(message = "Activity level is required")
    private ActivityLevel activityLevel;
}

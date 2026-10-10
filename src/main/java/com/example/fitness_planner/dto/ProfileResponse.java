package com.example.fitness_planner.dto;

import com.example.fitness_planner.entity.ActivityLevel;
import com.example.fitness_planner.entity.Gender;
import com.example.fitness_planner.entity.WorkoutSplitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Integer age;
    private Gender gender;
    private Double heightCm;
    private Double weightKg;
    private Double neckCm;
    private Double waistCm;
    private Double hipCm;
    private ActivityLevel activityLevel;
    private String profession;
    private WorkoutSplitType workoutSplitType;
}

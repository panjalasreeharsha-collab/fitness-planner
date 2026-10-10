package com.example.fitness_planner.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "workout_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonIgnore
    private FitnessPlan plan;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek;

    @Column(name = "focus_area", nullable = false)
    private String focusArea;

    @Lob
    @Column(name = "exercises", columnDefinition = "TEXT")
    private String exercises;
}

package com.example.fitness_planner.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fitness_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FitnessPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Goal goal;

    @Column(nullable = false)
    private Double bmr;

    @Column(nullable = false)
    private Double tdee;

    @Column(name = "target_calories", nullable = false)
    private Integer targetCalories;

    @Column(name = "protein_grams", nullable = false)
    private Integer proteinGrams;

    @Column(name = "carbs_grams", nullable = false)
    private Integer carbsGrams;

    @Column(name = "fat_grams", nullable = false)
    private Integer fatGrams;

    @Column(name = "workout_split_type", nullable = false)
    private String workoutSplitType;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Default
    private List<WorkoutPlan> workoutPlans = new ArrayList<>();
}

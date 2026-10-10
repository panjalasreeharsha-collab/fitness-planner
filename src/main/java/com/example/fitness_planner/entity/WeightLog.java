package com.example.fitness_planner.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "weight_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeightLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "weight_kg", nullable = false)
    private Double weightKg;

    @Column(name = "neck_cm")
    private Double neckCm;

    @Column(name = "waist_cm")
    private Double waistCm;

    @Column(name = "hip_cm")
    private Double hipCm;

    @Column(name = "estimated_body_fat")
    private Double estimatedBodyFat;

    @Column(name = "logged_date", nullable = false)
    private LocalDate loggedDate;
}

package com.example.fitness_planner.controller;

import com.example.fitness_planner.dto.FitnessPlanResponse;
import com.example.fitness_planner.dto.PlanGenerationRequest;
import com.example.fitness_planner.entity.User;
import com.example.fitness_planner.service.FitnessPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PlanController {

    private final FitnessPlanService fitnessPlanService;

    @PostMapping("/plans/generate")
    public ResponseEntity<FitnessPlanResponse> generatePlan(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PlanGenerationRequest request
    ) {
        return ResponseEntity.ok(fitnessPlanService.generatePlan(user, request.getGoal(), request.getActivityLevel()));
    }

    @GetMapping("/plans/current")
    public ResponseEntity<FitnessPlanResponse> getCurrentPlan(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(fitnessPlanService.getCurrentPlan(user));
    }
}

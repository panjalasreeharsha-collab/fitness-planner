package com.example.fitness_planner.controller;

import com.example.fitness_planner.dto.ProfileBiometricRequest;
import com.example.fitness_planner.dto.WeightLogResponse;
import com.example.fitness_planner.entity.User;
import com.example.fitness_planner.service.FitnessPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final FitnessPlanService fitnessPlanService;

    @PostMapping("/profile/biometrics")
    public ResponseEntity<WeightLogResponse> saveBiometrics(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProfileBiometricRequest request
    ) {
        return ResponseEntity.ok(fitnessPlanService.saveBiometrics(user, request));
    }

    @GetMapping("/weight-logs/history")
    public ResponseEntity<List<WeightLogResponse>> getWeightHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(fitnessPlanService.getWeightHistory(user));
    }
}

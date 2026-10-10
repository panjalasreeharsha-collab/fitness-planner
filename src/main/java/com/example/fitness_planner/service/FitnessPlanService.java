package com.example.fitness_planner.service;

import com.example.fitness_planner.dto.FitnessPlanResponse;
import com.example.fitness_planner.dto.ProfileBiometricRequest;
import com.example.fitness_planner.dto.WeightLogResponse;
import com.example.fitness_planner.dto.WorkoutPlanResponse;
import com.example.fitness_planner.entity.*;
import com.example.fitness_planner.repository.FitnessPlanRepository;
import com.example.fitness_planner.repository.UserRepository;
import com.example.fitness_planner.repository.WeightLogRepository;
import com.example.fitness_planner.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FitnessPlanService {

    private final UserRepository userRepository;
    private final WeightLogRepository weightLogRepository;
    private final FitnessPlanRepository fitnessPlanRepository;
    private final WorkoutPlanRepository workoutPlanRepository;

    public WeightLogResponse saveBiometrics(User user, ProfileBiometricRequest request) {
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setHeightCm(request.getHeightCm());
        user.setActivityLevel(request.getActivityLevel());
        userRepository.save(user);

        WeightLog weightLog = WeightLog.builder()
                .user(user)
                .weightKg(request.getWeightKg())
                .neckCm(request.getNeckCm())
                .waistCm(request.getWaistCm())
                .hipCm(request.getHipCm())
                .estimatedBodyFat(calculateBodyFat(
                        request.getGender(),
                        request.getWeightKg(),
                        request.getNeckCm(),
                        request.getWaistCm(),
                        request.getHipCm(),
                        request.getHeightCm()))
                .loggedDate(LocalDate.now())
                .build();

        WeightLog savedWeightLog = weightLogRepository.save(weightLog);

        return WeightLogResponse.builder()
                .id(savedWeightLog.getId())
                .weightKg(savedWeightLog.getWeightKg())
                .neckCm(savedWeightLog.getNeckCm())
                .waistCm(savedWeightLog.getWaistCm())
                .hipCm(savedWeightLog.getHipCm())
                .estimatedBodyFat(savedWeightLog.getEstimatedBodyFat())
                .loggedDate(savedWeightLog.getLoggedDate())
                .build();
    }

    @Transactional
    public FitnessPlanResponse generatePlan(User user, Goal goal, ActivityLevel activityLevel) {
        user.setActivityLevel(activityLevel);
        userRepository.save(user);

        WeightLog latestWeightLog = weightLogRepository.findTopByUserOrderByLoggedDateDesc(user)
                .orElseThrow(() -> new IllegalArgumentException("Please save a biometric profile before generating a plan"));

        double weightKg = latestWeightLog.getWeightKg();
        double heightCm = user.getHeightCm();
        int age = user.getAge();
        Gender gender = user.getGender();

        double bmr = calculateBmr(weightKg, heightCm, age, gender);
        double tdee = bmr * getActivityMultiplier(activityLevel);
        int targetCalories = calculateTargetCalories(goal, tdee);

        double proteinGrams = weightKg * 2.0;
        double fatGrams = (targetCalories * 0.22) / 9.0;
        double carbsGrams = Math.max(0, (targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4.0);

        FitnessPlan plan = FitnessPlan.builder()
                .user(user)
                .goal(goal)
                .bmr(Math.round(bmr * 10.0) / 10.0)
                .tdee(Math.round(tdee * 10.0) / 10.0)
                .targetCalories(targetCalories)
                .proteinGrams((int) Math.round(proteinGrams))
                .carbsGrams((int) Math.round(carbsGrams))
                .fatGrams((int) Math.round(fatGrams))
                .workoutSplitType(resolveWorkoutSplit(goal))
                .build();

        FitnessPlan savedPlan = fitnessPlanRepository.save(plan);

        List<WorkoutPlan> workoutPlans = buildWorkoutPlan(savedPlan, resolveWorkoutSplit(goal));
        workoutPlanRepository.saveAll(workoutPlans);

        return FitnessPlanResponse.builder()
                .id(savedPlan.getId())
                .goal(savedPlan.getGoal())
                .bmr(savedPlan.getBmr())
                .tdee(savedPlan.getTdee())
                .targetCalories(savedPlan.getTargetCalories())
                .proteinGrams(savedPlan.getProteinGrams())
                .carbsGrams(savedPlan.getCarbsGrams())
                .fatGrams(savedPlan.getFatGrams())
                .workoutSplitType(savedPlan.getWorkoutSplitType())
                .createdAt(savedPlan.getCreatedAt())
                .workoutPlans(toWorkoutPlanResponses(workoutPlans))
                .build();
    }

    public FitnessPlanResponse getCurrentPlan(User user) {
        FitnessPlan latestPlan = fitnessPlanRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new IllegalArgumentException("No fitness plan exists for this user"));

        List<WorkoutPlan> workoutPlans = workoutPlanRepository.findByPlanOrderByIdAsc(latestPlan);

        return FitnessPlanResponse.builder()
                .id(latestPlan.getId())
                .goal(latestPlan.getGoal())
                .bmr(latestPlan.getBmr())
                .tdee(latestPlan.getTdee())
                .targetCalories(latestPlan.getTargetCalories())
                .proteinGrams(latestPlan.getProteinGrams())
                .carbsGrams(latestPlan.getCarbsGrams())
                .fatGrams(latestPlan.getFatGrams())
                .workoutSplitType(latestPlan.getWorkoutSplitType())
                .createdAt(latestPlan.getCreatedAt())
                .workoutPlans(toWorkoutPlanResponses(workoutPlans))
                .build();
    }

    public List<WeightLogResponse> getWeightHistory(User user) {
        List<WeightLog> logs = weightLogRepository.findByUserOrderByLoggedDateAsc(user);
        return logs.stream()
                .map(log -> WeightLogResponse.builder()
                        .id(log.getId())
                        .weightKg(log.getWeightKg())
                        .neckCm(log.getNeckCm())
                        .waistCm(log.getWaistCm())
                        .hipCm(log.getHipCm())
                        .estimatedBodyFat(log.getEstimatedBodyFat())
                        .loggedDate(log.getLoggedDate())
                        .build())
                .toList();
    }

    private double calculateBmr(double weightKg, double heightCm, int age, Gender gender) {
        if (gender == Gender.MALE) {
            return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        }
        return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }

    private double getActivityMultiplier(ActivityLevel activityLevel) {
        return switch (activityLevel) {
            case SEDENTARY -> 1.2;
            case LIGHT -> 1.375;
            case MODERATE -> 1.55;
            case ACTIVE -> 1.725;
            case VERY_ACTIVE -> 1.9;
        };
    }

    private int calculateTargetCalories(Goal goal, double tdee) {
        return (int) Math.round(switch (goal) {
            case CUT -> tdee - 500;
            case LEAN_BULK -> tdee + 250;
            case BULK -> tdee + 500;
        });
    }

    private double calculateBodyFat(Gender gender, double weightKg, double neckCm, double waistCm, double hipCm, double heightCm) {
        if (neckCm <= 0 || waistCm <= 0 || heightCm <= 0) {
            return 0.0;
        }

        if (gender == Gender.MALE) {
            double waistMinusNeck = waistCm - neckCm;
            double numerator = 495.0 / (1.0324 - 0.19077 * Math.log10(waistMinusNeck) + 0.15456 * Math.log10(heightCm));
            return Math.max(0.0, numerator - 450.0);
        }

        double waistPlusHipMinusNeck = waistCm + hipCm - neckCm;
        double numerator = 495.0 / (1.29579 - 0.35004 * Math.log10(waistPlusHipMinusNeck) + 0.22100 * Math.log10(heightCm));
        return Math.max(0.0, numerator - 450.0);
    }

    private String resolveWorkoutSplit(Goal goal) {
        return switch (goal) {
            case CUT -> "4-Day Upper/Lower";
            case LEAN_BULK -> "5-Day Push/Pull/Legs";
            case BULK -> "6-Day PPL";
        };
    }

    private List<WorkoutPlan> buildWorkoutPlan(FitnessPlan plan, String splitType) {
        List<WorkoutPlan> workoutPlans = new ArrayList<>();

        if (splitType.equals("4-Day Upper/Lower")) {
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Monday").focusArea("Upper").exercises("Bench Press, Incline DB Press, Lat Pulldown, Barbell Row, Shoulder Press, Cable Flyes, Pull-Ups").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Tuesday").focusArea("Lower").exercises("Back Squat, Romanian Deadlift, Leg Press, Walking Lunges, Leg Curl, Calf Raises").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Thursday").focusArea("Upper").exercises("Weighted Pull-Ups, Seated Cable Row, Dumbbell Incline Press, Lat Pulldown, Lateral Raises, Triceps Rope Pushdown").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Friday").focusArea("Lower").exercises("Front Squat, Hip Thrust, Bulgarian Split Squat, Romanian Deadlift, Leg Extension, Seated Calf Raise").build());
        } else if (splitType.equals("5-Day Push/Pull/Legs")) {
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Monday").focusArea("Push").exercises("Barbell Bench, Overhead Press, Incline DB Press, Cable Flyes, Triceps Extension").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Tuesday").focusArea("Pull").exercises("Chin-Ups, One-Arm Row, Lat Pulldown, Hammer Curl, Rear Delt Flyes").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Wednesday").focusArea("Legs").exercises("Back Squat, Leg Press, Romanian Deadlift, Walking Lunges, Leg Curl").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Thursday").focusArea("Push").exercises("Incline Bench, Seated Dumbbell Press, Cable Press, Lateral Raises, Skull Crushers").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Friday").focusArea("Pull").exercises("T-Bar Row, Assisted Pull-Ups, Single-Arm Lat Pulldown, EZ-Bar Curl, Face Pulls").build());
        } else {
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Monday").focusArea("Push").exercises("Bench Press, Incline Press, Overhead Press, Dips, Triceps Pushdown").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Tuesday").focusArea("Pull").exercises("Pull-Ups, Barbell Row, Lat Pulldown, Hammer Curl, Rear Delt Fly").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Wednesday").focusArea("Legs").exercises("Back Squat, Romanian Deadlift, Leg Press, Bulgarian Split Squat, Calf Raise").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Thursday").focusArea("Push").exercises("Dumbbell Press, Machine Chest Press, Lateral Raise, Cable Fly, Triceps Extension").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Friday").focusArea("Pull").exercises("Chest-Supported Row, Seated Cable Row, Reverse Grip Pulldown, Curl, Face Pull").build());
            workoutPlans.add(WorkoutPlan.builder().plan(plan).dayOfWeek("Saturday").focusArea("Legs").exercises("Front Squat, Hip Thrust, Walking Lunges, Leg Curl, High Box Step-Up").build());
        }

        return workoutPlans;
    }

    private List<WorkoutPlanResponse> toWorkoutPlanResponses(List<WorkoutPlan> workoutPlans) {
        return workoutPlans.stream()
                .map(plan -> WorkoutPlanResponse.builder()
                        .id(plan.getId())
                        .dayOfWeek(plan.getDayOfWeek())
                        .focusArea(plan.getFocusArea())
                        .exercises(plan.getExercises())
                        .build())
                .toList();
    }
}

package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.model.DailyProgress;
import com.skyward.projectmanagement.service.DailyProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:5173")
public class DailyProgressController {

    private final DailyProgressService dailyProgressService;

    public DailyProgressController(DailyProgressService dailyProgressService) {
        this.dailyProgressService = dailyProgressService;
    }

    @GetMapping
    public List<DailyProgress> getAllProgress() {
        return dailyProgressService.getAllProgress();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DailyProgress> getProgressById(@PathVariable Long id) {
        return dailyProgressService.getProgressById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<DailyProgress> getProgressByProject(@PathVariable Long projectId) {
        return dailyProgressService.getProgressByProject(projectId);
    }

    @PostMapping
    public ResponseEntity<?> createProgress(@RequestBody DailyProgress progress) {
        try {
            return ResponseEntity.ok(
                    dailyProgressService.createProgress(progress)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgress(
            @PathVariable Long id,
            @RequestBody DailyProgress updatedProgress) {

        try {
            return ResponseEntity.ok(
                    dailyProgressService.updateProgress(id, updatedProgress)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable Long id) {

        if (dailyProgressService.getProgressById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        dailyProgressService.deleteProgress(id);
        return ResponseEntity.noContent().build();
    }
}
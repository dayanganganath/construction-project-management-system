package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.model.ProjectExpense;
import com.skyward.projectmanagement.service.ProjectExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectExpenseController {

    private final ProjectExpenseService projectExpenseService;

    public ProjectExpenseController(ProjectExpenseService projectExpenseService) {
        this.projectExpenseService = projectExpenseService;
    }

    @GetMapping
    public List<ProjectExpense> getAllExpenses() {
        return projectExpenseService.getAllExpenses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectExpense> getExpenseById(@PathVariable Long id) {
        return projectExpenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createExpense(@RequestBody ProjectExpense expense) {
        try {
            return ResponseEntity.ok(
                    projectExpenseService.createExpense(expense)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Long id,
            @RequestBody ProjectExpense updatedExpense) {

        try {
            return ResponseEntity.ok(
                    projectExpenseService.updateExpense(id, updatedExpense)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {

        if (projectExpenseService.getExpenseById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        projectExpenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
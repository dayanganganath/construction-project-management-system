package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.service.ProjectFinancialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectFinancialController {

    private final ProjectFinancialService projectFinancialService;

    public ProjectFinancialController(
            ProjectFinancialService projectFinancialService
    ) {
        this.projectFinancialService = projectFinancialService;
    }

    @GetMapping("/{projectId}/financial-summary")
    public ResponseEntity<?> getFinancialSummary(
            @PathVariable Long projectId
    ) {

        try {
            Map<String, Object> summary =
                    projectFinancialService
                            .getProjectFinancialSummary(projectId);

            return ResponseEntity.ok(summary);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
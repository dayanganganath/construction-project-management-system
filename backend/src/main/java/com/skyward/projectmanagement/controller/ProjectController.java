package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Project project) {
        try {
            return ResponseEntity.ok(projectService.createProject(project));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long id,
            @RequestBody Project updatedProject) {

        try {
            return ResponseEntity.ok(
                    projectService.updateProject(id, updatedProject)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {

        if (projectService.getProjectById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
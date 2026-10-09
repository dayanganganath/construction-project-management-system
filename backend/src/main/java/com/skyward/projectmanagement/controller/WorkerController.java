package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.Worker;
import com.skyward.projectmanagement.service.WorkerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(
            WorkerService workerService
    ) {
        this.workerService =
                workerService;
    }

    @GetMapping
    public List<Worker> getAllWorkers() {
        return workerService
                .getAllWorkers();
    }

    @GetMapping("/active")
    public List<Worker> getActiveWorkers() {
        return workerService
                .getActiveWorkers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkerById(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    workerService
                            .getWorkerById(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createWorker(
            @RequestBody Worker worker
    ) {
        try {
            return ResponseEntity.ok(
                    workerService
                            .createWorker(worker)
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorker(
            @PathVariable Long id,
            @RequestBody Worker worker
    ) {
        try {
            return ResponseEntity.ok(
                    workerService
                            .updateWorker(
                                    id,
                                    worker
                            )
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorker(
            @PathVariable Long id
    ) {
        try {
            workerService
                    .deleteWorker(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
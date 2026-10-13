package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.MaterialRequest;
import com.skyward.projectmanagement.service.MaterialRequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class MaterialRequestController {

    private final MaterialRequestService
            materialRequestService;

    public MaterialRequestController(
            MaterialRequestService materialRequestService
    ) {
        this.materialRequestService =
                materialRequestService;
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    @PostMapping(
            "/api/supervisor/projects/{projectId}/material-requests"
    )
    public ResponseEntity<?>
    createSupervisorRequest(
            Authentication authentication,
            @PathVariable Long projectId,
            @RequestBody MaterialRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .createSupervisorRequest(
                                    authentication
                                            .getName(),
                                    projectId,
                                    request
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/supervisor/projects/{projectId}/material-requests"
    )
    public ResponseEntity<?>
    getSupervisorProjectRequests(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .getSupervisorProjectRequests(
                                    authentication
                                            .getName(),
                                    projectId
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    /*
     * =========================================================
     * CONTRACTOR
     * =========================================================
     */

    @PostMapping(
            "/api/contractor/projects/{projectId}/material-requests"
    )
    public ResponseEntity<?>
    createContractorRequest(
            Authentication authentication,
            @PathVariable Long projectId,
            @RequestBody MaterialRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .createContractorRequest(
                                    authentication
                                            .getName(),
                                    projectId,
                                    request
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/contractor/material-requests"
    )
    public ResponseEntity<?>
    getContractorRequests(
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .getContractorRequests(
                                    authentication
                                            .getName()
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/contractor/projects/{projectId}/material-requests"
    )
    public ResponseEntity<?>
    getContractorProjectRequests(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .getContractorProjectRequests(
                                    authentication
                                            .getName(),
                                    projectId
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    @GetMapping(
            "/api/material-requests"
    )
    public ResponseEntity<?>
    getAll(
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .getAllForManagement(
                                    authentication
                                            .getName()
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/material-requests/project/{projectId}"
    )
    public ResponseEntity<?>
    getByProject(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .getProjectRequestsForManagement(
                                    authentication
                                            .getName(),
                                    projectId
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/material-requests/{requestId}"
    )
    public ResponseEntity<?>
    getById(
            Authentication authentication,
            @PathVariable Long requestId
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .getByIdForManagement(
                                    authentication
                                            .getName(),
                                    requestId
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @PutMapping(
            "/api/material-requests/{requestId}/review"
    )
    public ResponseEntity<?>
    reviewRequest(
            Authentication authentication,
            @PathVariable Long requestId,
            @RequestBody ReviewRequestBody body
    ) {

        try {

            return ResponseEntity.ok(
                    materialRequestService
                            .reviewRequest(
                                    authentication
                                            .getName(),
                                    requestId,
                                    body.getStatus(),
                                    body.getRemarks()
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    /*
     * =========================================================
     * REVIEW DTO
     * =========================================================
     */

    public static class ReviewRequestBody {

        private String status;

        private String remarks;

        public String getStatus() {
            return status;
        }

        public void setStatus(
                String status
        ) {
            this.status =
                    status;
        }

        public String getRemarks() {
            return remarks;
        }

        public void setRemarks(
                String remarks
        ) {
            this.remarks =
                    remarks;
        }
    }
}
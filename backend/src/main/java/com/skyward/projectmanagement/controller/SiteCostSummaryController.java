package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.SiteCostSummaryDto;
import com.skyward.projectmanagement.service.SiteCostSummaryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/site-cost-summary")
public class SiteCostSummaryController {

    private final SiteCostSummaryService service;

    public SiteCostSummaryController(
            SiteCostSummaryService service
    ) {
        this.service = service;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<SiteCostSummaryDto>
    getProjectSummary(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                service.getProjectSummary(
                        projectId
                )
        );
    }
}
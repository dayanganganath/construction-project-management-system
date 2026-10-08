package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.SiteReportSummaryDto;
import com.skyward.projectmanagement.service.SiteReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/site-report")
public class SiteReportController {

    private final SiteReportService siteReportService;

    public SiteReportController(
            SiteReportService siteReportService
    ) {
        this.siteReportService = siteReportService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<SiteReportSummaryDto>
    getProjectReport(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                siteReportService.getReportSummary(
                        projectId
                )
        );
    }
}
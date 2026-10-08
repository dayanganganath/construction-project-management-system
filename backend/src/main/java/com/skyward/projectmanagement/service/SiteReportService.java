package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.SiteReportSummaryDto;
import com.skyward.projectmanagement.model.DailyProgress;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.DailyProgressRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SiteReportService {

    private final ProjectRepository projectRepository;
    private final DailyProgressRepository dailyProgressRepository;
    private final SiteCostSummaryService siteCostSummaryService;

    public SiteReportService(
            ProjectRepository projectRepository,
            DailyProgressRepository dailyProgressRepository,
            SiteCostSummaryService siteCostSummaryService
    ) {
        this.projectRepository = projectRepository;
        this.dailyProgressRepository = dailyProgressRepository;
        this.siteCostSummaryService = siteCostSummaryService;
    }

    public SiteReportSummaryDto getReportSummary(
            Long projectId
    ) {

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found."
                                )
                        );

        SiteReportSummaryDto report =
                new SiteReportSummaryDto();

        report.setProjectId(
                project.getId()
        );

        report.setProjectName(
                project.getProjectName()
        );

        report.setLocation(
                project.getLocation()
        );

        report.setStatus(
                project.getStatus()
        );

        report.setStartDate(
                project.getStartDate()
        );

        report.setEndDate(
                project.getEndDate()
        );

        report.setFinancialSummary(
                siteCostSummaryService
                        .getProjectSummary(projectId)
        );

        List<DailyProgress> progressEntries =
                dailyProgressRepository
                        .findByProjectId(projectId);

        report.setTotalProgressEntries(
                progressEntries.size()
        );

        dailyProgressRepository
                .findTopByProjectIdOrderByDateDescIdDesc(
                        projectId
                )
                .ifPresent(latest -> {

                    report.setLatestProgressDate(
                            latest.getDate()
                    );

                    report.setLatestProgressPercentage(
                            latest.getProgressPercentage()
                    );

                    report.setLatestWorkersCount(
                            latest.getWorkersCount()
                    );

                    report.setLatestWorkDescription(
                            latest.getWorkDescription()
                    );

                    report.setLatestRemarks(
                            latest.getRemarks()
                    );
                });

        return report;
    }
}
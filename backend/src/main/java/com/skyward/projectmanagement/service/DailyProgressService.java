package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.DailyProgress;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.DailyProgressRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DailyProgressService {

    private final DailyProgressRepository dailyProgressRepository;
    private final ProjectRepository projectRepository;

    public DailyProgressService(
            DailyProgressRepository dailyProgressRepository,
            ProjectRepository projectRepository
    ) {
        this.dailyProgressRepository =
                dailyProgressRepository;

        this.projectRepository =
                projectRepository;
    }

    public List<DailyProgress> getAllProgress() {
        return dailyProgressRepository.findAll();
    }

    public List<DailyProgress> getProgressByProject(
            Long projectId
    ) {
        return dailyProgressRepository
                .findByProjectId(projectId);
    }

    public Optional<DailyProgress> getProgressById(
            Long id
    ) {
        return dailyProgressRepository
                .findById(id);
    }

    public DailyProgress createProgress(
            DailyProgress progress
    ) {

        validateProgress(progress);

        Project project =
                projectRepository
                        .findById(
                                progress
                                        .getProject()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                )
                        );

        progress.setProject(project);

        if (progress.getProgressPercentage() == null) {
            progress.setProgressPercentage(0);
        }

        if (progress.getWorkersCount() == null) {
            progress.setWorkersCount(0);
        }

        return dailyProgressRepository
                .save(progress);
    }

    public DailyProgress updateProgress(
            Long id,
            DailyProgress updatedProgress
    ) {

        validateProgress(updatedProgress);

        return dailyProgressRepository
                .findById(id)
                .map(progress -> {

                    progress.setDate(
                            updatedProgress.getDate()
                    );

                    progress.setWorkDescription(
                            updatedProgress
                                    .getWorkDescription()
                    );

                    progress.setProgressPercentage(
                            updatedProgress
                                    .getProgressPercentage()
                    );

                    progress.setWorkersCount(
                            updatedProgress
                                    .getWorkersCount()
                    );

                    progress.setRemarks(
                            updatedProgress.getRemarks()
                    );

                    progress.setTomorrowPlan(
                            updatedProgress
                                    .getTomorrowPlan()
                    );

                    progress.setIssuesBlockers(
                            updatedProgress
                                    .getIssuesBlockers()
                    );

                    if (
                            updatedProgress.getProject()
                                    != null
                                    &&
                            updatedProgress
                                    .getProject()
                                    .getId()
                                    != null
                    ) {

                        Project project =
                                projectRepository
                                        .findById(
                                                updatedProgress
                                                        .getProject()
                                                        .getId()
                                        )
                                        .orElseThrow(() ->
                                                new RuntimeException(
                                                        "Project not found"
                                                )
                                        );

                        progress.setProject(project);
                    }

                    return dailyProgressRepository
                            .save(progress);
                })
                .orElseThrow(() ->
                        new RuntimeException(
                                "Progress record not found"
                        )
                );
    }

    public void deleteProgress(Long id) {

        if (!dailyProgressRepository.existsById(id)) {
            throw new RuntimeException(
                    "Progress record not found"
            );
        }

        dailyProgressRepository.deleteById(id);
    }

    private void validateProgress(
            DailyProgress progress
    ) {

        if (progress.getDate() == null) {
            throw new RuntimeException(
                    "Date is required"
            );
        }

        if (
                progress.getWorkDescription()
                        == null
                        ||
                progress.getWorkDescription()
                        .isBlank()
        ) {
            throw new RuntimeException(
                    "Work description is required"
            );
        }

        if (
                progress.getProject() == null
                        ||
                progress.getProject()
                        .getId() == null
        ) {
            throw new RuntimeException(
                    "Project ID is required"
            );
        }

        if (
                progress.getProgressPercentage()
                        != null
                        &&
                (
                        progress
                                .getProgressPercentage()
                                < 0
                                ||
                        progress
                                .getProgressPercentage()
                                > 100
                )
        ) {
            throw new RuntimeException(
                    "Progress percentage must be between 0 and 100"
            );
        }

        if (
                progress.getWorkersCount()
                        != null
                        &&
                progress.getWorkersCount()
                        < 0
        ) {
            throw new RuntimeException(
                    "Workers count cannot be negative"
            );
        }
    }
}
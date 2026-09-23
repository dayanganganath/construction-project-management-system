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
            ProjectRepository projectRepository) {

        this.dailyProgressRepository = dailyProgressRepository;
        this.projectRepository = projectRepository;
    }

    public List<DailyProgress> getAllProgress() {
        return dailyProgressRepository.findAll();
    }

    public List<DailyProgress> getProgressByProject(Long projectId) {
        return dailyProgressRepository.findByProjectId(projectId);
    }

    public Optional<DailyProgress> getProgressById(Long id) {
        return dailyProgressRepository.findById(id);
    }

    public DailyProgress createProgress(DailyProgress progress) {

        if (progress.getProject() == null || progress.getProject().getId() == null) {
            throw new RuntimeException("Project ID is required");
        }

        Project project = projectRepository
                .findById(progress.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        progress.setProject(project);

        return dailyProgressRepository.save(progress);
    }

    public DailyProgress updateProgress(Long id, DailyProgress updatedProgress) {

        return dailyProgressRepository.findById(id)
                .map(progress -> {

                    progress.setDate(updatedProgress.getDate());
                    progress.setWorkDescription(updatedProgress.getWorkDescription());
                    progress.setProgressPercentage(updatedProgress.getProgressPercentage());
                    progress.setWorkersCount(updatedProgress.getWorkersCount());
                    progress.setRemarks(updatedProgress.getRemarks());

                    if (updatedProgress.getProject() != null
                            && updatedProgress.getProject().getId() != null) {

                        Project project = projectRepository
                                .findById(updatedProgress.getProject().getId())
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                        progress.setProject(project);
                    }

                    return dailyProgressRepository.save(progress);
                })
                .orElseThrow(() -> new RuntimeException("Progress record not found"));
    }

    public void deleteProgress(Long id) {
        dailyProgressRepository.deleteById(id);
    }
}
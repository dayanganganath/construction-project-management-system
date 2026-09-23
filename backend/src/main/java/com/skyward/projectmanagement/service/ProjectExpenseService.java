package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.model.ProjectExpense;
import com.skyward.projectmanagement.repository.ProjectExpenseRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectExpenseService {

    private final ProjectExpenseRepository projectExpenseRepository;
    private final ProjectRepository projectRepository;

    public ProjectExpenseService(ProjectExpenseRepository projectExpenseRepository,
                                 ProjectRepository projectRepository) {
        this.projectExpenseRepository = projectExpenseRepository;
        this.projectRepository = projectRepository;
    }

    public List<ProjectExpense> getAllExpenses() {
        return projectExpenseRepository.findAll();
    }

    public Optional<ProjectExpense> getExpenseById(Long id) {
        return projectExpenseRepository.findById(id);
    }

    public ProjectExpense createExpense(ProjectExpense expense) {

        if (expense.getProject() == null || expense.getProject().getId() == null) {
            throw new RuntimeException("Project ID is required");
        }

        Project project = projectRepository
                .findById(expense.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        expense.setProject(project);

        return projectExpenseRepository.save(expense);
    }

    public ProjectExpense updateExpense(Long id, ProjectExpense updatedExpense) {

        return projectExpenseRepository.findById(id)
                .map(expense -> {

                    expense.setExpenseType(updatedExpense.getExpenseType());
                    expense.setDescription(updatedExpense.getDescription());
                    expense.setAmount(updatedExpense.getAmount());
                    expense.setDate(updatedExpense.getDate());

                    if (updatedExpense.getProject() != null
                            && updatedExpense.getProject().getId() != null) {

                        Project project = projectRepository
                                .findById(updatedExpense.getProject().getId())
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                        expense.setProject(project);
                    }

                    return projectExpenseRepository.save(expense);
                })
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    public void deleteExpense(Long id) {
        projectExpenseRepository.deleteById(id);
    }
}
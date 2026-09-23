package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.Payment;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.model.ProjectExpense;
import com.skyward.projectmanagement.repository.PaymentRepository;
import com.skyward.projectmanagement.repository.ProjectExpenseRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProjectFinancialService {

    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;
    private final ProjectExpenseRepository projectExpenseRepository;

    public ProjectFinancialService(
            ProjectRepository projectRepository,
            PaymentRepository paymentRepository,
            ProjectExpenseRepository projectExpenseRepository) {

        this.projectRepository = projectRepository;
        this.paymentRepository = paymentRepository;
        this.projectExpenseRepository = projectExpenseRepository;
    }

    public Map<String, BigDecimal> getProjectFinancialSummary(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<Payment> payments =
                paymentRepository.findByProjectId(projectId);

        List<ProjectExpense> expenses =
                projectExpenseRepository.findByProjectId(projectId);

        BigDecimal totalPaid = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenses.stream()
                .map(ProjectExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal projectBudget = project.getBudget() != null
                ? project.getBudget()
                : BigDecimal.ZERO;

        BigDecimal remainingBalance =
                projectBudget.subtract(totalPaid);

        BigDecimal currentCashBalance =
                totalPaid.subtract(totalExpenses);

        Map<String, BigDecimal> summary = new HashMap<>();

        summary.put("projectBudget", projectBudget);
        summary.put("totalPaid", totalPaid);
        summary.put("remainingBalance", remainingBalance);
        summary.put("totalExpenses", totalExpenses);
        summary.put("currentCashBalance", currentCashBalance);

        return summary;
    }
}
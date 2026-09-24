package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.BoqItem;
import com.skyward.projectmanagement.model.DailyProgress;
import com.skyward.projectmanagement.model.Payment;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.model.ProjectExpense;
import com.skyward.projectmanagement.repository.BoqItemRepository;
import com.skyward.projectmanagement.repository.DailyProgressRepository;
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
    private final BoqItemRepository boqItemRepository;
    private final DailyProgressRepository dailyProgressRepository;

    public ProjectFinancialService(
            ProjectRepository projectRepository,
            PaymentRepository paymentRepository,
            ProjectExpenseRepository projectExpenseRepository,
            BoqItemRepository boqItemRepository,
            DailyProgressRepository dailyProgressRepository) {

        this.projectRepository = projectRepository;
        this.paymentRepository = paymentRepository;
        this.projectExpenseRepository = projectExpenseRepository;
        this.boqItemRepository = boqItemRepository;
        this.dailyProgressRepository = dailyProgressRepository;
    }

    public Map<String, Object> getProjectFinancialSummary(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<Payment> payments =
                paymentRepository.findByProjectId(projectId);

        List<ProjectExpense> expenses =
                projectExpenseRepository.findByProjectId(projectId);

        List<BoqItem> boqItems =
                boqItemRepository.findByProjectId(projectId);

        BigDecimal totalPaid = payments.stream()
                .map(Payment::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenses.stream()
                .map(ProjectExpense::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal boqTotal = boqItems.stream()
                .map(BoqItem::getTotal)
                .filter(total -> total != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal projectBudget =
                project.getBudget() != null
                        ? project.getBudget()
                        : BigDecimal.ZERO;

        BigDecimal remainingBalance =
                projectBudget.subtract(totalPaid);

        BigDecimal currentCashBalance =
                totalPaid.subtract(totalExpenses);

        Integer latestProgressPercentage =
                dailyProgressRepository
                        .findTopByProjectIdOrderByDateDescIdDesc(projectId)
                        .map(DailyProgress::getProgressPercentage)
                        .orElse(0);

        Map<String, Object> summary = new HashMap<>();

        summary.put("projectBudget", projectBudget);
        summary.put("boqTotal", boqTotal);

        summary.put("totalPaid", totalPaid);
        summary.put("remainingBalance", remainingBalance);

        summary.put("totalExpenses", totalExpenses);
        summary.put("currentCashBalance", currentCashBalance);

        summary.put(
                "latestProgressPercentage",
                latestProgressPercentage
        );

        summary.put("startDate", project.getStartDate());
        summary.put("endDate", project.getEndDate());

        return summary;
    }
}
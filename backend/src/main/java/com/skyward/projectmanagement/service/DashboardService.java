package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ClientRepository;
import com.skyward.projectmanagement.repository.PaymentRepository;
import com.skyward.projectmanagement.repository.ProjectExpenseRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;
    private final ProjectExpenseRepository projectExpenseRepository;

    public DashboardService(
            ClientRepository clientRepository,
            ProjectRepository projectRepository,
            PaymentRepository paymentRepository,
            ProjectExpenseRepository projectExpenseRepository) {

        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.paymentRepository = paymentRepository;
        this.projectExpenseRepository = projectExpenseRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        long totalClients = clientRepository.count();
        long totalProjects = projectRepository.count();

        List<Project> projects = projectRepository.findAll();

        long ongoingProjects = projects.stream()
                .filter(project ->
                        project.getStatus() != null &&
                        project.getStatus().equalsIgnoreCase("ONGOING"))
                .count();

        BigDecimal totalProjectValue = projects.stream()
                .map(Project::getBudget)
                .filter(budget -> budget != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayments = paymentRepository.findAll()
                .stream()
                .map(payment -> payment.getAmount())
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = projectExpenseRepository.findAll()
                .stream()
                .map(expense -> expense.getAmount())
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cashBalance = totalPayments.subtract(totalExpenses);

        Map<String, Object> summary = new HashMap<>();

        summary.put("totalClients", totalClients);
        summary.put("totalProjects", totalProjects);
        summary.put("ongoingProjects", ongoingProjects);
        summary.put("totalProjectValue", totalProjectValue);
        summary.put("totalPayments", totalPayments);
        summary.put("totalExpenses", totalExpenses);
        summary.put("cashBalance", cashBalance);

        return summary;
    }
}
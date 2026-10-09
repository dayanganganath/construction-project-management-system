package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.LabourPayment;
import com.skyward.projectmanagement.entity.Worker;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.LabourPaymentRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.WorkerRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class LabourPaymentService {

    private final LabourPaymentRepository labourPaymentRepository;
    private final WorkerRepository workerRepository;
    private final ProjectRepository projectRepository;

    public LabourPaymentService(
            LabourPaymentRepository labourPaymentRepository,
            WorkerRepository workerRepository,
            ProjectRepository projectRepository
    ) {
        this.labourPaymentRepository =
                labourPaymentRepository;

        this.workerRepository =
                workerRepository;

        this.projectRepository =
                projectRepository;
    }

    public List<LabourPayment> getAll() {
        return labourPaymentRepository.findAll();
    }

    public LabourPayment getById(Long id) {
        return labourPaymentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Labour payment not found"
                        )
                );
    }

    public List<LabourPayment> getByProject(
            Long projectId
    ) {
        return labourPaymentRepository
                .findByProjectId(projectId);
    }

    public List<LabourPayment> getByWorker(
            Long workerId
    ) {
        return labourPaymentRepository
                .findByWorkerId(workerId);
    }

    public List<LabourPayment> getByDate(
            LocalDate date
    ) {
        return labourPaymentRepository
                .findByPaymentDate(date);
    }

    public List<LabourPayment> getByProjectAndDate(
            Long projectId,
            LocalDate date
    ) {
        return labourPaymentRepository
                .findByProjectIdAndPaymentDate(
                        projectId,
                        date
                );
    }

    public LabourPayment create(
            LabourPayment payment
    ) {

        validate(payment);

        Worker worker =
                workerRepository
                        .findById(
                                payment
                                        .getWorker()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                )
                        );

        Project project =
                projectRepository
                        .findById(
                                payment
                                        .getProject()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                )
                        );

        payment.setWorker(worker);
        payment.setProject(project);

        if (payment.getStatus() == null) {
            payment.setStatus(
                    LabourPayment.PaymentStatus.PAID
            );
        }

        return labourPaymentRepository
                .save(payment);
    }

    public LabourPayment update(
            Long id,
            LabourPayment updated
    ) {

        validate(updated);

        LabourPayment payment =
                getById(id);

        Worker worker =
                workerRepository
                        .findById(
                                updated
                                        .getWorker()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                )
                        );

        Project project =
                projectRepository
                        .findById(
                                updated
                                        .getProject()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                )
                        );

        payment.setPaymentDate(
                updated.getPaymentDate()
        );

        payment.setAmount(
                updated.getAmount()
        );

        payment.setPaymentMethod(
                updated.getPaymentMethod()
        );

        payment.setStatus(
                updated.getStatus() != null
                        ? updated.getStatus()
                        : LabourPayment.PaymentStatus.PAID
        );

        payment.setReference(
                updated.getReference()
        );

        payment.setNotes(
                updated.getNotes()
        );

        payment.setWorker(worker);
        payment.setProject(project);

        return labourPaymentRepository
                .save(payment);
    }

    public void delete(Long id) {
        LabourPayment payment =
                getById(id);

        labourPaymentRepository
                .delete(payment);
    }

    private void validate(
            LabourPayment payment
    ) {

        if (
                payment.getPaymentDate()
                        == null
        ) {
            throw new RuntimeException(
                    "Payment date is required"
            );
        }

        if (
                payment.getAmount()
                        == null
        ) {
            throw new RuntimeException(
                    "Payment amount is required"
            );
        }

        if (
                payment.getAmount()
                        .compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {
            throw new RuntimeException(
                    "Payment amount must be greater than zero"
            );
        }

        if (
                payment.getPaymentMethod()
                        == null
        ) {
            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        if (
                payment.getWorker()
                        == null
                        ||
                payment
                        .getWorker()
                        .getId()
                        == null
        ) {
            throw new RuntimeException(
                    "Worker ID is required"
            );
        }

        if (
                payment.getProject()
                        == null
                        ||
                payment
                        .getProject()
                        .getId()
                        == null
        ) {
            throw new RuntimeException(
                    "Project ID is required"
            );
        }
    }
}
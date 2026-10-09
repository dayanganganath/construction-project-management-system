package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Worker;
import com.skyward.projectmanagement.repository.WorkerRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;

    public WorkerService(
            WorkerRepository workerRepository
    ) {
        this.workerRepository =
                workerRepository;
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public List<Worker> getActiveWorkers() {
        return workerRepository
                .findByActiveTrue();
    }

    public Worker getWorkerById(Long id) {
        return workerRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Worker not found"
                        )
                );
    }

    public Worker createWorker(
            Worker worker
    ) {
        validate(worker);

        if (worker.getActive() == null) {
            worker.setActive(true);
        }

        return workerRepository
                .save(worker);
    }

    public Worker updateWorker(
            Long id,
            Worker updatedWorker
    ) {
        validate(updatedWorker);

        Worker worker =
                getWorkerById(id);

        worker.setName(
                updatedWorker.getName()
        );

        worker.setNic(
                updatedWorker.getNic()
        );

        worker.setPhone(
                updatedWorker.getPhone()
        );

        worker.setTradeType(
                updatedWorker.getTradeType()
        );

        worker.setDefaultDailyRate(
                updatedWorker
                        .getDefaultDailyRate()
        );

        if (updatedWorker.getActive() != null) {
            worker.setActive(
                    updatedWorker.getActive()
            );
        }

        return workerRepository
                .save(worker);
    }

    public void deleteWorker(Long id) {
        Worker worker =
                getWorkerById(id);

        worker.setActive(false);

        workerRepository.save(worker);
    }

    private void validate(
            Worker worker
    ) {
        if (
                worker.getName() == null
                        ||
                worker.getName().isBlank()
        ) {
            throw new RuntimeException(
                    "Worker name is required"
            );
        }

        if (
                worker.getDefaultDailyRate()
                        == null
        ) {
            worker.setDefaultDailyRate(
                    BigDecimal.ZERO
            );
        }

        if (
                worker.getDefaultDailyRate()
                        .compareTo(
                                BigDecimal.ZERO
                        )
                        < 0
        ) {
            throw new RuntimeException(
                    "Daily rate cannot be negative"
            );
        }
    }
}
package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ContractorBillRepository;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractorBillService {

    private final ContractorBillRepository contractorBillRepository;
    private final ContractorRepository contractorRepository;
    private final ProjectRepository projectRepository;

    public ContractorBillService(
            ContractorBillRepository contractorBillRepository,
            ContractorRepository contractorRepository,
            ProjectRepository projectRepository
    ) {
        this.contractorBillRepository = contractorBillRepository;
        this.contractorRepository = contractorRepository;
        this.projectRepository = projectRepository;
    }

    public List<ContractorBill> getAllBills() {
        return contractorBillRepository.findAll();
    }

    public ContractorBill getBillById(Long id) {
        return contractorBillRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contractor bill not found.")
                );
    }

    public List<ContractorBill> getBillsByProject(Long projectId) {
        return contractorBillRepository.findByProjectId(projectId);
    }

    public List<ContractorBill> getBillsByContractor(Long contractorId) {
        return contractorBillRepository.findByContractorId(contractorId);
    }

    public ContractorBill createBill(ContractorBill bill) {

        Long projectId = bill.getProject().getId();
        Long contractorId = bill.getContractor().getId();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found.")
                );

        Contractor contractor = contractorRepository.findById(contractorId)
                .orElseThrow(() ->
                        new RuntimeException("Contractor not found.")
                );

        bill.setProject(project);
        bill.setContractor(contractor);

        return contractorBillRepository.save(bill);
    }

    public ContractorBill updateBill(
            Long id,
            ContractorBill updatedBill
    ) {
        ContractorBill bill = getBillById(id);

        Long projectId = updatedBill.getProject().getId();
        Long contractorId = updatedBill.getContractor().getId();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found.")
                );

        Contractor contractor = contractorRepository.findById(contractorId)
                .orElseThrow(() ->
                        new RuntimeException("Contractor not found.")
                );

        bill.setBillNumber(updatedBill.getBillNumber());
        bill.setBillDate(updatedBill.getBillDate());
        bill.setPeriodFrom(updatedBill.getPeriodFrom());
        bill.setPeriodTo(updatedBill.getPeriodTo());
        bill.setWorkDescription(updatedBill.getWorkDescription());

        bill.setGrossAmount(updatedBill.getGrossAmount());
        bill.setRetention(updatedBill.getRetention());
        bill.setAdvanceRecovery(updatedBill.getAdvanceRecovery());
        bill.setOtherDeductions(updatedBill.getOtherDeductions());

        bill.setProject(project);
        bill.setContractor(contractor);

        return contractorBillRepository.save(bill);
    }

    public void deleteBill(Long id) {
        contractorBillRepository.deleteById(id);
    }
}
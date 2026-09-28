package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.service.ContractorBillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contractor-bills")
public class ContractorBillController {

    private final ContractorBillService contractorBillService;

    public ContractorBillController(
            ContractorBillService contractorBillService
    ) {
        this.contractorBillService = contractorBillService;
    }

    @GetMapping
    public List<ContractorBill> getAllBills() {
        return contractorBillService.getAllBills();
    }

    @GetMapping("/{id}")
    public ContractorBill getBillById(
            @PathVariable Long id
    ) {
        return contractorBillService.getBillById(id);
    }

    @GetMapping("/project/{projectId}")
    public List<ContractorBill> getBillsByProject(
            @PathVariable Long projectId
    ) {
        return contractorBillService.getBillsByProject(projectId);
    }

    @GetMapping("/contractor/{contractorId}")
    public List<ContractorBill> getBillsByContractor(
            @PathVariable Long contractorId
    ) {
        return contractorBillService.getBillsByContractor(contractorId);
    }

    @PostMapping
    public ContractorBill createBill(
            @RequestBody ContractorBill bill
    ) {
        return contractorBillService.createBill(bill);
    }

    @PutMapping("/{id}")
    public ContractorBill updateBill(
            @PathVariable Long id,
            @RequestBody ContractorBill bill
    ) {
        return contractorBillService.updateBill(id, bill);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(
            @PathVariable Long id
    ) {
        contractorBillService.deleteBill(id);
        return ResponseEntity.ok().build();
    }
}
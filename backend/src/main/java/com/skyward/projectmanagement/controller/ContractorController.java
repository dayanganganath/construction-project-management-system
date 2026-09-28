package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.service.ContractorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contractors")
public class ContractorController {

    private final ContractorService contractorService;

    public ContractorController(
            ContractorService contractorService
    ) {
        this.contractorService = contractorService;
    }

    @GetMapping
    public List<Contractor> getAllContractors() {
        return contractorService.getAllContractors();
    }

    @GetMapping("/{id}")
    public Contractor getContractorById(
            @PathVariable Long id
    ) {
        return contractorService.getContractorById(id);
    }

    @PostMapping
    public Contractor createContractor(
            @RequestBody Contractor contractor
    ) {
        return contractorService.createContractor(
                contractor
        );
    }

    @PutMapping("/{id}")
    public Contractor updateContractor(
            @PathVariable Long id,
            @RequestBody Contractor contractor
    ) {
        return contractorService.updateContractor(
                id,
                contractor
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContractor(
            @PathVariable Long id
    ) {
        contractorService.deleteContractor(id);

        return ResponseEntity.ok().build();
    }
}
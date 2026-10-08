package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ContractorLedgerDto;
import com.skyward.projectmanagement.service.ContractorLedgerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contractor-ledger")
public class ContractorLedgerController {

    private final ContractorLedgerService service;

    public ContractorLedgerController(
            ContractorLedgerService service
    ) {
        this.service = service;
    }

    @GetMapping("/{contractorId}")
    public ResponseEntity<ContractorLedgerDto>
    getContractorLedger(
            @PathVariable Long contractorId
    ) {

        return ResponseEntity.ok(
                service.getLedger(
                        contractorId
                )
        );
    }
}
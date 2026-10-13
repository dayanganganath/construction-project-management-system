package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.service.ContractorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(
        "/api/contractors"
)
public class ContractorController {

    private final ContractorService
            contractorService;

    public ContractorController(
            ContractorService contractorService
    ) {
        this.contractorService =
                contractorService;
    }

    @GetMapping
    public List<Contractor>
    getAllContractors() {

        return contractorService
                .getAllContractors();
    }

    @GetMapping(
            "/{id}"
    )
    public Contractor
    getContractorById(
            @PathVariable Long id
    ) {

        return contractorService
                .getContractorById(id);
    }

    @PostMapping
    public Contractor
    createContractor(
            @RequestBody
            Contractor contractor
    ) {

        return contractorService
                .createContractor(
                        contractor
                );
    }

    @PutMapping(
            "/{id}"
    )
    public Contractor
    updateContractor(
            @PathVariable Long id,

            @RequestBody
            Contractor contractor
    ) {

        return contractorService
                .updateContractor(
                        id,
                        contractor
                );
    }

    /*
     * =========================================================
     * CONTRACTOR LOGIN ACCOUNT
     * =========================================================
     */

    @PutMapping(
            "/{contractorId}/user/{userId}"
    )
    public ResponseEntity<
            Map<String, Object>
            > assignUser(
            @PathVariable Long contractorId,
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                contractorService
                        .assignUser(
                                contractorId,
                                userId
                        )
        );
    }

    @GetMapping(
            "/{contractorId}/user"
    )
    public ResponseEntity<
            Map<String, Object>
            > getLinkedAccount(
            @PathVariable Long contractorId
    ) {

        return ResponseEntity.ok(
                contractorService
                        .getLinkedAccount(
                                contractorId
                        )
        );
    }

    @DeleteMapping(
            "/{contractorId}/user"
    )
    public ResponseEntity<
            Map<String, Object>
            > removeUser(
            @PathVariable Long contractorId
    ) {

        return ResponseEntity.ok(
                contractorService
                        .removeUser(
                                contractorId
                        )
        );
    }

    @DeleteMapping(
            "/{id}"
    )
    public ResponseEntity<Void>
    deleteContractor(
            @PathVariable Long id
    ) {

        contractorService
                .deleteContractor(id);

        return ResponseEntity
                .ok()
                .build();
    }
}
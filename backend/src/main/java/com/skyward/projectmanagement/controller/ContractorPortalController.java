package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.service.ContractorPortalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(
        "/api/contractor"
)
public class ContractorPortalController {

    private final ContractorPortalService
            contractorPortalService;

    public ContractorPortalController(
            ContractorPortalService contractorPortalService
    ) {
        this.contractorPortalService =
                contractorPortalService;
    }

    @GetMapping(
            "/profile"
    )
    public ResponseEntity<
            Map<String, Object>
            > getMyProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyProfile(
                                authentication.getName()
                        )
        );
    }

    @GetMapping(
            "/dashboard"
    )
    public ResponseEntity<
            Map<String, Object>
            > getDashboard(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getDashboard(
                                authentication.getName()
                        )
        );
    }

    @GetMapping(
            "/projects"
    )
    public ResponseEntity<
            List<Map<String, Object>>
            > getMyProjects(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyProjects(
                                authentication.getName()
                        )
        );
    }

    @GetMapping(
            "/bills"
    )
    public ResponseEntity<
            List<Map<String, Object>>
            > getMyBills(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyBills(
                                authentication.getName()
                        )
        );
    }

    @GetMapping(
            "/payments"
    )
    public ResponseEntity<
            List<Map<String, Object>>
            > getMyPayments(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyPayments(
                                authentication.getName()
                        )
        );
    }
}
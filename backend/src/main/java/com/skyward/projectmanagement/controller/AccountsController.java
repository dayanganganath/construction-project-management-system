package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.PaymentRegisterItem;
import com.skyward.projectmanagement.service.AccountsService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountsController {

    private final AccountsService accountsService;

    public AccountsController(
            AccountsService accountsService
    ) {
        this.accountsService =
                accountsService;
    }

    @GetMapping("/payment-register")
    public ResponseEntity<List<PaymentRegisterItem>>
    getPaymentRegister(

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to,

            @RequestParam(required = false)
            Long projectId,

            @RequestParam(required = false)
            String type,

            @RequestParam(required = false)
            String search
    ) {

        return ResponseEntity.ok(
                accountsService.getPaymentRegister(
                        from,
                        to,
                        projectId,
                        type,
                        search
                )
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>>
    getSummary(

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to,

            @RequestParam(required = false)
            Long projectId,

            @RequestParam(required = false)
            String type,

            @RequestParam(required = false)
            String search
    ) {

        return ResponseEntity.ok(
                accountsService.getSummary(
                        from,
                        to,
                        projectId,
                        type,
                        search
                )
        );
    }
}
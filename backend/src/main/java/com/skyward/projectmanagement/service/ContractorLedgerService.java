package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.ContractorLedgerDto;
import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.repository.ContractorBillRepository;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.SubcontractorPaymentRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class ContractorLedgerService {

    private final ContractorRepository contractorRepository;
    private final ContractorBillRepository contractorBillRepository;
    private final SubcontractorPaymentRepository paymentRepository;

    public ContractorLedgerService(
            ContractorRepository contractorRepository,
            ContractorBillRepository contractorBillRepository,
            SubcontractorPaymentRepository paymentRepository
    ) {
        this.contractorRepository = contractorRepository;
        this.contractorBillRepository = contractorBillRepository;
        this.paymentRepository = paymentRepository;
    }

    public ContractorLedgerDto getLedger(
            Long contractorId
    ) {

        Contractor contractor =
                contractorRepository.findById(contractorId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Contractor not found."
                                )
                        );

        List<ContractorBill> bills =
                contractorBillRepository
                        .findByContractorId(contractorId);

        List<SubcontractorPayment> payments =
                paymentRepository
                        .findByContractorId(contractorId);

        ContractorLedgerDto ledger =
                new ContractorLedgerDto();

        ledger.setContractorId(
                contractor.getId()
        );

        ledger.setContractorName(
                contractor.getName()
        );

        ledger.setContractorType(
                contractor.getType()
        );

        ledger.setTradeType(
                contractor.getTradeType()
        );

        ledger.setPhone(
                contractor.getPhone()
        );

        BigDecimal totalGross =
                BigDecimal.ZERO;

        BigDecimal totalNet =
                BigDecimal.ZERO;

        BigDecimal totalPaid =
                BigDecimal.ZERO;

        BigDecimal totalOutstanding =
                BigDecimal.ZERO;

        int paidBills = 0;
        int partiallyPaidBills = 0;
        int unpaidBills = 0;

        for (ContractorBill bill : bills) {

            totalGross =
                    totalGross.add(
                            safe(
                                    bill.getGrossAmount()
                            )
                    );

            totalNet =
                    totalNet.add(
                            safe(
                                    bill.getNetPayable()
                            )
                    );

            totalPaid =
                    totalPaid.add(
                            safe(
                                    bill.getPaidAmount()
                            )
                    );

            totalOutstanding =
                    totalOutstanding.add(
                            safe(
                                    bill.getBalanceAmount()
                            )
                    );

            if (
                    "PAID".equalsIgnoreCase(
                            bill.getStatus()
                    )
            ) {
                paidBills++;

            } else if (
                    "PARTIALLY_PAID".equalsIgnoreCase(
                            bill.getStatus()
                    )
            ) {
                partiallyPaidBills++;

            } else {
                unpaidBills++;
            }

            ContractorLedgerDto.BillItem item =
                    new ContractorLedgerDto.BillItem();

            item.setId(
                    bill.getId()
            );

            item.setBillNumber(
                    bill.getBillNumber()
            );

            item.setBillDate(
                    bill.getBillDate()
            );

            if (bill.getProject() != null) {

                item.setProjectId(
                        bill.getProject().getId()
                );

                item.setProjectName(
                        bill.getProject().getProjectName()
                );

                item.setLocation(
                        bill.getProject().getLocation()
                );
            }

            item.setWorkDescription(
                    bill.getWorkDescription()
            );

            item.setGrossAmount(
                    safe(
                            bill.getGrossAmount()
                    )
            );

            item.setNetPayable(
                    safe(
                            bill.getNetPayable()
                    )
            );

            item.setPaidAmount(
                    safe(
                            bill.getPaidAmount()
                    )
            );

            item.setBalanceAmount(
                    safe(
                            bill.getBalanceAmount()
                    )
            );

            item.setStatus(
                    bill.getStatus()
            );

            ledger.getBills().add(
                    item
            );
        }

        BigDecimal totalPayments =
                BigDecimal.ZERO;

        BigDecimal unallocatedPayments =
                BigDecimal.ZERO;

        for (
                SubcontractorPayment payment :
                payments
        ) {

            BigDecimal amount =
                    safe(
                            payment.getAmount()
                    );

            totalPayments =
                    totalPayments.add(
                            amount
                    );

            if (
                    payment.getContractorBill()
                            == null
            ) {
                unallocatedPayments =
                        unallocatedPayments.add(
                                amount
                        );
            }

            ContractorLedgerDto.PaymentItem item =
                    new ContractorLedgerDto.PaymentItem();

            item.setId(
                    payment.getId()
            );

            item.setPaymentDate(
                    payment.getPaymentDate()
            );

            item.setAmount(
                    amount
            );

            item.setPaymentMethod(
                    payment.getPaymentMethod()
            );

            item.setReferenceNumber(
                    payment.getReferenceNumber()
            );

            item.setNotes(
                    payment.getNotes()
            );

            item.setSlipFileName(
                    payment.getSlipFileName()
            );

            if (
                    payment.getProject() != null
            ) {

                item.setProjectId(
                        payment.getProject().getId()
                );

                item.setProjectName(
                        payment.getProject()
                                .getProjectName()
                );

                item.setLocation(
                        payment.getProject()
                                .getLocation()
                );
            }

            if (
                    payment.getContractorBill()
                            != null
            ) {

                item.setContractorBillId(
                        payment.getContractorBill()
                                .getId()
                );

                item.setBillNumber(
                        payment.getContractorBill()
                                .getBillNumber()
                );
            }

            ledger.getPayments().add(
                    item
            );
        }

        ledger.getBills().sort(
                Comparator.comparing(
                        ContractorLedgerDto.BillItem::getBillDate,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        ledger.getPayments().sort(
                Comparator.comparing(
                        ContractorLedgerDto.PaymentItem::getPaymentDate,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        ledger.setTotalBills(
                bills.size()
        );

        ledger.setPaidBills(
                paidBills
        );

        ledger.setPartiallyPaidBills(
                partiallyPaidBills
        );

        ledger.setUnpaidBills(
                unpaidBills
        );

        ledger.setTotalGrossAmount(
                totalGross
        );

        ledger.setTotalNetPayable(
                totalNet
        );

        ledger.setTotalPaidAmount(
                totalPaid
        );

        ledger.setTotalOutstanding(
                totalOutstanding
        );

        ledger.setTotalPayments(
                totalPayments
        );

        ledger.setUnallocatedPayments(
                unallocatedPayments
        );

        return ledger;
    }

    private BigDecimal safe(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}
package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.repository.ContractorRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentSlipMatchingService {

    private static final String OTHER_NAME =
            "Other / Unmatched";

    private final ContractorRepository contractorRepository;

    public PaymentSlipMatchingService(
            ContractorRepository contractorRepository
    ) {
        this.contractorRepository =
                contractorRepository;
    }

    public Map<String, Object> matchContractor(
            Map<String, Object> extractedData
    ) {

        String extractedAccountNumber =
                normalizeAccountNumber(
                        valueAsString(
                                extractedData.get(
                                        "accountNumber"
                                )
                        )
                );

        String extractedBeneficiaryName =
                normalizeText(
                        valueAsString(
                                extractedData.get(
                                        "beneficiaryName"
                                )
                        )
                );

        String extractedBankName =
                normalizeText(
                        valueAsString(
                                extractedData.get(
                                        "bankName"
                                )
                        )
                );

        List<Contractor> contractors =
                contractorRepository.findByActiveTrue();

        Contractor bestMatch = null;
        int bestScore = 0;

        for (Contractor contractor : contractors) {

            if (
                    contractor.getType() == null ||
                    !"SUBCONTRACTOR".equalsIgnoreCase(
                            contractor.getType()
                    )
            ) {
                continue;
            }

            // Never use the fallback contractor
            // as a real automatic match.
            if (
                    OTHER_NAME.equalsIgnoreCase(
                            contractor.getName()
                    )
            ) {
                continue;
            }

            int score = 0;

            String contractorAccountNumber =
                    normalizeAccountNumber(
                            contractor.getBankAccountNumber()
                    );

            String contractorAccountName =
                    normalizeText(
                            contractor.getBankAccountName()
                    );

            String contractorName =
                    normalizeText(
                            contractor.getName()
                    );

            String contractorBankName =
                    normalizeText(
                            contractor.getBankName()
                    );

            /*
             * Account number is the strongest
             * identifier.
             */
            if (
                    !extractedAccountNumber.isBlank() &&
                    !contractorAccountNumber.isBlank() &&
                    extractedAccountNumber.equals(
                            contractorAccountNumber
                    )
            ) {
                score += 70;
            }

            /*
             * Bank account holder name.
             */
            if (
                    !extractedBeneficiaryName.isBlank() &&
                    !contractorAccountName.isBlank() &&
                    namesMatch(
                            extractedBeneficiaryName,
                            contractorAccountName
                    )
            ) {
                score += 20;
            }

            /*
             * Contractor / subcontractor name.
             */
            if (
                    !extractedBeneficiaryName.isBlank() &&
                    !contractorName.isBlank() &&
                    namesMatch(
                            extractedBeneficiaryName,
                            contractorName
                    )
            ) {
                score += 15;
            }

            /*
             * Bank name.
             */
            if (
                    !extractedBankName.isBlank() &&
                    !contractorBankName.isBlank() &&
                    (
                            extractedBankName.contains(
                                    contractorBankName
                            )
                                    ||
                                    contractorBankName.contains(
                                            extractedBankName
                                    )
                    )
            ) {
                score += 10;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = contractor;
            }
        }

        /*
         * No reliable subcontractor match.
         *
         * Automatically put the payment under
         * Other / Unmatched.
         */
        if (
                bestMatch == null ||
                bestScore < 20
        ) {

            Contractor otherContractor =
                    getOrCreateOtherContractor();

            Map<String, Object> result =
                    new LinkedHashMap<>();

            result.put("matched", false);
            result.put("confidence", "UNMATCHED");
            result.put("score", bestScore);
            result.put(
                    "contractor",
                    buildContractorData(
                            otherContractor
                    )
            );

            result.put(
                    "message",
                    "Subcontractor could not be detected. Assigned to Other / Unmatched."
            );

            return result;
        }

        String confidence;

        if (bestScore >= 70) {
            confidence = "HIGH";
        } else if (bestScore >= 40) {
            confidence = "MEDIUM";
        } else {
            confidence = "LOW";
        }

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("matched", true);
        result.put(
                "confidence",
                confidence
        );

        result.put(
                "score",
                bestScore
        );

        result.put(
                "contractor",
                buildContractorData(
                        bestMatch
                )
        );

        result.put(
                "message",
                "Subcontractor matched successfully."
        );

        return result;
    }

    private Contractor getOrCreateOtherContractor() {

        return contractorRepository
                .findByNameIgnoreCase(
                        OTHER_NAME
                )
                .orElseGet(() -> {

                    Contractor contractor =
                            new Contractor();

                    contractor.setName(
                            OTHER_NAME
                    );

                    contractor.setType(
                            "SUBCONTRACTOR"
                    );

                    contractor.setTradeType(
                            "Unassigned"
                    );

                    contractor.setActive(
                            true
                    );

                    return contractorRepository.save(
                            contractor
                    );
                });
    }

    private Map<String, Object> buildContractorData(
            Contractor contractor
    ) {

        Map<String, Object> data =
                new LinkedHashMap<>();

        data.put(
                "id",
                contractor.getId()
        );

        data.put(
                "name",
                contractor.getName()
        );

        data.put(
                "type",
                contractor.getType()
        );

        data.put(
                "tradeType",
                contractor.getTradeType()
        );

        data.put(
                "bankName",
                contractor.getBankName()
        );

        data.put(
                "bankAccountName",
                contractor.getBankAccountName()
        );

        data.put(
                "bankAccountNumber",
                contractor.getBankAccountNumber()
        );

        return data;
    }

    private boolean namesMatch(
            String first,
            String second
    ) {

        if (
                first == null ||
                second == null ||
                first.isBlank() ||
                second.isBlank()
        ) {
            return false;
        }

        if (
                first.equals(second) ||
                first.contains(second) ||
                second.contains(first)
        ) {
            return true;
        }

        String[] firstWords =
                first.split("\\s+");

        String[] secondWords =
                second.split("\\s+");

        int matchingWords = 0;

        for (String firstWord : firstWords) {

            if (firstWord.length() < 3) {
                continue;
            }

            for (String secondWord : secondWords) {

                if (
                        secondWord.length() >= 3 &&
                        firstWord.equals(
                                secondWord
                        )
                ) {
                    matchingWords++;
                    break;
                }
            }
        }

        return matchingWords >= 2;
    }

    private String normalizeAccountNumber(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value
                .replaceAll(
                        "[^0-9]",
                        ""
                )
                .trim();
    }

    private String normalizeText(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value
                .toLowerCase()
                .replaceAll(
                        "[^a-z0-9 ]",
                        " "
                )
                .replaceAll(
                        "\\s+",
                        " "
                )
                .trim();
    }

    private String valueAsString(
            Object value
    ) {

        if (value == null) {
            return "";
        }

        return value.toString();
    }
}
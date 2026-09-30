package com.skyward.projectmanagement.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PaymentSlipExtractionService {

    public Map<String, Object> extractFromPdf(String filePath) throws IOException {

        File file = new File(filePath);

        if (!file.exists()) {
            throw new IOException("Payment slip file not found.");
        }

        String text;

        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            text = stripper.getText(document);
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("amount", extractAmount(text));
        result.put("date", extractDate(text));
        result.put("referenceNumber", extractReferenceNumber(text));
        result.put("accountNumber", extractAccountNumber(text));
        result.put("beneficiaryName", extractBeneficiaryName(text));
        result.put("bankName", extractBankName(text));
        result.put("rawText", text);

        return result;
    }

    private BigDecimal extractAmount(String text) {

        if (isBlank(text)) {
            return null;
        }

        Pattern[] patterns = new Pattern[]{

                Pattern.compile(
                        "(?i)(?:transfer amount|transaction amount|paid amount|amount paid|amount)\\s*[:\\-]?\\s*(?:LKR|Rs\\.?|රු\\.?)?\\s*([0-9,]+(?:\\.\\d{1,2})?)"
                ),

                Pattern.compile(
                        "(?i)(?:LKR|Rs\\.?)\\s*([0-9,]+(?:\\.\\d{1,2})?)"
                )
        };

        for (Pattern pattern : patterns) {

            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {

                String value = matcher
                        .group(1)
                        .replace(",", "")
                        .trim();

                try {
                    return new BigDecimal(value);
                } catch (NumberFormatException ignored) {
                }
            }
        }

        return null;
    }

    private String extractReferenceNumber(String text) {

        if (isBlank(text)) {
            return null;
        }

        Pattern[] patterns = new Pattern[]{

                Pattern.compile(
                        "(?i)(?:transaction reference|transaction ref|reference number|reference no|ref no|transaction id|transaction no|transaction number)\\s*[:\\-]?\\s*([A-Z0-9\\-/]+)"
                ),

                Pattern.compile(
                        "(?i)(?:reference|ref)\\s*[:\\-]\\s*([A-Z0-9\\-/]+)"
                )
        };

        for (Pattern pattern : patterns) {

            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                return cleanText(matcher.group(1));
            }
        }

        return null;
    }

    private String extractAccountNumber(String text) {

        if (isBlank(text)) {
            return null;
        }

        Pattern[] patterns = new Pattern[]{

                Pattern.compile(
                        "(?i)(?:beneficiary account number|beneficiary account no|account number|account no|a/c no|acc no)\\s*[:\\-]?\\s*([0-9\\- ]{6,30})"
                ),

                Pattern.compile(
                        "(?i)(?:credited account|credit account)\\s*[:\\-]?\\s*([0-9\\- ]{6,30})"
                )
        };

        for (Pattern pattern : patterns) {

            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                return normalizeAccountNumber(
                        matcher.group(1)
                );
            }
        }

        return null;
    }

    private String extractBeneficiaryName(String text) {

        if (isBlank(text)) {
            return null;
        }

        Pattern[] patterns = new Pattern[]{

                Pattern.compile(
                        "(?im)(?:beneficiary name|beneficiary|receiver name|recipient name|payee name|account name)\\s*[:\\-]?\\s*([^\\r\\n]+)"
                ),

                Pattern.compile(
                        "(?im)(?:credited to|paid to|transferred to)\\s*[:\\-]?\\s*([^\\r\\n]+)"
                )
        };

        for (Pattern pattern : patterns) {

            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {

                String value = cleanText(
                        matcher.group(1)
                );

                if (!value.isBlank()) {
                    return value;
                }
            }
        }

        return null;
    }

    private String extractBankName(String text) {

        if (isBlank(text)) {
            return null;
        }

        Pattern pattern = Pattern.compile(
                "(?i)\\b(" +
                        "Commercial Bank|" +
                        "Sampath Bank|" +
                        "Hatton National Bank|" +
                        "HNB|" +
                        "Bank of Ceylon|" +
                        "BOC|" +
                        "People'?s Bank|" +
                        "Nations Trust Bank|" +
                        "NTB|" +
                        "DFCC Bank|" +
                        "NDB Bank|" +
                        "Seylan Bank|" +
                        "Pan Asia Bank|" +
                        "Union Bank|" +
                        "Cargills Bank|" +
                        "Amana Bank|" +
                        "HSBC|" +
                        "Standard Chartered" +
                        ")\\b"
        );

        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return cleanText(matcher.group(1));
        }

        Pattern genericPattern = Pattern.compile(
                "(?im)(?:beneficiary bank|receiver bank|bank name|bank)\\s*[:\\-]?\\s*([^\\r\\n]+)"
        );

        Matcher genericMatcher =
                genericPattern.matcher(text);

        if (genericMatcher.find()) {

            String value = cleanText(
                    genericMatcher.group(1)
            );

            if (!value.isBlank()) {
                return value;
            }
        }

        return null;
    }

    private LocalDate extractDate(String text) {

        if (isBlank(text)) {
            return null;
        }

        Pattern[] patterns = new Pattern[]{

                Pattern.compile(
                        "(?i)(?:transaction date|transfer date|payment date|date)\\s*[:\\-]?\\s*(\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}|\\d{1,2}[-/]\\d{1,2}[-/]\\d{4})"
                ),

                Pattern.compile(
                        "\\b(\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}|\\d{1,2}[-/]\\d{1,2}[-/]\\d{4})\\b"
                )
        };

        DateTimeFormatter[] formatters =
                new DateTimeFormatter[]{

                        DateTimeFormatter.ofPattern(
                                "yyyy-MM-dd"
                        ),

                        DateTimeFormatter.ofPattern(
                                "yyyy/MM/dd"
                        ),

                        DateTimeFormatter.ofPattern(
                                "dd-MM-yyyy"
                        ),

                        DateTimeFormatter.ofPattern(
                                "dd/MM/yyyy"
                        )
                };

        for (Pattern pattern : patterns) {

            Matcher matcher = pattern.matcher(text);

            while (matcher.find()) {

                String dateText =
                        matcher.group(1);

                for (
                        DateTimeFormatter formatter :
                        formatters
                ) {
                    try {
                        return LocalDate.parse(
                                dateText,
                                formatter
                        );
                    } catch (
                            DateTimeParseException ignored
                    ) {
                    }
                }
            }
        }

        return null;
    }

    private String normalizeAccountNumber(
            String value
    ) {

        if (value == null) {
            return null;
        }

        return value
                .replaceAll("[^0-9]", "")
                .trim();
    }

    private String cleanText(
            String value
    ) {

        if (value == null) {
            return null;
        }

        return value
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean isBlank(
            String value
    ) {
        return value == null ||
                value.trim().isEmpty();
    }
}
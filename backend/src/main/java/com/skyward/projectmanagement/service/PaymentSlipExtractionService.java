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
import java.util.HashMap;
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

        Map<String, Object> result = new HashMap<>();

        result.put("rawText", text);
        result.put("amount", extractAmount(text));
        result.put("referenceNumber", extractReferenceNumber(text));
        result.put("date", extractDate(text));
        result.put("accountNumber", extractAccountNumber(text));

        return result;
    }

    private BigDecimal extractAmount(String text) {

        if (text == null || text.isBlank()) {
            return null;
        }

        Pattern[] patterns = new Pattern[] {
                Pattern.compile(
                        "(?i)(?:amount|paid amount|transfer amount|transaction amount)\\s*[:\\-]?\\s*(?:LKR|Rs\\.?|රු\\.?\\s*)?([0-9,]+(?:\\.\\d{1,2})?)"
                ),
                Pattern.compile(
                        "(?i)(?:LKR|Rs\\.?)\\s*([0-9,]+(?:\\.\\d{1,2})?)"
                )
        };

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                String amountText = matcher.group(1).replace(",", "");

                try {
                    return new BigDecimal(amountText);
                } catch (NumberFormatException ignored) {
                }
            }
        }

        return null;
    }

    private String extractReferenceNumber(String text) {

        if (text == null || text.isBlank()) {
            return null;
        }

        Pattern pattern = Pattern.compile(
                "(?i)(?:reference|reference no|reference number|transaction id|transaction no|transaction number|ref no)\\s*[:\\-]?\\s*([A-Z0-9\\-/]+)"
        );

        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }

    private String extractAccountNumber(String text) {

        if (text == null || text.isBlank()) {
            return null;
        }

        Pattern pattern = Pattern.compile(
                "(?i)(?:account number|account no|a/c no|acc no)\\s*[:\\-]?\\s*([0-9\\- ]{6,25})"
        );

        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group(1)
                    .replace(" ", "")
                    .trim();
        }

        return null;
    }

    private LocalDate extractDate(String text) {

        if (text == null || text.isBlank()) {
            return null;
        }

        Pattern pattern = Pattern.compile(
                "\\b(\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}|\\d{1,2}[-/]\\d{1,2}[-/]\\d{4})\\b"
        );

        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {

            String dateText = matcher.group(1);

            DateTimeFormatter[] formatters = new DateTimeFormatter[] {
                    DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                    DateTimeFormatter.ofPattern("yyyy/MM/dd"),
                    DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                    DateTimeFormatter.ofPattern("dd/MM/yyyy")
            };

            for (DateTimeFormatter formatter : formatters) {
                try {
                    return LocalDate.parse(dateText, formatter);
                } catch (DateTimeParseException ignored) {
                }
            }
        }

        return null;
    }
}
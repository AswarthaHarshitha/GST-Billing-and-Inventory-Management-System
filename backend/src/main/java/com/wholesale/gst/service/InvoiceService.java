package com.wholesale.gst.service;

import com.wholesale.gst.model.*;
import com.wholesale.gst.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;

    // Your business state code (Andhra Pradesh = 37)
    private static final String SELLER_STATE_CODE = "37";
    private static final String SELLER_GSTIN = "37XXXXX1234X1ZX"; // Replace with actual GSTIN

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        // Generate invoice number: INV-2024-0001
        Long maxId = invoiceRepo.findMaxId().orElse(0L);
        String year = String.valueOf(LocalDate.now().getYear());
        invoice.setInvoiceNumber("INV-" + year + "-" + String.format("%04d", maxId + 1));
        invoice.setSellerGstin(SELLER_GSTIN);

        // Determine supply type (interstate vs intrastate)
        Customer customer = invoice.getCustomer();
        boolean isInterstate = customer.getStateCode() != null &&
                               !customer.getStateCode().equals(SELLER_STATE_CODE);
        invoice.setSupplyType(isInterstate ? "INTERSTATE" : "INTRASTATE");

        // Calculate GST for each item
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalCgst = BigDecimal.ZERO;
        BigDecimal totalSgst = BigDecimal.ZERO;
        BigDecimal totalIgst = BigDecimal.ZERO;

        for (InvoiceItem item : invoice.getItems()) {
            item.setInvoice(invoice);

            // Fetch product details
            Product product = productRepo.findById(item.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

            item.setProductName(product.getName());
            item.setHsnCode(product.getHsnCode());
            item.setUnit(product.getUnit());
            item.setGstRate(product.getGstRate());

            // Taxable value = qty * rate
            BigDecimal taxableValue = item.getQuantity()
                .multiply(item.getRate())
                .setScale(2, RoundingMode.HALF_UP);
            item.setTaxableValue(taxableValue);

            BigDecimal gstRate = product.getGstRate();
            BigDecimal itemTotal;

            if (isInterstate) {
                // IGST only
                BigDecimal igstAmt = taxableValue.multiply(gstRate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                item.setIgstRate(gstRate);
                item.setIgstAmount(igstAmt);
                item.setCgstAmount(BigDecimal.ZERO);
                item.setSgstAmount(BigDecimal.ZERO);
                item.setCgstRate(BigDecimal.ZERO);
                item.setSgstRate(BigDecimal.ZERO);
                totalIgst = totalIgst.add(igstAmt);
                itemTotal = taxableValue.add(igstAmt);
            } else {
                // CGST + SGST (split equally)
                BigDecimal halfRate = gstRate.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                BigDecimal cgstAmt = taxableValue.multiply(halfRate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                BigDecimal sgstAmt = cgstAmt; // Equal split
                item.setCgstRate(halfRate);
                item.setSgstRate(halfRate);
                item.setCgstAmount(cgstAmt);
                item.setSgstAmount(sgstAmt);
                item.setIgstRate(BigDecimal.ZERO);
                item.setIgstAmount(BigDecimal.ZERO);
                totalCgst = totalCgst.add(cgstAmt);
                totalSgst = totalSgst.add(sgstAmt);
                itemTotal = taxableValue.add(cgstAmt).add(sgstAmt);
            }

            item.setTotalAmount(itemTotal.setScale(2, RoundingMode.HALF_UP));
            subtotal = subtotal.add(taxableValue);

            // Deduct from inventory
            int newStock = product.getStockQty() - item.getQuantity().intValue();
            if (newStock < 0) throw new RuntimeException("Insufficient stock for: " + product.getName());
            product.setStockQty(newStock);
            productRepo.save(product);
        }

        invoice.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        invoice.setCgstAmount(totalCgst.setScale(2, RoundingMode.HALF_UP));
        invoice.setSgstAmount(totalSgst.setScale(2, RoundingMode.HALF_UP));
        invoice.setIgstAmount(totalIgst.setScale(2, RoundingMode.HALF_UP));
        invoice.setTotalTax(totalCgst.add(totalSgst).add(totalIgst).setScale(2, RoundingMode.HALF_UP));
        invoice.setGrandTotal(subtotal.add(invoice.getTotalTax()).setScale(2, RoundingMode.HALF_UP));

        return invoiceRepo.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepo.findAll();
    }

    public Invoice getById(Long id) {
        return invoiceRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public List<Invoice> getByDateRange(LocalDate from, LocalDate to) {
        return invoiceRepo.findByInvoiceDateBetween(from, to);
    }

    public Map<String, Object> getGstReport(LocalDate from, LocalDate to) {
        return Map.of(
            "fromDate", from,
            "toDate", to,
            "totalInvoices", invoiceRepo.countByInvoiceDateBetween(from, to),
            "taxableValue", invoiceRepo.totalTaxableValueBetween(from, to),
            "cgst", invoiceRepo.totalCgstBetween(from, to),
            "sgst", invoiceRepo.totalSgstBetween(from, to),
            "igst", invoiceRepo.totalIgstBetween(from, to),
            "totalTax", invoiceRepo.totalTaxBetween(from, to),
            "grandTotal", invoiceRepo.totalSalesBetween(from, to)
        );
    }
}

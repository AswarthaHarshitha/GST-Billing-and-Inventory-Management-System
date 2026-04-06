package com.wholesale.gst.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;   // Auto-generated: INV-2024-0001

    @Column(nullable = false)
    private LocalDate invoiceDate;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<InvoiceItem> items;

    // Amount fields
    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;     // Before tax

    @Column(precision = 12, scale = 2)
    private BigDecimal cgstAmount;   // Central GST

    @Column(precision = 12, scale = 2)
    private BigDecimal sgstAmount;   // State GST

    @Column(precision = 12, scale = 2)
    private BigDecimal igstAmount;   // Integrated GST (interstate)

    @Column(precision = 12, scale = 2)
    private BigDecimal totalTax;

    @Column(precision = 12, scale = 2)
    private BigDecimal grandTotal;

    // GST fields
    private String supplyType;       // INTRASTATE / INTERSTATE
    private String paymentStatus;    // PAID / PENDING / PARTIAL

    // Your business GSTIN
    private String sellerGstin;

    private String notes;
}
